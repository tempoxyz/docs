// The docs typecheck without Node types; readers run this in Node, where `process` exists.
declare const process: { env: Record<string, string | undefined> }

// [!region client]
import { http } from 'viem'
import { tempoDevnet } from 'viem/chains'
import { createClient } from 'viem/tempo'

// The Tempo Accounts devnet. Its RPC needs a key, which Tempo gives you.
const rpcKey = process.env.TEMPO_DEVNET_RPC_KEY

export const client = createClient({
  chain: tempoDevnet,
  transport: http('https://rpc-multisig-1113.devnet.tempoxyz.dev', {
    fetchOptions: { headers: { Authorization: `Basic ${btoa(`previews:${rpcKey}`)}` } },
  }),
})
// [!endregion client]
