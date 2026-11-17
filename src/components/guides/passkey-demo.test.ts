import { Account, P256 } from 'viem/tempo'
import { describe, expect, it } from 'vitest'
import {
  type PasskeyDemoSession,
  parsePasskeyDemoSession,
  passkeyCredentialError,
  passkeyDemoEnvironment,
  serializePasskeyDemoSession,
} from './passkey-demo'

const publicKey = Account.fromP256(P256.randomPrivateKey()).publicKey
const session: PasskeyDemoSession = {
  credential: { id: 'test-credential', publicKey },
  rpId: 'localhost',
}

describe('passkey demo records', () => {
  it('persists only the public credential', () => {
    const withSecrets = {
      ...session,
      privateKey: 'never-persist-this',
      credential: { ...session.credential, raw: { authenticator: 'not-needed' } },
    }
    expect(JSON.parse(serializePasskeyDemoSession(withSecrets))).toEqual(session)
    expect(parsePasskeyDemoSession(JSON.stringify(withSecrets), 'localhost')).toEqual(session)
  })

  it.each([
    null,
    '{',
    '{}',
    JSON.stringify({ ...session, rpId: 'another.example' }),
    JSON.stringify({ ...session, credential: { id: '', publicKey } }),
    JSON.stringify({ ...session, credential: { id: 'test', publicKey: '0x1234' } }),
  ])('rejects an invalid record', (value) => {
    expect(parsePasskeyDemoSession(value, 'localhost')).toBeNull()
  })
})

describe('passkey environment', () => {
  it('preserves the demo destination when moving from a loopback IP', () => {
    expect(
      passkeyDemoEnvironment(
        'http://127.0.0.1:5174/docs/accounts/authentication/passkeys?demo=1#create-a-passkey',
        true,
        true,
      )?.localhostUrl,
    ).toBe('http://localhost:5174/docs/accounts/authentication/passkeys?demo=1#create-a-passkey')
  })
  it('allows localhost and secure domains', () => {
    expect(passkeyDemoEnvironment('http://localhost:5174/docs', true, true)).toBeNull()
    expect(passkeyDemoEnvironment('https://docs.tempo.xyz/docs', true, true)).toBeNull()
  })
  it('blocks insecure origins and missing browser support', () => {
    expect(passkeyDemoEnvironment('http://docs.example.com', false, true)?.message).toContain(
      'HTTPS',
    )
    expect(passkeyDemoEnvironment('https://docs.example.com', true, false)?.message).toContain(
      'does not support',
    )
  })
  it('unwraps a cancelled credential request', () => {
    const cause = new Error('Failed to create credential.', {
      cause: new DOMException('Cancelled', 'NotAllowedError'),
    })
    expect(passkeyCredentialError(cause)).toContain('cancelled')
  })
})
