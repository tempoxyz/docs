import { type Address, type Hex, isAddress } from 'viem'
import { tempoModerato } from 'viem/chains'
import { Account, createClient } from 'viem/tempo'

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

export async function readAdminKeyDemoStatus(
  client: {
    accessKey: Pick<
      ReturnType<typeof createAdminKeyDemoClient>['accessKey'],
      'isAdmin' | 'getMetadata'
    >
  },
  key: Address,
): Promise<AdminKeyDemoStatus> {
  const [isAdmin, metadata] = await Promise.all([
    client.accessKey.isAdmin({ accessKey: key }),
    client.accessKey.getMetadata({ accessKey: key }),
  ])
  if (metadata.isRevoked) return 'revoked'
  return isAdmin ? 'active' : 'unregistered'
}
