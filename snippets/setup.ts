// @ts-nocheck
// [!region setup]
import { tempoLento } from 'tempo.ts/chains'
import { createTempoClient, tempoActions } from 'tempo.ts/viem'
import { http, publicActions, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const client = createTempoClient({
  account: privateKeyToAccount('0x...'),
  chain: tempoLento,
  transport: http(undefined, {
    fetchOptions: {
      headers: {
        Authorization: `Basic ${btoa(`${process.env['TEMPO_RPC_USER']}:${process.env['TEMPO_RPC_PASSWORD']}`)}`,
      },
    },
  }),
})
  .extend(publicActions)
  .extend(walletActions)
  .extend(tempoActions())
// [!endregion setup]
