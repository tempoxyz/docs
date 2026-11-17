import type { Hex } from 'viem'
import { Account } from 'viem/tempo'

export function passkeyDemoEnvironment(url: string, secure: boolean, webAuthn: boolean) {
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

export function passkeyCredentialError(cause: unknown): string {
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

export type PasskeyDemoSession = {
  credential: { id: string; publicKey: Hex }
  rpId: string
}

/** Store only the public credential, never a signing key. */
export function serializePasskeyDemoSession(session: PasskeyDemoSession) {
  return JSON.stringify({
    credential: { id: session.credential.id, publicKey: session.credential.publicKey },
    rpId: session.rpId,
  })
}

export function parsePasskeyDemoSession(
  value: string | null,
  rpId: string,
): PasskeyDemoSession | null {
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
    // Validate the public key before using it to reconstruct a signer.
    Account.fromWebAuthnP256(session.credential, { rpId })
    return JSON.parse(serializePasskeyDemoSession(session)) as PasskeyDemoSession
  } catch {
    return null
  }
}
