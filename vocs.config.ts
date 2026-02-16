import { Changelog, defineConfig, Feedback, McpSource } from 'vocs/config'

const baseUrl = (() => {
  if (URL.canParse(process.env.VITE_BASE_URL)) return process.env.VITE_BASE_URL
  // VERCEL_BRANCH_URL is the stable URL for the branch (e.g., next.docs.tempo.xyz)
  // VERCEL_URL is the deployment-specific URL which causes CORS issues with custom domains
  if (process.env.VERCEL_ENV === 'production')
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return ''
})()

export default defineConfig({
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
  feedback: Feedback.slack(),
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
  logoUrl: {
    light: '/lockup-light.svg',
    dark: '/lockup-dark.svg',
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
        text: 'Changelog',
        link: '/changelog',
      },
      {
        text: 'Integrate Tempo Testnet',
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
            text: 'Get Faucet Funds',
            link: '/quickstart/faucet',
          },
          {
            text: 'Developer Tools',
            link: '/quickstart/developer-tools',
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
            text: 'Building with AI',
            link: '/guide/building-with-ai',
          },
        ],
      },
      {
        text: 'Start Building on Tempo',
        items: [
          {
            text: 'Use Tempo Transactions',
            link: '/guide/tempo-transaction',
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
                text: 'Sub-block Specification',
                link: '/protocol/blockspace/sub-block-specification',
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
        text: 'Tempo SDKs',
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
            text: 'Rust',
            link: '/sdk/rust',
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
      source: '/errors/tx/SubblockNonceKey',
      destination: '/protocol/blockspace/sub-block-specification#4-block-validity-rules',
    },
    {
      source: '/stablecoin-exchange/:path*',
      destination: '/stablecoin-dex/:path*',
      status: 301,
    },
    {
      source: '/guide/ai-support',
      destination: '/guide/building-with-ai',
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
