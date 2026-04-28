import { WebAuthnCeremony } from 'accounts'
import { Bytes } from 'ox'
import { Authentication, Registration } from 'webauthx/server'

/**
 * Custom {@link WebAuthnCeremony.WebAuthnCeremony} that wraps the
 * [`keys.tempo.xyz`](https://github.com/tempoxyz/tempo-apps/tree/main/apps/key-manager)
 * key-manager service.
 *
 * The service is a thin challenge issuer + credential public-key store
 * (3 endpoints). Unlike `WebAuthnCeremony.server({ url })`, this ceremony
 * builds the `PublicKeyCredentialCreationOptions` /
 * `PublicKeyCredentialRequestOptions` client-side using `webauthx/server`,
 * sources challenges from `GET /challenge`, persists the registered
 * credential's public key via `POST /:id`, and retrieves it later via
 * `GET /:id`.
 */
export function keys(options: keys.Options = {}): WebAuthnCeremony.WebAuthnCeremony {
  const { url = 'https://keys.tempo.xyz', rpId: rpIdOption } = options

  async function getChallenge() {
    const response = await fetch(`${url}/challenge`)
    if (!response.ok) throw new Error('Failed to get challenge')
    return (await response.json()) as {
      challenge: `0x${string}`
      rp?: { id: string; name: string }
    }
  }

  function resolveRpId(rp: { id: string; name: string } | undefined) {
    return (
      rpIdOption ?? rp?.id ?? (typeof location !== 'undefined' ? location.hostname : 'localhost')
    )
  }

  return WebAuthnCeremony.from({
    async getRegistrationOptions(parameters) {
      const { excludeCredentialIds, name, userId } = parameters
      const { challenge, rp: rpFromServer } = await getChallenge()
      const rpId = resolveRpId(rpFromServer)
      const { options: opts } = Registration.getOptions({
        challenge,
        excludeCredentialIds,
        name,
        rp: { id: rpId, name: rpFromServer?.name ?? rpId },
        user: userId ? { id: Bytes.fromString(userId), name } : undefined,
      })
      return { options: opts }
    },
    async verifyRegistration(credential) {
      const publicKey = credential.publicKey
      const response = await fetch(`${url}/${credential.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, publicKey }),
      })
      if (!response.ok) {
        const { error } = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(error ?? 'Failed to register credential')
      }
      return { credentialId: credential.id, publicKey }
    },
    async getAuthenticationOptions(parameters = {}) {
      const { allowCredentialIds, challenge, credentialId } = parameters
      const resolvedChallenge = challenge ?? (await getChallenge()).challenge
      const { options: opts } = Authentication.getOptions({
        challenge: resolvedChallenge,
        credentialId: allowCredentialIds ? [...allowCredentialIds] : credentialId,
        rpId: resolveRpId(undefined),
      })
      return { options: opts }
    },
    async verifyAuthentication(response) {
      const res = await fetch(`${url}/${response.id}`)
      if (!res.ok) throw new Error(`Unknown credential: ${response.id}`)
      const { publicKey } = (await res.json()) as { publicKey: `0x${string}` }
      return { credentialId: response.id, publicKey }
    },
  })
}

export namespace keys {
  export type Options = {
    /** Base URL of the key-manager service. @default `"https://keys.tempo.xyz"` */
    url?: string | undefined
    /** Override Relying Party ID. @default rp returned by `GET /challenge`, falling back to `location.hostname`. */
    rpId?: string | undefined
  }
}
