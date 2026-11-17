import type { BrowserContext } from '@playwright/test'
import { Signature } from 'ox'
import { KeyAuthorization } from 'ox/tempo'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

/** Tempo ID's origin, the first part of a session's store key. */
const tempoIdOrigin = 'https://id.tempo.xyz'

/**
 * Signs in to the E2E build's Tempo ID connector without Tempo ID's dialog. A new single-key
 * account authorizes an access key that can make any call, as Tempo ID would after sign-in, and the
 * session goes in the store the E2E build reads (`e2eSessionStore`) when the test clicks Sign in.
 */
export async function seedTempoIdSession(
  context: BrowserContext,
  options: { baseURL: string; chainId?: number },
) {
  const chainId = options.chainId ?? 42431
  const root = privateKeyToAccount(generatePrivateKey())
  const accessPrivateKey = generatePrivateKey()
  const access = privateKeyToAccount(accessPrivateKey)
  const expiry = Math.floor(Date.now() / 1000) + 3600
  const authorization = KeyAuthorization.from({
    address: access.address,
    chainId: BigInt(chainId),
    expiry,
    type: 'secp256k1',
  })
  const signature = Signature.from(
    await root.sign({ hash: KeyAuthorization.getSignPayload(authorization) }),
  )
  const keyAuthorization = KeyAuthorization.toRpc(
    KeyAuthorization.from(authorization, { signature: { type: 'secp256k1', signature } }),
  )
  const origin = new URL(options.baseURL).origin
  const key = `tempo-id:session:${JSON.stringify([tempoIdOrigin, origin, chainId])}`
  const value = JSON.stringify({
    state: {
      session: {
        accessKey: {
          account: root.address,
          chainId,
          keyAuthorization,
          privateKey: accessPrivateKey,
        },
        accessToken: 'e2e',
        expiresAt: expiry * 1000,
        idToken: 'e2e',
        tokenType: 'Bearer',
        user: { sub: `e2e:${root.address}`, email: 'e2e@example.com' },
      },
    },
    version: 0,
  })
  // Write the session on the test's first click, not at page load, so the connector doesn't
  // reconnect with it before the test signs in. Sign-in buttons have several labels, such as a
  // connector's name, so any button click counts, but not a link's. A capture listener runs before React's handler.
  await context.addInitScript(
    ([key, value]) => {
      window.addEventListener(
        'click',
        (event) => {
          if ((event.target as Element | null)?.closest?.('button'))
            localStorage.setItem(key, value)
        },
        true,
      )
    },
    [key, value] as const,
  )
  return { address: root.address }
}
