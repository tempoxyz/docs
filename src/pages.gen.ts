// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse } from 'waku/router';


// prettier-ignore
type Page =
| { path: '/_mdx-wrapper'; render: 'static' }
| { path: '/'; render: 'static' }
| { path: '/sdk'; render: 'static' }
| { path: '/sdk/typescript'; render: 'static' }
| { path: '/sdk/typescript/server/handler.compose'; render: 'static' }
| { path: '/sdk/typescript/server/handler.feePayer'; render: 'static' }
| { path: '/sdk/typescript/server/handler.keyManager'; render: 'static' }
| { path: '/sdk/typescript/server/handlers'; render: 'static' }
| { path: '/sdk/typescript/prool/setup'; render: 'static' }
| { path: '/sdk/rust'; render: 'static' }
| { path: '/sdk/go'; render: 'static' }
| { path: '/sdk/foundry'; render: 'static' }
| { path: '/quickstart/connection-details'; render: 'static' }
| { path: '/quickstart/developer-tools'; render: 'static' }
| { path: '/quickstart/evm-compatibility'; render: 'static' }
| { path: '/quickstart/faucet'; render: 'static' }
| { path: '/quickstart/integrate-tempo'; render: 'static' }
| { path: '/quickstart/predeployed-contracts'; render: 'static' }
| { path: '/quickstart/tip20'; render: 'static' }
| { path: '/quickstart/wallet-developers'; render: 'static' }
| { path: '/protocol'; render: 'static' }
| { path: '/protocol/transactions/AccountKeychain'; render: 'static' }
| { path: '/protocol/transactions'; render: 'static' }
| { path: '/protocol/transactions/spec-tempo-transaction'; render: 'static' }
| { path: '/protocol/tips'; render: 'static' }
| { path: '/protocol/tips/tip-1000'; render: 'static' }
| { path: '/protocol/tips/tip-1001'; render: 'static' }
| { path: '/protocol/tips/tip-1002'; render: 'static' }
| { path: '/protocol/tips/tip-1003'; render: 'static' }
| { path: '/protocol/tips/tip-1004'; render: 'static' }
| { path: '/protocol/tips/tip-1005'; render: 'static' }
| { path: '/protocol/tips/tip-1006'; render: 'static' }
| { path: '/protocol/tips/tip-1007'; render: 'static' }
| { path: '/protocol/tips/tip_template'; render: 'static' }
| { path: '/protocol/tip403/overview'; render: 'static' }
| { path: '/protocol/tip403/spec'; render: 'static' }
| { path: '/protocol/tip20-rewards/overview'; render: 'static' }
| { path: '/protocol/tip20-rewards/spec'; render: 'static' }
| { path: '/protocol/tip20/overview'; render: 'static' }
| { path: '/protocol/tip20/spec'; render: 'static' }
| { path: '/protocol/fees'; render: 'static' }
| { path: '/protocol/fees/spec-fee-amm'; render: 'static' }
| { path: '/protocol/fees/spec-fee'; render: 'static' }
| { path: '/protocol/fees/fee-amm'; render: 'static' }
| { path: '/protocol/exchange/exchange-balance'; render: 'static' }
| { path: '/protocol/exchange/executing-swaps'; render: 'static' }
| { path: '/protocol/exchange'; render: 'static' }
| { path: '/protocol/exchange/pathUSD'; render: 'static' }
| { path: '/protocol/exchange/providing-liquidity'; render: 'static' }
| { path: '/protocol/exchange/spec'; render: 'static' }
| { path: '/protocol/blockspace/overview'; render: 'static' }
| { path: '/protocol/blockspace/payment-lane-specification'; render: 'static' }
| { path: '/protocol/blockspace/sub-block-specification'; render: 'static' }
| { path: '/learn'; render: 'static' }
| { path: '/learn/partners'; render: 'static' }
| { path: '/learn/stablecoins'; render: 'static' }
| { path: '/learn/use-cases/agentic-commerce'; render: 'static' }
| { path: '/learn/use-cases/embedded-finance'; render: 'static' }
| { path: '/learn/use-cases/global-payouts'; render: 'static' }
| { path: '/learn/use-cases/microtransactions'; render: 'static' }
| { path: '/learn/use-cases/remittances'; render: 'static' }
| { path: '/learn/use-cases/tokenized-deposits'; render: 'static' }
| { path: '/learn/tempo/fx'; render: 'static' }
| { path: '/learn/tempo'; render: 'static' }
| { path: '/learn/tempo/modern-transactions'; render: 'static' }
| { path: '/learn/tempo/native-stablecoins'; render: 'static' }
| { path: '/learn/tempo/performance'; render: 'static' }
| { path: '/learn/tempo/privacy'; render: 'static' }
| { path: '/guide/_template'; render: 'static' }
| { path: '/guide/use-accounts/add-funds'; render: 'static' }
| { path: '/guide/use-accounts/batch-transactions'; render: 'static' }
| { path: '/guide/use-accounts/connect-to-wallets'; render: 'static' }
| { path: '/guide/use-accounts/embed-passkeys'; render: 'static' }
| { path: '/guide/use-accounts/fee-sponsorship'; render: 'static' }
| { path: '/guide/use-accounts'; render: 'static' }
| { path: '/guide/use-accounts/scheduled-transactions'; render: 'static' }
| { path: '/guide/use-accounts/webauthn-p256-signatures'; render: 'static' }
| { path: '/guide/tempo-transaction'; render: 'static' }
| { path: '/guide/stablecoin-dex/executing-swaps'; render: 'static' }
| { path: '/guide/stablecoin-dex'; render: 'static' }
| { path: '/guide/stablecoin-dex/managing-fee-liquidity'; render: 'static' }
| { path: '/guide/stablecoin-dex/providing-liquidity'; render: 'static' }
| { path: '/guide/stablecoin-dex/view-the-orderbook'; render: 'static' }
| { path: '/guide/payments/accept-a-payment'; render: 'static' }
| { path: '/guide/payments'; render: 'static' }
| { path: '/guide/payments/pay-fees-in-any-stablecoin'; render: 'static' }
| { path: '/guide/payments/send-a-payment'; render: 'static' }
| { path: '/guide/payments/send-parallel-transactions'; render: 'static' }
| { path: '/guide/payments/sponsor-user-fees'; render: 'static' }
| { path: '/guide/payments/transfer-memos'; render: 'static' }
| { path: '/guide/node'; render: 'static' }
| { path: '/guide/node/installation'; render: 'static' }
| { path: '/guide/node/rpc'; render: 'static' }
| { path: '/guide/node/system-requirements'; render: 'static' }
| { path: '/guide/node/validator'; render: 'static' }
| { path: '/guide/issuance/create-a-stablecoin'; render: 'static' }
| { path: '/guide/issuance/distribute-rewards'; render: 'static' }
| { path: '/guide/issuance'; render: 'static' }
| { path: '/guide/issuance/manage-stablecoin'; render: 'static' }
| { path: '/guide/issuance/mint-stablecoins'; render: 'static' }
| { path: '/guide/issuance/use-for-fees'; render: 'static' }
| { path: '/_api/api/og'; render: 'static' };

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>;
  }
  interface CreatePagesConfig {
    pages: Page;
  }
}
