// Zone A/B still run legacy portal and outbox contracts. Adapt only their Zone
// actions; keep the current client, account, token actions, and transport.
import { createClient as createCurrentClient, Actions as currentActions } from 'viem/tempo'
import { Actions as sandboxActions, tempoActions } from 'viem-zones-sandbox/tempo'

export { http, Zone } from 'viem/tempo'

// The sandbox uses the same arguments consumed by these demos but encodes the
// earlier contract ABIs. Remove this boundary when Zone A/B migrate.
export const Actions = {
  ...currentActions,
  zone: sandboxActions.zone as unknown as typeof currentActions.zone,
}

export const createClient: typeof createCurrentClient = ((
  parameters: Parameters<typeof createCurrentClient>[0],
) => {
  const client = createCurrentClient(parameters)
  return client.extend(() => ({ zone: tempoActions()(client as never).zone }))
}) as typeof createCurrentClient
