import { Changelog, defineConfig, McpSource } from 'vocs/config'
import { createFeedbackAdapter } from './src/lib/feedback-adapter'

// Only set baseUrl in production — Vocs injects a <base> tag from this value,
// which causes all links to resolve to the absolute URL on preview deployments.
const baseUrl = (() => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return ''
  if (URL.canParse(process.env.VITE_BASE_URL)) return process.env.VITE_BASE_URL
  if (process.env.VERCEL_ENV === 'production')
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return ''
})()

export default defineConfig({
  banner: {
    dismissable: false,
    backgroundColor: '#5B4CDB',
    content: 'Tempo Mainnet is live. [Read our announcement.](https://tempo.xyz/blog/mainnet) →',
    height: '40px',
    textColor: 'white',
  },
  changelog: Changelog.github({ prereleases: true, repo: 'tempoxyz/tempo' }),
  // TODO: Set back to true once tempoxyz/tempo#tip-1011 dead link is fixed
  checkDeadlinks: 'warn',
  editLink: {
    link: 'https://github.com/tempoxyz/docs/edit/main/src/pages/:path',
    text: 'Suggest changes to this page',
  },
  title: 'Tempo',
  titleTemplate: '%s ⋅ Tempo',
  description: 'Documentation for the Tempo network and protocol specifications',
  feedback: createFeedbackAdapter(),
  mcp: {
    enabled: true,
    sources: [
      McpSource.github({ repo: 'tempoxyz/tempo' }),
      McpSource.github({ repo: 'paradigmxyz/reth' }),
      McpSource.github({ repo: 'foundry-rs/foundry' }),
      McpSource.github({ repo: 'wevm/viem' }),
      McpSource.github({ repo: 'wevm/wagmi' }),
      McpSource.github({ repo: 'tempoxyz/tempo-ts' }),
    ],
  },
  baseUrl: baseUrl || undefined,
  ogImageUrl: (path, { baseUrl } = { baseUrl: '' }) =>
    path === '/'
      ? `${baseUrl}/og-docs.png`
      : `${baseUrl}/api/og?title=%title&description=%description`,
  // TODO: Change back to file paths (`/lockup-light.svg`, `/lockup-dark.svg`) once password protection is removed
  logoUrl: {
    light:
      'data:image/svg+xml,%3Csvg%20width%3D%22184%22%20height%3D%2241%22%20viewBox%3D%220%200%20184%2041%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cpath%20d%3D%22M13.6424%2040.3635H2.80251L12.8492%209.60026H0L2.80251%200.58344H38.6006L35.7981%209.60026H23.6362L13.6424%2040.3635Z%22%20fill%3D%22black%22/%3E%0A%3Cpath%20d%3D%22M53.9809%2040.3635H28.2824L41.1846%200.58344H66.7773L64.3449%208.16818H49.4863L46.7896%2016.7076H61.1723L58.7399%2024.1863H44.3043L41.6076%2032.7788H56.3604L53.9809%2040.3635Z%22%20fill%3D%22black%22/%3E%0A%3Cpath%20d%3D%22M65.6123%2040.3635H56.9933L69.9483%200.58344H84.331L83.8551%2022.0647L97.8676%200.58344H113.625L100.723%2040.3635H89.936L98.5021%2013.6313H98.3435L80.7353%2040.3635H74.3371L74.6015%2013.3131H74.4957L65.6123%2040.3635Z%22%20fill%3D%22black%22/%3E%0A%3Cpath%20d%3D%22M125.758%207.95602L121.581%2020.7917H122.744C125.388%2020.7917%20127.592%2020.1729%20129.354%2018.9353C131.117%2017.6624%20132.262%2015.859%20132.791%2013.5252C133.249%2011.5097%20133.003%2010.0776%20132.051%209.22898C131.099%208.38034%20129.513%207.95602%20127.292%207.95602H125.758ZM115.289%2040.3635H104.449L117.351%200.58344H130.517C133.549%200.58344%20136.158%201.07848%20138.343%202.06856C140.564%203.02328%20142.186%204.40233%20143.208%206.20569C144.266%207.97369%20144.618%2010.0423%20144.266%2012.4114C143.807%2015.5231%20142.609%2018.2635%20140.67%2020.6326C138.731%2023.0017%20136.211%2024.8405%20133.108%2026.1488C130.042%2027.4217%20126.604%2028.0582%20122.797%2028.0582H119.255L115.289%2040.3635Z%22%20fill%3D%22black%22/%3E%0A%3Cpath%20d%3D%22M170.103%2037.8176C166.507%2039.9392%20162.682%2041%20158.628%2041H158.523C154.927%2041%20151.895%2040.2044%20149.428%2038.6132C146.995%2036.9866%20145.25%2034.7943%20144.193%2032.0362C143.171%2029.2781%20142.924%2026.2549%20143.453%2022.9664C144.122%2018.8292%20145.656%2015.0103%20148.053%2011.5097C150.45%208.00906%20153.446%205.21561%20157.042%203.12937C160.638%201.04312%20164.48%200%20168.569%200H168.675C172.412%200%20175.496%200.795602%20177.929%202.38681C180.396%203.97801%20182.106%206.15265%20183.058%208.91074C184.045%2011.6335%20184.256%2014.6921%20183.692%2018.0867C183.023%2022.0824%20181.489%2025.8482%20179.092%2029.3842C176.695%2032.8849%20173.699%2035.696%20170.103%2037.8176ZM155.138%2030.9754C156.09%2032.7788%20157.747%2033.6805%20160.109%2033.6805H160.215C162.154%2033.6805%20163.951%2032.9556%20165.608%2031.5058C167.3%2030.0207%20168.728%2028.0405%20169.891%2025.5653C171.09%2023.0901%20171.971%2020.332%20172.535%2017.2911C173.064%2014.3208%20172.852%2011.934%20171.901%2010.1307C170.949%208.29194%20169.31%207.37257%20166.983%207.37257H166.877C165.079%207.37257%20163.335%208.11514%20161.642%209.60026C159.986%2011.0854%20158.54%2013.0832%20157.306%2015.5938C156.073%2018.1044%20155.174%2020.8271%20154.61%2023.762C154.046%2026.7322%20154.222%2029.1367%20155.138%2030.9754Z%22%20fill%3D%22black%22/%3E%0A%3C/svg%3E',
    dark: 'data:image/svg+xml,%3Csvg%20width%3D%22184%22%20height%3D%2241%22%20viewBox%3D%220%200%20184%2041%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cpath%20d%3D%22M13.6424%2040.3635H2.80251L12.8492%209.60026H0L2.80251%200.58344H38.6006L35.7981%209.60026H23.6362L13.6424%2040.3635Z%22%20fill%3D%22white%22/%3E%0A%3Cpath%20d%3D%22M53.9809%2040.3635H28.2824L41.1846%200.58344H66.7773L64.3449%208.16818H49.4863L46.7896%2016.7076H61.1723L58.7399%2024.1863H44.3043L41.6076%2032.7788H56.3604L53.9809%2040.3635Z%22%20fill%3D%22white%22/%3E%0A%3Cpath%20d%3D%22M65.6123%2040.3635H56.9933L69.9483%200.58344H84.331L83.8551%2022.0647L97.8676%200.58344H113.625L100.723%2040.3635H89.936L98.5021%2013.6313H98.3435L80.7353%2040.3635H74.3371L74.6015%2013.3131H74.4957L65.6123%2040.3635Z%22%20fill%3D%22white%22/%3E%0A%3Cpath%20d%3D%22M125.758%207.95602L121.581%2020.7917H122.744C125.388%2020.7917%20127.592%2020.1729%20129.354%2018.9353C131.117%2017.6624%20132.262%2015.859%20132.791%2013.5252C133.249%2011.5097%20133.003%2010.0776%20132.051%209.22898C131.099%208.38034%20129.513%207.95602%20127.292%207.95602H125.758ZM115.289%2040.3635H104.449L117.351%200.58344H130.517C133.549%200.58344%20136.158%201.07848%20138.343%202.06856C140.564%203.02328%20142.186%204.40233%20143.208%206.20569C144.266%207.97369%20144.618%2010.0423%20144.266%2012.4114C143.807%2015.5231%20142.609%2018.2635%20140.67%2020.6326C138.731%2023.0017%20136.211%2024.8405%20133.108%2026.1488C130.042%2027.4217%20126.604%2028.0582%20122.797%2028.0582H119.255L115.289%2040.3635Z%22%20fill%3D%22white%22/%3E%0A%3Cpath%20d%3D%22M170.103%2037.8176C166.507%2039.9392%20162.682%2041%20158.628%2041H158.523C154.927%2041%20151.895%2040.2044%20149.428%2038.6132C146.995%2036.9866%20145.25%2034.7943%20144.193%2032.0362C143.171%2029.2781%20142.924%2026.2549%20143.453%2022.9664C144.122%2018.8292%20145.656%2015.0103%20148.053%2011.5097C150.45%208.00906%20153.446%205.21561%20157.042%203.12937C160.638%201.04312%20164.48%200%20168.569%200H168.675C172.412%200%20175.496%200.795602%20177.929%202.38681C180.396%203.97801%20182.106%206.15265%20183.058%208.91074C184.045%2011.6335%20184.256%2014.6921%20183.692%2018.0867C183.023%2022.0824%20181.489%2025.8482%20179.092%2029.3842C176.695%2032.8849%20173.699%2035.696%20170.103%2037.8176ZM155.138%2030.9754C156.09%2032.7788%20157.747%2033.6805%20160.109%2033.6805H160.215C162.154%2033.6805%20163.951%2032.9556%20165.608%2031.5058C167.3%2030.0207%20168.728%2028.0405%20169.891%2025.5653C171.09%2023.0901%20171.971%2020.332%20172.535%2017.2911C173.064%2014.3208%20172.852%2011.934%20171.901%2010.1307C170.949%208.29194%20169.31%207.37257%20166.983%207.37257H166.877C165.079%207.37257%20163.335%208.11514%20161.642%209.60026C159.986%2011.0854%20158.54%2013.0832%20157.306%2015.5938C156.073%2018.1044%20155.174%2020.8271%20154.61%2023.762C154.046%2026.7322%20154.222%2029.1367%20155.138%2030.9754Z%22%20fill%3D%22white%22/%3E%0A%3C/svg%3E',
  },
  iconUrl: {
    light: '/icon-light.png',
    dark: '/icon-dark.png',
  },
  rootDir: '.',
  socials: [
    {
      icon: 'github',
      link: 'https://github.com/tempoxyz',
    },
    {
      icon: 'x',
      link: 'https://twitter.com/tempo',
    },
  ],
  sidebar: {
    '/': [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Using Tempo with AI',
        link: '/guide/using-tempo-with-ai',
      },
      {
        text: 'Build on Tempo',
        items: [
          {
            text: 'Getting Funds on Tempo',
            link: '/guide/getting-funds',
          },
          {
            text: 'Create & Use Accounts',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/guide/use-accounts',
              },
              {
                text: 'Embed Passkey accounts',
                link: '/guide/use-accounts/embed-passkeys',
              },
              {
                text: 'Connect to wallets',
                link: '/guide/use-accounts/connect-to-wallets',
              },
              {
                text: 'Add funds to your balance',
                link: '/guide/use-accounts/add-funds',
              },
            ],
          },
          {
            text: 'Make Payments',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/guide/payments',
              },
              {
                text: 'Send a payment',
                link: '/guide/payments/send-a-payment',
              },
              {
                text: 'Accept a payment',
                link: '/guide/payments/accept-a-payment',
              },
              {
                text: 'Attach a transfer memo',
                link: '/guide/payments/transfer-memos',
              },
              {
                text: 'Pay fees in any stablecoin',
                link: '/guide/payments/pay-fees-in-any-stablecoin',
              },
              {
                text: 'Sponsor user fees',
                link: '/guide/payments/sponsor-user-fees',
              },
              {
                text: 'Send parallel transactions',
                link: '/guide/payments/send-parallel-transactions',
              },
              // {
              //   text: 'Start a subscription 🚧',
              //   disabled: true,
              //   link: '/guide/payments/start-a-subscription',
              // },
              // {
              //   text: 'Private payments 🚧',
              //   disabled: true,
              //   link: '/guide/payments/private-payments',
              // },
            ],
          },
          {
            text: 'Issue Stablecoins',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/guide/issuance',
              },
              {
                text: 'Create a stablecoin',
                link: '/guide/issuance/create-a-stablecoin',
              },
              {
                text: 'Mint stablecoins',
                link: '/guide/issuance/mint-stablecoins',
              },
              {
                text: 'Use your stablecoin for fees',
                link: '/guide/issuance/use-for-fees',
              },
              {
                text: 'Distribute rewards',
                link: '/guide/issuance/distribute-rewards',
              },
              {
                text: 'Manage your stablecoin',
                link: '/guide/issuance/manage-stablecoin',
              },
            ],
          },
          {
            text: 'Exchange Stablecoins',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/guide/stablecoin-dex',
              },
              {
                text: 'Managing fee liquidity',
                link: '/guide/stablecoin-dex/managing-fee-liquidity',
              },
              {
                text: 'Executing swaps',
                link: '/guide/stablecoin-dex/executing-swaps',
              },
              {
                text: 'View the orderbook',
                link: '/guide/stablecoin-dex/view-the-orderbook',
              },
              {
                text: 'Providing liquidity',
                link: '/guide/stablecoin-dex/providing-liquidity',
              },
            ],
          },
          {
            text: 'Make Machine Payments',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/guide/machine-payments',
              },
              {
                text: 'Client quickstart',
                link: '/guide/machine-payments/client',
              },
              {
                text: 'Agent quickstart',
                link: '/guide/machine-payments/agent',
              },
              {
                text: 'Server quickstart',
                link: '/guide/machine-payments/server',
              },
              {
                text: 'Accept one-time payments',
                link: '/guide/machine-payments/one-time-payments',
              },
              {
                text: 'Accept pay-as-you-go payments',
                link: '/guide/machine-payments/pay-as-you-go',
              },
              {
                text: 'Accept streamed payments',
                link: '/guide/machine-payments/streamed-payments',
              },
            ],
          },
        ],
      },
      {
        text: 'Integrate Tempo',
        items: [
          {
            text: 'Overview',
            link: '/quickstart/integrate-tempo',
          },
          {
            text: 'Connect to the Network',
            link: '/quickstart/connection-details',
          },
          {
            text: 'Use Tempo Transactions',
            link: '/guide/tempo-transaction',
          },
          {
            text: 'Get Testnet Faucet Funds',
            link: '/quickstart/faucet',
          },
          {
            text: 'EVM Differences',
            link: '/quickstart/evm-compatibility',
          },
          {
            text: 'Predeployed Contracts',
            link: '/quickstart/predeployed-contracts',
          },
          {
            text: 'Token List Registry',
            link: '/quickstart/tokenlist',
          },
          {
            text: 'Wallet Developers',
            link: '/quickstart/wallet-developers',
          },
          {
            text: 'Contract Verification',
            link: '/quickstart/verify-contracts',
          },
          {
            text: 'Bridge USDC via Stargate',
            link: '/guide/bridge-usdc-stargate',
          },
          {
            text: 'Ecosystem',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/ecosystem',
              },
              {
                text: 'Bridges & Exchanges',
                link: '/ecosystem/bridges',
              },
              {
                text: 'Data & Analytics',
                link: '/ecosystem/data-analytics',
              },
              {
                text: 'Block Explorers',
                link: '/ecosystem/block-explorers',
              },
              {
                text: 'Wallets',
                link: '/ecosystem/wallets',
              },
              {
                text: 'Smart Contract Libraries',
                link: '/ecosystem/smart-contract-libraries',
              },
              {
                text: 'Node Infrastructure',
                link: '/ecosystem/node-infrastructure',
              },
              {
                text: 'Security & Compliance',
                link: '/ecosystem/security-compliance',
              },
              {
                text: 'Issuance & Orchestration',
                link: '/ecosystem/orchestration',
              },
            ],
          },
        ],
      },
      {
        text: 'Tempo Protocol Specs',
        items: [
          {
            text: 'Overview',
            link: '/protocol',
          },
          {
            text: 'TIP-20 Tokens',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/protocol/tip20/overview',
              },
              {
                text: 'Specification',
                link: '/protocol/tip20/spec',
              },
              {
                text: 'Reference Implementation',
                link: 'https://github.com/tempoxyz/tempo/blob/main/tips/ref-impls/src/TIP20.sol',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip20',
              },
            ],
          },
          {
            text: 'TIP-20 Rewards',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/protocol/tip20-rewards/overview',
              },
              {
                text: 'Specification',
                link: '/protocol/tip20-rewards/spec',
              },
            ],
          },
          {
            text: 'TIP-403 Policies',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/protocol/tip403/overview',
              },
              {
                text: 'Specification',
                link: '/protocol/tip403/spec',
              },
              {
                text: 'Reference Implementation',
                link: 'https://github.com/tempoxyz/tempo/blob/main/tips/ref-impls/src/TIP403Registry.sol',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip403_registry',
              },
            ],
          },
          {
            text: 'Fees',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/protocol/fees',
              },
              {
                text: 'Specification',
                link: '/protocol/fees/spec-fee',
              },
              {
                text: 'Fee AMM',
                collapsed: true,
                items: [
                  {
                    text: 'Overview',
                    link: '/protocol/fees/fee-amm',
                  },
                  {
                    text: 'Specification',
                    link: '/protocol/fees/spec-fee-amm',
                  },
                  {
                    text: 'Reference Implementation',
                    link: 'https://github.com/tempoxyz/tempo/blob/main/tips/ref-impls/src/FeeManager.sol',
                  },
                  {
                    text: 'Rust Implementation',
                    link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip_fee_manager',
                  },
                ],
              },
            ],
          },
          {
            text: 'Tempo Transactions',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/protocol/transactions',
              },
              {
                text: 'Specification',
                link: '/protocol/transactions/spec-tempo-transaction',
              },
              {
                text: 'EIP-4337 Comparison',
                link: '/protocol/transactions/eip-4337',
              },
              {
                text: 'EIP-7702 Comparison',
                link: '/protocol/transactions/eip-7702',
              },
              {
                text: 'Account Keychain Precompile Specification',
                link: '/protocol/transactions/AccountKeychain',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/blob/main/crates/primitives/src/transaction/tempo_transaction.rs',
              },
            ],
          },
          {
            text: 'Blockspace',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/protocol/blockspace/overview',
              },
              {
                text: 'Payment Lane Specification',
                link: '/protocol/blockspace/payment-lane-specification',
              },
              {
                text: 'Consensus and Finality',
                link: '/protocol/blockspace/consensus',
              },
            ],
          },
          {
            text: 'Stablecoin DEX',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/protocol/exchange',
              },
              {
                text: 'Specification',
                link: '/protocol/exchange/spec',
              },
              {
                text: 'Quote Tokens',
                link: '/protocol/exchange/quote-tokens',
              },
              {
                text: 'Executing Swaps',
                link: '/protocol/exchange/executing-swaps',
              },
              {
                text: 'Providing Liquidity',
                link: '/protocol/exchange/providing-liquidity',
              },
              {
                text: 'DEX Balance',
                link: '/protocol/exchange/exchange-balance',
              },
              {
                text: 'Reference Implementation',
                link: 'https://github.com/tempoxyz/tempo/blob/main/tips/ref-impls/src/stablecoinDex.sol',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/stablecoin_exchange',
              },
            ],
          },
          {
            text: 'TIPs',
            link: '/protocol/tips',
          },
        ],
      },
      {
        text: 'Tempo Developer Tools',
        items: [
          {
            text: 'CLI',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/cli',
              },
              {
                text: 'Wallet',
                link: '/cli/wallet',
              },
              {
                text: 'Request',
                link: '/cli/request',
              },
              {
                text: 'Download',
                link: '/cli/download',
              },
              {
                text: 'Node',
                link: '/cli/node',
              },
            ],
          },
          {
            text: 'SDKs',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/sdk',
              },
              {
                text: 'TypeScript',
                collapsed: true,
                items: [
                  {
                    text: 'Overview',
                    link: '/sdk/typescript',
                  },
                  {
                    text: 'Viem Reference',
                    link: 'https://viem.sh/tempo',
                  },
                  {
                    text: 'Wagmi Reference',
                    link: 'https://wagmi.sh/tempo',
                  },
                  {
                    text: 'Server Reference',
                    items: [
                      {
                        text: 'Handlers',
                        items: [
                          {
                            text: 'Overview',
                            link: '/sdk/typescript/server/handlers',
                          },
                          {
                            text: 'compose',
                            link: '/sdk/typescript/server/handler.compose',
                          },
                          {
                            text: 'feePayer',
                            link: '/sdk/typescript/server/handler.feePayer',
                          },
                          {
                            text: 'keyManager',
                            link: '/sdk/typescript/server/handler.keyManager',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    text: 'Prool Reference',
                    items: [
                      {
                        text: 'Setup',
                        link: '/sdk/typescript/prool/setup',
                      },
                    ],
                  },
                ],
              },
              {
                text: 'Go',
                link: '/sdk/go',
              },
              {
                text: 'Foundry',
                link: '/sdk/foundry',
              },
              {
                text: 'Python',
                link: '/sdk/python',
              },
              {
                text: 'Rust',
                link: '/sdk/rust',
              },
            ],
          },
        ],
      },
      {
        text: 'Run a Tempo Node',
        collapsed: true,
        items: [
          {
            text: 'Overview',
            link: '/guide/node',
          },
          {
            text: 'System Requirements',
            link: '/guide/node/system-requirements',
          },
          {
            text: 'Installation',
            link: '/guide/node/installation',
          },
          {
            text: 'Running an RPC Node',
            link: '/guide/node/rpc',
          },
          {
            text: 'Running a validator',
            link: '/guide/node/validator',
          },
          {
            text: 'Operating your validator',
            link: '/guide/node/operate-validator',
          },
          {
            text: 'Network Upgrades and Releases',
            link: '/guide/node/network-upgrades',
          },
          {
            text: 'Changelog',
            link: '/changelog',
          },
        ],
      },
      // {
      //   text: 'Infrastructure & Tooling',
      //   items: [
      //     {
      //       text: 'Overview',
      //       link: '/guide/infrastructure',
      //     },
      //     {
      //       text: 'Data Indexers',
      //       link: '/guide/infrastructure/data-indexers',
      //     },
      //     {
      //       text: 'Developer Tools',
      //       link: '/guide/infrastructure/developer-tools',
      //     },
      //     {
      //       text: 'Node Providers',
      //       link: '/guide/infrastructure/node-providers',
      //     },
      //   ],
      // },
    ],
    '/learn': [
      {
        text: 'Home',
        link: '/learn',
      },
      {
        text: 'Partners',
        link: '/learn/partners',
      },
      {
        text: 'Blog',
        link: 'https://tempo.xyz/blog',
      },
      {
        text: 'Stablecoins',
        items: [
          {
            text: 'Overview',
            link: '/learn/stablecoins',
          },
          {
            text: 'Remittances',
            link: '/learn/use-cases/remittances',
          },
          {
            text: 'Global Payouts',
            link: '/learn/use-cases/global-payouts',
          },
          {
            text: 'Payroll',
            link: '/learn/use-cases/payroll',
          },
          {
            text: 'Embedded Finance',
            link: '/learn/use-cases/embedded-finance',
          },
          {
            text: 'Tokenized Deposits',
            link: '/learn/use-cases/tokenized-deposits',
          },
          {
            text: 'Microtransactions',
            link: '/learn/use-cases/microtransactions',
          },
          {
            text: 'Agentic Commerce',
            link: '/learn/use-cases/agentic-commerce',
          },
        ],
      },
      {
        text: 'Tempo',
        items: [
          {
            text: 'Overview',
            link: '/learn/tempo',
          },
          {
            text: 'Native Stablecoins',
            link: '/learn/tempo/native-stablecoins',
          },
          {
            text: 'Modern Transactions',
            link: '/learn/tempo/modern-transactions',
          },
          {
            text: 'Performance',
            link: '/learn/tempo/performance',
          },
          {
            text: 'Onchain FX',
            link: '/learn/tempo/fx',
          },
          {
            text: 'Privacy',
            link: '/learn/tempo/privacy',
          },
          {
            text: 'Machine Payments',
            link: '/learn/tempo/machine-payments',
          },
        ],
      },
    ],
  },
  topNav: [
    { text: 'Learn', link: '/learn' },
    {
      text: 'Docs',
      link: '/',
    },

    { text: 'Ecosystem', link: 'https://tempo.xyz/ecosystem' },
    { text: 'Blog', link: 'https://tempo.xyz/blog' },
  ],
  redirects: [
    {
      source: '/documentation/protocol/:path*',
      destination: '/protocol/:path*',
    },
    {
      source: '/stablecoin-exchange/:path*',
      destination: '/stablecoin-dex/:path*',
      status: 301,
    },
    {
      source: '/quickstart/developer-tools',
      destination: '/ecosystem',
      status: 301,
    },
    {
      source: '/guide/ai-support',
      destination: '/guide/building-with-ai',
    },
    {
      source: '/guide/building-with-ai',
      destination: '/guide/using-tempo-with-ai',
    },
    {
      source: '/guide',
      destination: '/quickstart/integrate-tempo',
    },
    {
      source: '/quickstart',
      destination: '/quickstart/integrate-tempo',
    },
    {
      source: '/protocol/blockspace',
      destination: '/protocol/blockspace/overview',
    },
    {
      source: '/protocol/tip20',
      destination: '/protocol/tip20/overview',
    },
    {
      source: '/protocol/tip20-rewards',
      destination: '/protocol/tip20-rewards/overview',
    },
    {
      source: '/protocol/tip403',
      destination: '/protocol/tip403/overview',
    },
    {
      source: '/learn/use-cases',
      destination: '/learn/use-cases/remittances',
    },
    {
      source: '/sdk/typescript/server',
      destination: '/sdk/typescript/server/handlers',
    },
    {
      source: '/sdk/typescript/prool',
      destination: '/sdk/typescript/prool/setup',
    },
    {
      source: '/wallet',
      destination: '/cli',
      status: 301,
    },
    {
      source: '/wallet/reference',
      destination: '/cli/wallet',
      status: 301,
    },
    {
      source: '/wallet/:path*',
      destination: '/cli/:path*',
      status: 301,
    },
    {
      source: '/cli/reference',
      destination: '/cli/wallet',
      status: 301,
    },
    {
      source: '/guide/use-accounts/fee-sponsorship',
      destination: '/guide/payments/sponsor-user-fees',
      status: 301,
    },
    {
      source: '/quickstart/tip20',
      destination: '/protocol/tip20/overview',
      status: 301,
    },
    {
      source: '/protocol/exchange/pathUSD',
      destination: '/protocol/exchange/quote-tokens#pathusd',
      status: 301,
    },
  ],
  codeHighlight: {
    langAlias: {
      sol: 'solidity',
    },
  },
  twoslash: {
    twoslashOptions: {
      compilerOptions: {
        // ModuleResolutionKind.Bundler = 100
        moduleResolution: 100,
      },
    },
  },
  markdown: {
    code: {
      langAlias: {
        sol: 'solidity',
      },
    },
  },
})
