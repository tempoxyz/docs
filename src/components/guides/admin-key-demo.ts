import { type Address, type Hex, isAddress, zeroHash } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Abis, Account, Addresses, createClient } from 'viem/tempo'

export const adminKeyDemoStorageKey = 'tempo-docs:admin-key-demo:v1'
export const adminKeyDemoFeeToken = '0x20c0000000000000000000000000000000000001'

export function adminKeyDemoEnvironment(url: string, secure: boolean, webAuthn: boolean) {
  const location = new URL(url)
  if (/^127\./.test(location.hostname) || location.hostname === '[::1]') {
    location.hostname = 'localhost'
    return {
      localhostUrl: location.href,
      message:
        'Passkeys require a hostname. Open this demo on localhost to create your test account.',
    }
  }
  if (!secure || /^\d+\.\d+\.\d+\.\d+$/.test(location.hostname) || location.hostname.includes(':'))
    return { message: 'Open this demo on an HTTPS hostname or localhost to use passkeys.' }
  if (!webAuthn)
    return {
      message:
        'This browser does not support passkeys. Open this page in a passkey-capable browser.',
    }
  return null
}

export function adminKeyCredentialError(cause: unknown): string {
  const seen = new Set<unknown>()
  while (cause instanceof Error && !seen.has(cause)) {
    seen.add(cause)
    if (cause.name === 'NotAllowedError')
      return 'Passkey creation was cancelled or timed out. Select Create test account to try again.'
    if (cause.name === 'SecurityError')
      return 'The browser rejected this site’s passkey request. Open the demo on localhost or an HTTPS hostname.'
    if (cause.name === 'NotSupportedError')
      return 'Your browser or authenticator cannot create this passkey. Try a passkey-capable browser or device.'
    cause = cause.cause
  }
  return 'Could not create a passkey. Open this page in a passkey-capable browser and try again.'
}

export type AdminKeyDemoSession = {
  credential: { id: string; publicKey: Hex }
  rpId: string
  key?: {
    address: Address
    authorizationHash?: Hex
    revocationHash?: Hex
  }
}

/** Store only public credential and transaction data, never a signing key. */
export function serializeAdminKeyDemoSession(session: AdminKeyDemoSession) {
  return JSON.stringify({
    credential: { id: session.credential.id, publicKey: session.credential.publicKey },
    rpId: session.rpId,
    ...(session.key
      ? {
          key: {
            address: session.key.address,
            authorizationHash: session.key.authorizationHash,
            revocationHash: session.key.revocationHash,
          },
        }
      : {}),
  })
}

export function parseAdminKeyDemoSession(
  value: string | null,
  rpId: string,
): AdminKeyDemoSession | null {
  if (!value) return null
  try {
    const session = JSON.parse(value)
    if (
      session?.rpId !== rpId ||
      typeof session.credential?.id !== 'string' ||
      !session.credential.id ||
      typeof session.credential.publicKey !== 'string' ||
      !/^0x[0-9a-fA-F]{128}$/.test(session.credential.publicKey)
    )
      return null
    if (
      session.key &&
      (!isAddress(session.key.address) ||
        [session.key.authorizationHash, session.key.revocationHash].some(
          (hash) => hash !== undefined && !/^0x[0-9a-fA-F]{64}$/.test(hash),
        ))
    )
      return null
    // Validate the public key before using it to reconstruct a signer.
    Account.fromWebAuthnP256(session.credential, { rpId })
    return JSON.parse(serializeAdminKeyDemoSession(session)) as AdminKeyDemoSession
  } catch {
    return null
  }
}

export function createAdminKeyDemoClient(session: AdminKeyDemoSession) {
  return createClient({
    account: Account.fromWebAuthnP256(session.credential, { rpId: session.rpId }),
    chain: tempoModerato,
    feeToken: adminKeyDemoFeeToken,
  })
}

export type AdminKeyDemoStatus = 'unregistered' | 'active' | 'revoked'

/**
 * Viem 2.57.18 and later drop admin access keys, which T14 retires, so the demo calls the Account
 * Keychain precompile directly.
 */
const keychain = { address: Addresses.accountKeychain, abi: Abis.accountKeychain } as const

/** The precompile's signature type for a P256 key. */
const p256SignatureType = 1

/** Authorizes `key` as an admin access key of the client's account. */
export async function authorizeAdminKeyDemoKey(
  client: Pick<ReturnType<typeof createAdminKeyDemoClient>, 'writeContractSync'>,
  key: Address,
) {
  return await client.writeContractSync({
    ...keychain,
    functionName: 'authorizeAdminKey',
    args: [key, p256SignatureType, zeroHash],
  })
}

export async function readAdminKeyDemoStatus(
  client: {
    account: { address: Address }
    accessKey: Pick<ReturnType<typeof createAdminKeyDemoClient>['accessKey'], 'getMetadata'>
    readContract: ReturnType<typeof createAdminKeyDemoClient>['readContract']
  },
  key: Address,
): Promise<AdminKeyDemoStatus> {
  const [isAdmin, metadata] = await Promise.all([
    client.readContract({
      ...keychain,
      functionName: 'isAdminKey',
      args: [client.account.address, key],
    }),
    client.accessKey.getMetadata({ accessKey: key }),
  ])
  if (metadata.isRevoked) return 'revoked'
  return isAdmin ? 'active' : 'unregistered'
}
