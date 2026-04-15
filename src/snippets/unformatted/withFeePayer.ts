// @ts-nocheck
// [!region client]
import { walletActions } from 'viem'
import { withRelay } from 'viem/tempo'

const _client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: tempo,
  transport: withRelay(
    // [!code hl]
    http(), // [!code hl]
    http('http://localhost:3000'), // [!code hl]
    { policy: 'sign-only' }, // [!code hl]
  ), // [!code hl]
}).extend(walletActions)
// [!endregion client]

// [!region usage]
// Sponsored transaction (automatic when relay has feePayer configured)
const _receipt1 = await client.sendTransactionSync({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
})

// Opt out of sponsorship // [!code hl]
const _receipt2 = await client.sendTransactionSync({
  // [!code hl]
  feePayer: false, // [!code hl]
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb', // [!code hl]
}) // [!code hl]

// [!endregion usage]

// [!region server]
import { Handler } from 'accounts/server'
import { privateKeyToAccount } from 'viem/accounts'

const handler = Handler.relay({
  // [!code hl]
  feePayer: { account: privateKeyToAccount('0x...') }, // [!code hl]
}) // [!code hl]

const server = createServer(handler.listener)
server.listen(3000)
// [!endregion server]
