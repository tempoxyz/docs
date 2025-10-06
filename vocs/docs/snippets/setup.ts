// [!region setup]
import { createClient, http, publicActions, walletActions } from 'viem'
import { tempo } from 'tempo/chains';
import { tempoActions } from 'tempo/viem';
import { privateKeyToAccount } from 'viem/accounts';

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: tempo,
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
  .extend(tempoActions());
// [!endregion setup]