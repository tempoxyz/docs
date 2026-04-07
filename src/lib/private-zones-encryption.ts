import { Bytes, Hash, Hex as OxHex, PublicKey, Secp256k1 } from 'ox'
import { type Address, encodeFunctionData, type Hex, numberToHex, parseAbi } from 'viem'

export const zeroBytes32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

export const zonePortalDepositAbi = parseAbi([
  'function calculateDepositFee() view returns (uint128)',
  'function sequencerEncryptionKey() view returns (bytes32 x, uint8 yParity)',
  'function encryptionKeyCount() view returns (uint256)',
  'function depositEncrypted(address token, uint128 amount, uint256 keyIndex, (bytes32 ephemeralPubkeyX, uint8 ephemeralPubkeyYParity, bytes ciphertext, bytes12 nonce, bytes16 tag) encrypted) returns (bytes32)',
])

export type SequencerEncryptionKey =
  | {
      x: Hex
      yParity: number
    }
  | readonly [Hex, number]

export type EncryptedDepositPayload = {
  ciphertext: Hex
  ephemeralPubkeyX: Hex
  ephemeralPubkeyYParity: number
  nonce: Hex
  tag: Hex
}

function normalizeSec1Parity(yParity: number) {
  if (yParity === 0 || yParity === 1) return yParity + 2
  if (yParity === 2 || yParity === 3) return yParity

  throw new Error(`Unexpected yParity: ${yParity}`)
}

function hkdf256(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array) {
  const prk = Hash.hmac256(salt, ikm, { as: 'Bytes' })
  return Hash.hmac256(prk, Bytes.concat(info, Uint8Array.from([1])), { as: 'Bytes' })
}

function normalizeSequencerEncryptionKey(key: SequencerEncryptionKey): { x: Hex; yParity: number } {
  if ('x' in key) {
    return {
      x: key.x,
      yParity: key.yParity,
    }
  }

  return {
    x: key[0],
    yParity: key[1],
  }
}

export async function encryptZoneDepositPayload(parameters: {
  keyIndex: bigint
  memo?: Hex | undefined
  portalAddress: Address
  recipient: Address
  sequencerKey: SequencerEncryptionKey
}) {
  const { privateKey: ephemeralPrivateKey, publicKey: ephemeralPublicKey } =
    Secp256k1.createKeyPair()
  const sequencerKey = normalizeSequencerEncryptionKey(parameters.sequencerKey)

  const sequencerPublicKey = PublicKey.from({
    prefix: normalizeSec1Parity(sequencerKey.yParity),
    x: BigInt(sequencerKey.x),
  })

  const sharedSecret = Secp256k1.getSharedSecret({
    as: 'Bytes',
    privateKey: ephemeralPrivateKey,
    publicKey: sequencerPublicKey,
  })

  const compressedEphemeralKey = PublicKey.compress(ephemeralPublicKey)
  const ephemeralPubkeyX = numberToHex(compressedEphemeralKey.x, { size: 32 })
  const sharedSecretX = sharedSecret.slice(1, 33)

  const hkdfInfo = Bytes.concat(
    Bytes.from(parameters.portalAddress),
    Bytes.from(numberToHex(parameters.keyIndex, { size: 32 })),
    Bytes.from(ephemeralPubkeyX),
  )
  const aesKeyBytes = hkdf256(sharedSecretX, new TextEncoder().encode('ecies-aes-key'), hkdfInfo)
  const aesKey = await crypto.subtle.importKey(
    'raw',
    Uint8Array.from(aesKeyBytes),
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  const plaintext = Uint8Array.from(
    Bytes.concat(
      Bytes.from(parameters.recipient),
      Bytes.from(parameters.memo ?? zeroBytes32),
      new Uint8Array(12),
    ),
  )
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plaintext),
  )

  return {
    ciphertext: OxHex.from(sealed.slice(0, -16)),
    ephemeralPubkeyX,
    ephemeralPubkeyYParity: compressedEphemeralKey.prefix,
    nonce: OxHex.from(nonce),
    tag: OxHex.from(sealed.slice(-16)),
  } satisfies EncryptedDepositPayload
}

export function encodeEncryptedDepositCall(parameters: {
  amount: bigint
  encrypted: EncryptedDepositPayload
  keyIndex: bigint
  portalAddress: Address
  token: Address
}) {
  return {
    data: encodeFunctionData({
      abi: zonePortalDepositAbi,
      functionName: 'depositEncrypted',
      args: [parameters.token, parameters.amount, parameters.keyIndex, parameters.encrypted],
    }),
    to: parameters.portalAddress,
  }
}

export function getNetZoneDepositAmount(amount: bigint, depositFee: bigint) {
  if (depositFee > amount) {
    throw new Error(
      `Zone portal deposit fee ${depositFee.toString()} is greater than deposit amount ${amount.toString()}.`,
    )
  }

  return amount - depositFee
}
