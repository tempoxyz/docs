import type { Accounts, Permissions, Store } from 'accounts'
import { dialog } from 'accounts/plugins'
import type { Connector } from 'wagmi'
import { demoWalletAuthorization } from './demo-wallet-authorization'

type Instance = {
  dialog: { signIn(parameters: { accessKey: Permissions.Permissions }): Promise<unknown> }
  funding: { open(parameters: { chainId: number }): Promise<unknown> }
  session: Pick<Accounts.Accounts['session'], 'get'>
}

/** The `accounts` instance behind a `tempoId` connector from `accounts/wagmi`. */
export async function getTempoIdInstance(connector: Pick<Connector, 'id'>): Promise<Instance> {
  return await (connector as unknown as { getInstance(): Promise<Instance> }).getInstance()
}

/**
 * Whether the session's access key can make any call. Tempo ID refuses such an access key from the
 * browser, so only an E2E build's seeded session, which the test's own root key signed, holds one.
 * Such a session needs no access key for each new contract.
 */
export async function hasUnrestrictedAccessKey(instance: Pick<Instance, 'session'>) {
  const session = await instance.session.get()
  const authorization = session?.accessKey?.keyAuthorization
  return Boolean(authorization && authorization.allowedCalls === undefined)
}

/**
 * The store of an E2E build's Tempo ID connector. A test can't sign in with Tempo ID's dialog, so it
 * seeds a session in `localStorage`, as JSON, under
 * `tempo-id:session:[<Tempo ID origin>, <page origin>, <chain ID>]`, which this store reads when it
 * holds none. It keeps every other value, such as a dialog sign-in's browser access key, in memory.
 */
export function e2eSessionStore(): Store.Store {
  const values = new Map<string, unknown>()
  return {
    async getItem(key) {
      if (values.has(key)) return values.get(key)
      const seeded = globalThis.localStorage?.getItem(key)
      return seeded == null ? undefined : JSON.parse(seeded)
    },
    async setItem(key, value) {
      values.set(key, value)
    },
    async removeItem(key) {
      values.delete(key)
      globalThis.localStorage?.removeItem(key)
    },
  }
}

/** Whether `localStorage` holds a seeded Tempo ID session (see `e2eSessionStore`). */
function hasSeededSession() {
  const storage = globalThis.localStorage
  if (!storage) return false
  for (let i = 0; i < storage.length; i++)
    if (storage.key(i)?.startsWith('tempo-id:session:')) return true
  return false
}

/**
 * The E2E build's dialog plugin. Its sign-in adopts a session a test seeded, which the instance
 * read at page load only if it existed then, and otherwise opens Tempo ID's dialog.
 */
export function e2eDialog() {
  const plugin = dialog()
  return {
    ...plugin,
    actions(context: Parameters<NonNullable<typeof plugin.actions>>[0]) {
      const actions = plugin.actions?.(context)
      if (!actions) throw new Error('The dialog plugin has no actions.')
      return {
        ...actions,
        async signIn(...parameters: Parameters<typeof actions.signIn>) {
          if (hasSeededSession()) {
            const session = await context.session.reload({ hooks: true })
            if (session) return session as Awaited<ReturnType<typeof actions.signIn>>
          }
          return await actions.signIn(...parameters)
        },
      }
    },
  } as typeof plugin
}

/**
 * Adds `tokens` to the guides' Tempo access key. A token a guide creates has no address until it
 * exists, so the access key from sign-in can't call it. Does nothing for another connector, or for
 * an E2E build's seeded access key, which can already make any call.
 */
export async function allowTokens(
  connector: Pick<Connector, 'id'>,
  tokens: readonly `0x${string}`[],
) {
  if (connector.id !== 'tempoId') return
  const instance = await getTempoIdInstance(connector)
  if (await hasUnrestrictedAccessKey(instance)) return
  await instance.dialog.signIn({ accessKey: demoWalletAuthorization(tokens) })
}
