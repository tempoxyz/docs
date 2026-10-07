import { WebAuthnCeremony } from 'accounts'

/**
 * Tempo's hosted key service uses the accounts SDK's registration and login API.
 * Its passkeys belong to tempo.xyz, so localhost and isolated preview hosts use
 * the SDK's browser-persisted ceremony with their own relying-party ID.
 */
export function keys(options: keys.Options = {}): WebAuthnCeremony.WebAuthnCeremony {
  const {
    url = 'https://keys.tempo.xyz',
    rpId = typeof location !== 'undefined' ? location.hostname : 'localhost',
  } = options

  if (rpId === 'tempo.xyz') return WebAuthnCeremony.server({ url })
  return WebAuthnCeremony.local({ rpId })
}

export namespace keys {
  export type Options = {
    /** Base URL of the hosted key service. */
    url?: string | undefined
    /** Relying-party ID for the current site. */
    rpId?: string | undefined
  }
}
