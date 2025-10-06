// [!region setup]
import { http, publicActions, walletActions } from 'viem'
import { tempoLento } from 'tempo/chains';
import { createTempoClient, tempoActions } from 'tempo/viem';
import { privateKeyToAccount } from 'viem/accounts';

export const client = createTempoClient({
  account: privateKeyToAccount('0x...'),
  chain: tempoLento,
  transport: http(undefined, {
    fetchOptions: {
      headers: {
        Authorization: `Basic ${btoa(`${TEMPO_RPC_USER}:${TEMPO_RPC_PASSWORD}`)}`,
      },
    }
  }),
})
  .extend(publicActions)
  .extend(walletActions)
// [!endregion setup]