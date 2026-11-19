import type { Accounts, Permissions } from 'accounts'
import type { Connector } from 'wagmi'
import { demoWalletAuthorization } from './demo-wallet-authorization'

type Instance = {
  dialog: { signIn(parameters: { accessKey: Permissions.Permissions }): Promise<unknown> }
  funding: { open(): Promise<unknown> }
  session: Pick<Accounts.Accounts['session'], 'get'>
}

/** The `accounts` instance behind a `tempoId` connector from `accounts/wagmi`. */
export async function getTempoIdInstance(connector: Pick<Connector, 'id'>): Promise<Instance> {
  return await (connector as unknown as { getInstance(): Promise<Instance> }).getInstance()
}

/**
 * Whether the session's access key can make any call. Tempo ID refuses such an access key from the
 * browser, so only an E2E build's session, which `accounts/test` signs locally, holds one.
 * Such a session needs no access key for each new contract.
 */
export async function hasUnrestrictedAccessKey(instance: Pick<Instance, 'session'>) {
  const session = await instance.session.get()
  const authorization = session?.accessKey?.keyAuthorization
  return Boolean(authorization && authorization.allowedCalls === undefined)
}

/**
 * Adds `tokens` to the guides' Tempo access key. A token a guide creates has no address until it
 * exists, so the access key from sign-in can't call it. Does nothing for another connector, or for
 * an E2E build's access key, which can already make any call.
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
