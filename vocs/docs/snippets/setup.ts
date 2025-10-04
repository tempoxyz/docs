// [!region setup]
import { createClient, http, publicActions, walletActions } from 'viem'
import { tempo } from 'tempo/chains';
import { tempoActions } from 'tempo/viem';
import { privateKeyToAccount } from 'viem/accounts';

export const TEMPO_RPC_USERNAME = "${USERNAME}";
export const TEMPO_RPC_PASSWORD = "${PASSWORD}";
export const TEMPO_CREDENTIALS = Buffer.from(`${TEMPO_RPC_USERNAME}:${TEMPO_RPC_PASSWORD}`).toString('base64');

const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: tempo,
  transport: http(tempo.rpcUrls.default.http[0], {
    fetchOptions: {
      headers: {
        Authorization: `Basic ${TEMPO_CREDENTIALS}`,
      },
    }
  }),
})
.extend(publicActions)
.extend(walletActions)
.extend(tempoActions);
// [!endregion setup]