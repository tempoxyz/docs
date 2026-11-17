import { Account, P256 } from 'viem/tempo'
import { describe, expect, it, vi } from 'vitest'
import {
  type AdminKeyDemoSession,
  adminKeyCredentialError,
  adminKeyDemoEnvironment,
  adminKeyDemoFeeToken,
  createAdminKeyDemoClient,
  parseAdminKeyDemoSession,
  readAdminKeyDemoStatus,
  serializeAdminKeyDemoSession,
} from './admin-key-demo'

const publicKey = Account.fromP256(P256.randomPrivateKey()).publicKey
const keyAddress = '0x1234567890123456789012345678901234567890' as const
const session: AdminKeyDemoSession = {
  credential: { id: 'test-credential', publicKey },
  rpId: 'localhost',
  key: { address: keyAddress },
}

describe('admin-key demo account records', () => {
  it('reconnects the same root account without signing or making a network request', () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    try {
      const restored = parseAdminKeyDemoSession(serializeAdminKeyDemoSession(session), 'localhost')
      expect(restored).toEqual(session)
      const client = createAdminKeyDemoClient(restored as AdminKeyDemoSession)
      expect(client.account.address).toEqual(createAdminKeyDemoClient(session).account.address)
      expect(client.chain.id).toBe(42431)
      expect(Reflect.get(client.chain, 'feeToken')).toBe(adminKeyDemoFeeToken)
      expect(request).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('persists only public credential and receipt data', () => {
    const withSecrets = {
      ...session,
      privateKey: 'never-persist-this',
      credential: { ...session.credential, raw: { authenticator: 'not-needed' } },
      key: { address: keyAddress, privateKey: 'never-persist-this-either' },
    }
    expect(JSON.parse(serializeAdminKeyDemoSession(withSecrets))).toEqual(session)
    expect(parseAdminKeyDemoSession(JSON.stringify(withSecrets), 'localhost')).toEqual(session)
  })

  it.each([
    null,
    '{',
    '{}',
    JSON.stringify({ ...session, rpId: 'another.example' }),
    JSON.stringify({ ...session, credential: { id: '', publicKey } }),
    JSON.stringify({ ...session, credential: { id: 'test', publicKey: '0x1234' } }),
    JSON.stringify({ ...session, key: { address: 'invalid' } }),
    JSON.stringify({ ...session, key: { ...session.key, authorizationHash: 'invalid' } }),
  ])('ignores a missing, corrupt, or differently scoped saved record', (value) => {
    expect(parseAdminKeyDemoSession(value, 'localhost')).toBeNull()
  })
})

describe('admin-key onchain status', () => {
  function client(isAdmin: boolean, isRevoked: boolean) {
    return {
      account: { address: '0x0000000000000000000000000000000000000001' as const },
      readContract: vi.fn().mockResolvedValue(isAdmin),
      accessKey: {
        getMetadata: vi.fn().mockResolvedValue({ isRevoked }),
        authorizeSync: vi.fn(),
        revokeSync: vi.fn(),
      },
    }
  }

  it.each([
    [false, false, 'unregistered'],
    [true, false, 'active'],
    [false, true, 'revoked'],
  ])('distinguishes an unused key from a permanently revoked key', async (isAdmin, isRevoked, status) => {
    const backend = client(isAdmin, isRevoked)
    // biome-ignore lint/suspicious/noExplicitAny: a partial client.
    expect(await readAdminKeyDemoStatus(backend as any, keyAddress)).toBe(status)
    expect(backend.accessKey.authorizeSync).not.toHaveBeenCalled()
    expect(backend.accessKey.revokeSync).not.toHaveBeenCalled()
  })

  it('does not report an inactive key when a status read fails', async () => {
    const backend = client(false, false)
    backend.readContract.mockRejectedValue(new Error('RPC unavailable'))
    // biome-ignore lint/suspicious/noExplicitAny: a partial client.
    await expect(readAdminKeyDemoStatus(backend as any, keyAddress)).rejects.toThrow(
      'RPC unavailable',
    )
  })
})

describe('passkey environment', () => {
  it('preserves the demo destination when moving from a loopback IP', () => {
    expect(
      adminKeyDemoEnvironment(
        'http://127.0.0.1:5174/docs/accounts/admin-keys?demo=1#authorize-an-admin-key',
        true,
        true,
      )?.localhostUrl,
    ).toBe('http://localhost:5174/docs/accounts/admin-keys?demo=1#authorize-an-admin-key')
  })
  it('allows localhost and secure domains', () => {
    expect(adminKeyDemoEnvironment('http://localhost:5174/docs', true, true)).toBeNull()
    expect(adminKeyDemoEnvironment('https://docs.tempo.xyz/docs', true, true)).toBeNull()
  })
  it('blocks insecure origins and missing browser support', () => {
    expect(adminKeyDemoEnvironment('http://docs.example.com', false, true)?.message).toContain(
      'HTTPS',
    )
    expect(adminKeyDemoEnvironment('https://docs.example.com', true, false)?.message).toContain(
      'does not support',
    )
  })
  it('unwraps a cancelled credential request', () => {
    const cause = new Error('Failed to create credential.', {
      cause: new DOMException('Cancelled', 'NotAllowedError'),
    })
    expect(adminKeyCredentialError(cause)).toContain('cancelled')
  })
})
