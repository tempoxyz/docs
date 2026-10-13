import { P256 } from 'ox-zk'
import { SignatureEnvelope, TxEnvelopeTempo, ZkSignature } from 'ox-zk/tempo'
import { decodeFunctionData, type Hex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import * as Tempo from 'viem/tempo'
import { describe, expect, it } from 'vitest'
import {
  authorizeKeyCall,
  callbackMessageType,
  callbackUrl,
  checkRelay,
  chooseApprovers,
  configurableSignature,
  googleIssuer,
  issuerFor,
  type LoginCredential,
  LoginError,
  loginAccountNouns,
  loginApprovalGas,
  loginGas,
  loginIdentity,
  loginMethods,
  loginOwner,
  loginPromptLabels,
  maskEmail,
  maskPhone,
  maskPrivyIdentity,
  needsSignIn,
  nextConfig,
  parseCallback,
  prepareLogin,
  relayMethods,
  relayOrigin,
  revokeKeyCall,
  shortenDid,
  signConfigurableTransaction,
  updateConfigCall,
} from './account-sandbox-oidc'

type Address = `0x${string}`
const token: Address = '0x20C0000000000000000000000000000000000001'
const now = () => Math.floor(Date.now() / 1_000)

/** A well-formed credential. Its proof is fake, so devnet would reject it; encoding is real. */
function credential(overrides: Partial<LoginCredential> = {}): LoginCredential {
  return {
    addressSeed: `0x${'01'.repeat(32)}`,
    issuedAt: now() - 10,
    issuer: `0x${'02'.repeat(32)}`,
    keyHash: `0x${'03'.repeat(32)}`,
    proof: `0x${'04'.repeat(256)}`,
    publisherId: `0x${'05'.repeat(32)}`,
    scheme: 1,
    validUntil: now() + 300,
    ...overrides,
  }
}

const keyAccount = (privateKey = generatePrivateKey()) => Tempo.Account.fromSecp256k1(privateKey)

describe('relay probe', () => {
  it('derives methods from issuers, or takes an explicit list', () => {
    expect(relayMethods({ issuers: [googleIssuer, relayOrigin] })).toEqual(['email', 'google'])
    expect(relayMethods({ issuers: [relayOrigin] })).toEqual(['email'])
    expect(relayMethods({ issuers: [googleIssuer], methods: ['sms', 'email', 'workos'] })).toEqual([
      'email',
      'sms',
    ])
    // Privy shares the relay's issuer, so only an explicit `methods` entry offers it.
    expect(relayMethods({ issuers: [relayOrigin], methods: ['privy', 'google', 'email'] })).toEqual(
      ['email', 'google', 'privy'],
    )
    expect(relayMethods({ issuers: [googleIssuer, relayOrigin] })).not.toContain('privy')
  })

  it('offers Privy when the relay config lists it', async () => {
    const config = {
      chainId: 31_318,
      issuers: [googleIssuer, relayOrigin],
      methods: ['email', 'google', 'privy'],
    }
    const fetchOk = (async () => Response.json(config)) as unknown as typeof fetch
    await expect(checkRelay({ fetch: fetchOk, protocol: 'http:' })).resolves.toMatchObject({
      methods: ['email', 'google', 'privy'],
    })
  })

  it('accepts only chain 31318 over http', async () => {
    const config = { chainId: 31_318, issuers: [googleIssuer, 'http://localhost:5173'] }
    const fetchOk = (async () => Response.json(config)) as unknown as typeof fetch
    await expect(checkRelay({ fetch: fetchOk, protocol: 'http:' })).resolves.toEqual({
      chainId: 31_318,
      issuers: config.issuers,
      methods: ['email', 'google'],
    })
    await expect(checkRelay({ fetch: fetchOk, protocol: 'https:' })).resolves.toBeNull()
    const wrongChain = (async () =>
      Response.json({ ...config, chainId: 4217 })) as unknown as typeof fetch
    await expect(checkRelay({ fetch: wrongChain, protocol: 'http:' })).resolves.toBeNull()
    const down = (async () => {
      throw new TypeError('Failed to fetch')
    }) as unknown as typeof fetch
    await expect(checkRelay({ fetch: down, protocol: 'http:' })).resolves.toBeNull()
    const unavailable = (async () =>
      Response.json({ error: 'unreachable' }, { status: 503 })) as unknown as typeof fetch
    await expect(checkRelay({ fetch: unavailable, protocol: 'http:' })).resolves.toBeNull()
  })
})

describe('SMS availability', () => {
  const config = {
    chainId: 31_318,
    issuers: [googleIssuer, 'http://localhost:5173'],
    methods: ['email', 'sms', 'google', 'workos'],
  }
  const relayWith = (gateway: 'up' | 'down') =>
    (async (input: string | URL | Request) => {
      if (String(input).endsWith('/api/config')) return Response.json(config)
      if (gateway === 'down') throw new TypeError('Failed to fetch')
      return new Response(null, { status: 404 })
    }) as unknown as typeof fetch

  it('offers SMS only while the gateway answers', async () => {
    const up = await checkRelay({ fetch: relayWith('up'), protocol: 'http:' })
    expect(up?.methods).toEqual(['email', 'google', 'sms'])
    const down = await checkRelay({ fetch: relayWith('down'), protocol: 'http:' })
    expect(down?.methods).toEqual(['email', 'google'])
    const skipped = await checkRelay({
      fetch: relayWith('up'),
      protocol: 'http:',
      smsGateway: false,
    })
    expect(skipped?.methods).toEqual(['email', 'google'])
  })
})

describe('sign-in', () => {
  it('commits to a fresh P-256 key for 540 seconds', () => {
    const prepared = prepareLogin({ now: 1_000_000.7 })
    expect(prepared.validUntil).toBe(1_000_540)
    expect(prepared.blinding).toMatch(/^0x[0-9a-f]{64}$/)
    const owner = loginOwner({
      credential: credential(),
      privateKey: prepared.privateKey,
      method: 'email',
    })
    expect(owner.accessKeyAddress.toLowerCase()).toBe(prepared.accessKeyAddress.toLowerCase())
  })

  it('builds the callback URL and reads the callback message', () => {
    expect(callbackUrl('http://localhost:5179', 'abc')).toBe(
      'http://localhost:5179/oidc-callback.html?request=abc',
    )
    const value = credential()
    const message = {
      type: callbackMessageType,
      request: 'abc',
      credential: JSON.stringify(value),
      email: 'liam@tempo.xyz',
    }
    expect(parseCallback(message, 'abc')).toEqual({ credential: value, email: 'liam@tempo.xyz' })
    expect(parseCallback(message, 'other')).toBeNull()
    expect(parseCallback({ ...message, type: 'other' }, 'abc')).toBeNull()
    expect(parseCallback({ ...message, credential: null, error: 'Wrong code' }, 'abc')).toEqual({
      error: 'Wrong code',
    })
    expect(parseCallback({ ...message, credential: '{"scheme":1}' }, 'abc')).toEqual({
      error: 'The local auth app returned a malformed credential.',
    })
  })

  it('reads a Privy callback’s DID and verified email', () => {
    const value = credential()
    const message = {
      type: callbackMessageType,
      request: 'abc',
      credential: JSON.stringify(value),
      privy: 'did:privy:cmabcdefghijklmnop7xyz',
      email: 'liam@tempo.xyz',
      phone: null,
    }
    expect(parseCallback(message, 'abc')).toEqual({
      credential: value,
      email: 'liam@tempo.xyz',
      privy: 'did:privy:cmabcdefghijklmnop7xyz',
    })
    expect(parseCallback({ ...message, email: null }, 'abc')).toEqual({
      credential: value,
      privy: 'did:privy:cmabcdefghijklmnop7xyz',
    })
  })

  it('names the issuer per method', () => {
    expect(issuerFor('google')).toBe(googleIssuer)
    expect(issuerFor('email')).toBe(relayOrigin)
    expect(issuerFor('sms')).toBe(relayOrigin)
    // The relay bridges Privy sign-ins into its own ID tokens.
    expect(issuerFor('privy')).toBe(relayOrigin)
    expect(issuerFor('privy', 'http://localhost:6000')).toBe('http://localhost:6000')
  })

  it('labels every method’s prompt and wrong-identity message', () => {
    expect(loginMethods).toContain('privy')
    expect(loginPromptLabels.privy).toBe('Sign in with Privy…')
    expect(loginAccountNouns.privy).toBe('Privy account')
  })
})

describe('login identities', () => {
  const address: Address = '0x132017efba342842f04f6bc2bc7f0ed1dd13cb87'

  it('shows the email, a masked number, or the Google signer', () => {
    expect(maskPhone('+15192227442')).toBe('+1 ••• ••• 7442')
    expect(maskPhone('+44 20 7946 0958')).toBe('+44 ••• 0958')
    expect(loginIdentity({ method: 'email', address, email: 'liam@tempo.xyz' })).toEqual({
      subject: 'liam@tempo.xyz',
      detail: 'OIDC · liam@tempo.xyz',
    })
    expect(loginIdentity({ method: 'sms', address, phone: '+15192227442' })).toEqual({
      subject: '+1 ••• ••• 7442',
      detail: 'OIDC · +1 ••• ••• 7442',
    })
    expect(loginIdentity({ method: 'google', address, email: 'liam@tempo.xyz' })).toEqual({
      subject: 'liam@tempo.xyz',
      detail: 'OIDC · Google · liam@tempo.xyz',
    })
    // A relay that returns no email still names the Google signer by its address.
    expect(loginIdentity({ method: 'google', address })).toEqual({
      subject: address,
      detail: 'OIDC · Google account · 0x1320…cb87',
    })
  })

  it('masks a Privy login’s email, or shortens its DID', () => {
    expect(maskEmail('liam@tempo.xyz')).toBe('l•••@tempo.xyz')
    expect(maskEmail('not-an-email')).toBe('not-an-email')
    expect(shortenDid('did:privy:cmabcdefghijklmnop7xyz')).toBe('did:privy:cmab…7xyz')
    expect(shortenDid('did:privy:short')).toBe('did:privy:short')
    const did = 'did:privy:cmabcdefghijklmnop7xyz'
    expect(maskPrivyIdentity({ email: 'liam@tempo.xyz', did })).toBe('l•••@tempo.xyz')
    expect(maskPrivyIdentity({ did })).toBe('did:privy:cmab…7xyz')
    expect(maskPrivyIdentity({})).toBeUndefined()
    expect(
      loginIdentity({ method: 'privy', address, email: 'liam@tempo.xyz', privy: did }),
    ).toEqual({ subject: 'l•••@tempo.xyz', detail: 'OIDC · Privy · l•••@tempo.xyz' })
    expect(loginIdentity({ method: 'privy', address, privy: did })).toEqual({
      subject: 'did:privy:cmab…7xyz',
      detail: 'OIDC · Privy · did:privy:cmab…7xyz',
    })
    expect(loginIdentity({ method: 'privy', address })).toEqual({
      subject: address,
      detail: 'OIDC · Privy · 0x1320…cb87',
    })
  })
})

describe('login owner', () => {
  it('signs approvals as ZK signatures with the committed key', async () => {
    const privateKey = P256.randomPrivateKey()
    const value = credential()
    const owner = loginOwner({ credential: value, privateKey, method: 'google' })
    expect(owner.address).toBe(ZkSignature.getAddress(value))
    expect(owner.issuer).toBe(googleIssuer)
    const digest = `0x${'ab'.repeat(32)}` as Hex
    const serialized = await owner.approve(digest)
    expect(serialized.slice(0, 4)).toBe('0x06')
    const envelope = SignatureEnvelope.deserialize(serialized)
    if (envelope.type !== 'zk') throw new Error('Expected a ZK signature.')
    const inner = envelope.accessKeySignature
    if (inner.type !== 'p256') throw new Error('Expected a P-256 access key signature.')
    expect(
      P256.verify({
        payload: ZkSignature.getSignPayload({ credential: value, payload: digest }),
        publicKey: inner.publicKey,
        signature: inner.signature,
      }),
    ).toBe(true)
  })

  it('refuses to approve after the credential expires', async () => {
    const owner = loginOwner({
      credential: credential({ issuedAt: now() - 700, validUntil: now() - 100 }),
      privateKey: P256.randomPrivateKey(),
      method: 'email',
    })
    expect(owner.secondsLeft()).toBeLessThan(0)
    expect(needsSignIn(owner)).toBe(true)
    await expect(owner.approve(`0x${'00'.repeat(32)}`)).rejects.toMatchObject({
      code: 'login-expired',
    })
  })
})

describe('configurable signatures with logins', () => {
  const login = (seed: string) =>
    loginOwner({
      credential: credential({ addressSeed: `0x${seed.repeat(32)}` }),
      privateKey: P256.randomPrivateKey(),
      method: 'email',
    })

  it('chooses approvers up to the threshold and allows two logins at most', () => {
    const [a, b, c] = [login('11'), login('12'), login('13')]
    const owners = [a, b, c].map((owner) => ({ owner: owner.address, weight: 1 }))
    expect(chooseApprovers({ owners, threshold: 2 }, [a, b, c])).toEqual([a, b])
    expect(() => chooseApprovers({ owners, threshold: 3 }, [a, b, c])).toThrow(LoginError)
    expect(() => chooseApprovers({ owners, threshold: 2 }, [a])).toThrow(/threshold/)
    expect(() => chooseApprovers({ owners: owners.slice(1), threshold: 1 }, [a])).toThrow(
      /isn’t an owner/,
    )
    expect(loginGas([a, b, keyAccount()])).toBe(2n * loginApprovalGas)
  })

  it('combines a login and a key into one 0x05 signature, sorted by owner', async () => {
    const owner = login('21')
    const key = keyAccount()
    const config = {
      owners: [
        { owner: owner.address, weight: 1 },
        { owner: key.address, weight: 1 },
      ],
      salt: `0x${'00'.repeat(32)}` as Hex,
      threshold: 2,
      version: 0n,
    }
    const account: Address = '0x1111111111111111111111111111111111111111'
    const envelope = await configurableSignature({
      account,
      config,
      payload: `0x${'cd'.repeat(32)}`,
      approvers: [owner, key],
    })
    expect(envelope.type).toBe('multisig')
    const signers = envelope.signatures.map((signature) =>
      (signature as { type: string }).type === 'zk' ? owner.address : key.address,
    )
    expect(signers.map((address) => address.toLowerCase())).toEqual(
      [owner.address, key.address].map((address) => address.toLowerCase()).sort(),
    )
    expect(SignatureEnvelope.serialize(envelope).slice(0, 4)).toBe('0x05')
  })

  it('signs an unsigned Tempo transaction', async () => {
    const key = keyAccount()
    const account: Address = '0x2222222222222222222222222222222222222222'
    const config = {
      owners: [{ owner: key.address, weight: 1 }],
      salt: `0x${'00'.repeat(32)}` as Hex,
      threshold: 1,
      version: 3n,
    }
    const unsigned = TxEnvelopeTempo.serialize(
      TxEnvelopeTempo.from({
        calls: [{ to: token, data: '0x' }],
        chainId: 31_318,
        gas: 100_000n,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
        nonce: 0n,
      }),
    )
    const signed = await signConfigurableTransaction({
      unsigned,
      account,
      config,
      approvers: [key],
    })
    const decoded = TxEnvelopeTempo.deserialize(signed as TxEnvelopeTempo.Serialized)
    expect(decoded.signature?.type).toBe('multisig')
    expect(TxEnvelopeTempo.getSignPayload(decoded)).toBe(
      TxEnvelopeTempo.getSignPayload(TxEnvelopeTempo.deserialize(unsigned)),
    )
  })
})

describe('calls a login quorum sends', () => {
  it('authorizes a scoped, limited key through the keychain', () => {
    const recipient: Address = '0x3333333333333333333333333333333333333333'
    const keyId: Address = '0x4444444444444444444444444444444444444444'
    const call = authorizeKeyCall({
      keyId,
      keyType: 'p256',
      expiry: 1_800_000_000,
      limits: [{ token, limit: 10_000_000n, period: 86_400 }],
      scopes: [Tempo.Scopes.tip20(token).transfer({ recipients: [recipient] })],
    })
    expect(call.to.toLowerCase()).toBe('0xaaaaaaaa00000000000000000000000000000000')
    const { functionName, args } = decodeFunctionData({
      abi: Tempo.Abis.accountKeychain,
      data: call.data,
    }) as { functionName: string; args: readonly unknown[] }
    expect(functionName).toBe('authorizeKey')
    expect(args[0]).toBe(keyId)
    expect(args[1]).toBe(1)
    expect(args[2]).toEqual({
      expiry: 1_800_000_000n,
      enforceLimits: true,
      limits: [{ token, amount: 10_000_000n, period: 86_400n }],
      allowAnyCalls: false,
      allowedCalls: [
        { target: token, selectorRules: [{ selector: '0xa9059cbb', recipients: [recipient] }] },
      ],
    })
  })

  it('revokes keys and updates the configuration', () => {
    const keyId: Address = '0x4444444444444444444444444444444444444444'
    const revoke = decodeFunctionData({
      abi: Tempo.Abis.accountKeychain,
      data: revokeKeyCall(keyId).data,
    }) as { functionName: string; args: readonly unknown[] }
    expect(revoke).toMatchObject({ functionName: 'revokeKey', args: [keyId] })
    const current = {
      owners: [{ owner: '0x5555555555555555555555555555555555555555' as Address, weight: 1 }],
      salt: `0x${'07'.repeat(32)}` as Hex,
      threshold: 1,
      version: 2n,
    }
    const next = {
      owners: [
        { owner: '0x6666666666666666666666666666666666666666' as Address, weight: 1 },
        { owner: '0x5555555555555555555555555555555555555555' as Address, weight: 1 },
      ],
      threshold: 1,
    }
    const updated = nextConfig(current, next)
    expect(updated.version).toBe(3n)
    expect(updated.salt).toBe(current.salt)
    expect(updated.owners.map(({ owner }) => owner)).toEqual([
      '0x5555555555555555555555555555555555555555',
      '0x6666666666666666666666666666666666666666',
    ])
    expect(updateConfigCall(current, next).to.toLowerCase()).toBe(
      '0xaacc000000000000000000000000000000000000',
    )
  })
})
