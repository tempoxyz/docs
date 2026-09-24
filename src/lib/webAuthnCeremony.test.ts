import { Bytes } from 'ox'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Authentication, Registration } from 'webauthx/server'
import { keys } from './webAuthnCeremony'

const fetchMock = vi.fn<typeof fetch>()
const credentialId = 'dGVzdC1jcmVkZW50aWFs'
const publicKey =
  '0x046b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c2964fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5' as const
const challenge = `0x${'42'.repeat(32)}` as const
const clientDataJSON = JSON.stringify({
  type: 'webauthn.create',
  challenge: 'QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI',
  origin: 'https://tempo.xyz',
})

// Serialized transport fixtures; authenticator verification is covered by browser E2E.
const raw = {
  id: credentialId,
  type: 'public-key',
  authenticatorAttachment: 'platform',
  rawId: credentialId,
  response: { clientDataJSON: Buffer.from(clientDataJSON).toString('base64url') },
} as const
const credential: Registration.Credential = {
  id: credentialId,
  publicKey,
  attestationObject: 'oA',
  clientDataJSON: raw.response.clientDataJSON,
  raw,
}
const authentication: Authentication.Response = {
  id: credentialId,
  metadata: { authenticatorData: '0x00', clientDataJSON: '{}' },
  signature: '0x00',
  raw,
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('location', undefined)
})
afterEach(() => vi.unstubAllGlobals())

describe('hosted Tempo WebAuthn ceremony', () => {
  test.each([
    undefined,
    'https://keys.example.test/webauthn',
  ])('uses all four SDK POST routes with base URL %s', async (url) => {
    const ceremony = keys({ rpId: 'tempo.xyz', url })
    const registrationParameters = {
      name: 'Demo account',
      userId: 'demo-user',
      excludeCredentialIds: [credentialId],
    }
    const loginParameters = {
      allowCredentialIds: [credentialId],
      challenge,
      credentialId,
      mediation: 'required' as const,
    }
    const registrationOptions = {
      options: Registration.getOptions({
        challenge,
        name: registrationParameters.name,
        user: { id: Bytes.fromString('demo-user'), name: registrationParameters.name },
        rp: { id: 'tempo.xyz', name: 'Tempo' },
        excludeCredentialIds: [credentialId],
      }).options,
    }
    const authenticationOptions = {
      options: Authentication.getOptions({
        challenge,
        credentialId,
        rpId: 'tempo.xyz',
      }).options,
    }
    const registered = { credentialId, publicKey, username: 'Demo account' }
    const authenticated = { ...registered, userId: 'demo-user' }
    for (const response of [registrationOptions, registered, authenticationOptions, authenticated])
      fetchMock.mockResolvedValueOnce(Response.json(response))

    await expect(ceremony.getRegistrationOptions(registrationParameters)).resolves.toEqual(
      registrationOptions,
    )
    await expect(ceremony.verifyRegistration(credential)).resolves.toEqual(registered)
    await expect(ceremony.getAuthenticationOptions(loginParameters)).resolves.toEqual(
      authenticationOptions,
    )
    await expect(ceremony.verifyAuthentication(authentication)).resolves.toEqual(authenticated)

    const baseUrl = url ?? 'https://keys.tempo.xyz'
    expect(
      fetchMock.mock.calls.map(([requestUrl, init]) => ({
        url: String(requestUrl),
        method: init?.method,
        contentType: new Headers(init?.headers).get('content-type'),
        body: JSON.parse(String(init?.body)),
      })),
    ).toEqual(
      [
        ['/register/options', registrationParameters],
        ['/register', credential],
        ['/login/options', loginParameters],
        ['/login', authentication],
      ].map(([path, body]) => ({
        url: `${baseUrl}${path}`,
        method: 'POST',
        contentType: 'application/json',
        body,
      })),
    )
  })

  test.each([
    [
      '/register/options',
      (ceremony: ReturnType<typeof keys>) => ceremony.getRegistrationOptions({ name: 'Demo' }),
    ],
    ['/register', (ceremony: ReturnType<typeof keys>) => ceremony.verifyRegistration(credential)],
    ['/login/options', (ceremony: ReturnType<typeof keys>) => ceremony.getAuthenticationOptions()],
    [
      '/login',
      (ceremony: ReturnType<typeof keys>) => ceremony.verifyAuthentication(authentication),
    ],
  ] as const)('propagates HTTP errors from %s without a local fallback', async (path, invoke) => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: 'Hosted ceremony unavailable' }, { status: 503 }),
    )
    await expect(invoke(keys({ rpId: 'tempo.xyz' }))).rejects.toThrow('Hosted ceremony unavailable')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(`https://keys.tempo.xyz${path}`)
  })

  test('uses the hosted service when the current hostname is tempo.xyz', async () => {
    vi.stubGlobal('location', { hostname: 'tempo.xyz' })
    fetchMock.mockResolvedValueOnce(Response.json({ credentialId, publicKey }))
    await expect(keys().verifyRegistration(credential)).resolves.toEqual({
      credentialId,
      publicKey,
    })
    expect(fetchMock.mock.calls[0][0]).toBe('https://keys.tempo.xyz/register')
  })
})

describe('local and preview WebAuthn ceremonies', () => {
  test.each([
    'localhost',
    'docs-review.example.vercel.app',
  ])('keeps registration and authentication on RP %s without HTTP', async (rpId) => {
    vi.stubGlobal('location', { hostname: 'tempo.xyz' })
    const ceremony = keys({ rpId })
    const registration = await ceremony.getRegistrationOptions({
      name: 'Local demo',
      userId: 'local-user',
    })
    const login = await ceremony.getAuthenticationOptions({ challenge, credentialId })
    expect(registration.options.publicKey?.rp).toEqual({ id: rpId, name: rpId })
    expect(registration.options.publicKey?.user.name).toBe('Local demo')
    expect(registration.options.publicKey?.challenge).toBeTypeOf('string')
    expect(login.options.publicKey?.rpId).toBe(rpId)
    expect(login.options.publicKey?.allowCredentials?.[0]?.id).toBe(credentialId)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test.each([
    undefined,
    'docs-isolated.example.vercel.app',
  ])('defaults to the current hostname or localhost without a location (%s)', async (hostname) => {
    if (hostname) vi.stubGlobal('location', { hostname })
    const ceremony = keys()
    const registration = await ceremony.getRegistrationOptions({ name: 'Local demo' })
    const login = await ceremony.getAuthenticationOptions()
    expect(registration.options.publicKey?.rp.id).toBe(hostname ?? 'localhost')
    expect(login.options.publicKey?.rpId).toBe(hostname ?? 'localhost')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('stores local credentials in the SDK and reuses their public key for login', async () => {
    const ceremony = keys({ rpId: 'localhost' })
    await expect(ceremony.verifyAuthentication(authentication)).rejects.toThrow(
      'Unknown credential',
    )
    await expect(ceremony.verifyRegistration(credential)).resolves.toEqual({
      credentialId,
      publicKey,
    })
    await expect(ceremony.verifyAuthentication(authentication)).resolves.toEqual({
      credentialId,
      publicKey,
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
