// [!region setup]
import { createClient, http, walletActions } from 'viem'
import { tempo } from 'tempo.ts/chains'
import { withFeePayer } from 'tempo.ts/viem'
import { privateKeyToAccount } from 'viem/accounts'

const credentials = `${process.env['TEMPO_USERNAME']}:${process.env['TEMPO_PASSWORD']}`

const client = createClient({
  account: privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
  transport: withFeePayer( // [!code hl]
    // [!code hl]
    // Transport for regular transactions // [!code hl]
    http(undefined, { // [!code hl]
      fetchOptions: { // [!code hl]
        headers: { // [!code hl]
          Authorization: `Basic ${btoa(credentials)}`, // [!code hl]
        }, // [!code hl]
      }, // [!code hl]
    }), // [!code hl]
    // Transport for sponsored transactions // [!code hl]
    http('https://sponsor.myapp.com'), // [!code hl]
  ), // [!code hl]
}).extend(walletActions)
// [!endregion setup]

// [!region usage]
// Regular transaction (uses default transport)
const receipt1 = await client.sendTransactionSync({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
})

// Sponsored transaction (uses feePayer transport) // [!code hl]
const receipt2 = await client.sendTransactionSync({ // [!code hl]
  feePayer: true, // [!code hl]
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb', // [!code hl]
}) // [!code hl]
// [!endregion usage]
