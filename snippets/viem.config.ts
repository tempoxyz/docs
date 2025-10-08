// @ts-nocheck
// [!region setup]
import { createTempoClient } from 'tempo/viem'
import { http, publicActions, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const credentials = `${process.env['TEMPO_USERNAME']}:${process.env['TEMPO_PASSWORD']}`

export const client = createTempoClient({
  account: privateKeyToAccount('0x...'),
  transport: http(undefined, {
    fetchOptions: {
      headers: {
        Authorization: `Basic ${btoa(credentials)}`,
      },
    },
  }),
})
  .extend(publicActions)
  .extend(walletActions)
// [!endregion setup]
