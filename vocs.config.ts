import { Changelog, defineConfig, McpSource } from 'vocs/config'
import { createFeedbackAdapter } from './src/lib/feedback-adapter'

// Only set baseUrl in production — Vocs injects a <base> tag from this value,
// which causes all links to resolve to the absolute URL on preview deployments.
const baseUrl = (() => {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return ''
  if (URL.canParse(process.env.VITE_BASE_URL)) return process.env.VITE_BASE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_ENV === 'production') return 'https://tempo.xyz/developers'
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (productionUrl) return `https://${productionUrl}`
  return ''
})()

export default defineConfig({
  // banner: {
  //   dismissable: false,
  //   backgroundColor: '#5B4CDB',
  //   content: 'Your announcement here. [Learn more.](https://tempo.xyz) →',
  //   height: '40px',
  //   textColor: 'white',
  // },
  changelog: Changelog.github({ prereleases: true, repo: 'tempoxyz/tempo' }),
  checkDeadlinks: true,
  editLink: {
    link: 'https://github.com/tempoxyz/docs/edit/main/src/pages/:path',
    text: 'Suggest changes to this page',
  },
  title: 'Tempo',
  titleTemplate: '%s ⋅ Tempo',
  description: 'Documentation for the Tempo network and protocol specifications',
  renderStrategy: 'partial-static',
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
  ogImageUrl: (path, options = {}) => {
    const urlBase = options.baseUrl?.replace(/\/$/, '') ?? ''
    const docsPath = path.replace(/^\/docs(?=\/|$)/, '') || '/'
    const landingPaths = ['/', '/changelog']
    if (landingPaths.includes(docsPath)) return `${urlBase}/og-docs.png`

    const sectionMap: Record<string, string> = {
      quickstart: 'INTEGRATE',
      guide: 'BUILD',
      protocol: 'PROTOCOL',
      sdk: 'SDKs',
      cli: 'CLI',
      ecosystem: 'ECOSYSTEM',
      'hosted-services': 'HOSTED SERVICES',
      wallet: 'WALLET',
    }

    const subsectionMap: Record<string, string> = {
      payments: 'PAYMENTS',
      issuance: 'ISSUANCE',
      'stablecoin-dex': 'EXCHANGE',
      'machine-payments': 'MACHINE PAY',
      'tempo-transaction': 'TRANSACTIONS',
      tip20: 'TIP-20',
      'tip20-rewards': 'REWARDS',
      tip403: 'TIP-403',
      fees: 'FEES',
      transactions: 'TRANSACTIONS',
      blockspace: 'BLOCKSPACE',
      exchange: 'DEX',
      tips: 'TIPS',
      node: 'NODE',
      typescript: 'TYPESCRIPT',
      go: 'GO',
      foundry: 'FOUNDRY',
      python: 'PYTHON',
      rust: 'RUST',
      stablecoins: 'STABLECOINS',
      'use-cases': 'USE CASES',
      tempo: 'TEMPO',
      upgrades: 'UPGRADES',
      api: 'API',
      guides: 'GUIDES',
      rpc: 'RPC',
      server: 'SERVER',
      wagmi: 'WAGMI',
    }

    const segments = docsPath.split('/').filter(Boolean)
    const firstSeg = segments[0] || ''
    const secondSeg = segments[1] || ''
    const section = sectionMap[firstSeg] || firstSeg.toUpperCase().replace(/-/g, ' ')
    const subsection =
      segments.length >= 3 && subsectionMap[secondSeg]
        ? subsectionMap[secondSeg]
        : segments.length >= 3
          ? secondSeg.toUpperCase().replace(/-/g, ' ')
          : ''

    const extra = new URLSearchParams({
      section,
      ...(subsection ? { subsection } : {}),
      v: '2',
    }).toString()

    return `${urlBase}/api/og?title=%title&description=%description&${extra}`
  },
  openapi: [
    {
      path: '/docs/api',
      spec: 'https://api.tempo.xyz/openapi.json',
      sidebar: {
        collapsed: true,
        backLink: false,
        intro: [
          {
            text: 'Authentication',
            link: '/docs/api/authentication',
          },
          {
            text: 'Conventions',
            link: '/docs/api/conventions',
          },
          {
            text: 'Transactions & Transfers',
            link: '/docs/api/transactions-and-transfers',
          },
          {
            text: 'JSON-RPC API',
            link: '/docs/api/json-rpc',
          },
          {
            text: 'Indexer API',
            link: '/docs/api/indexer-api',
          },
          {
            text: 'Pagination',
            link: '/docs/api/pagination',
          },
          {
            text: 'Rate Limits',
            link: '/docs/api/rate-limits',
          },
          {
            text: 'Errors',
            link: '/docs/api/errors',
          },
          {
            text: 'Versioning Policy',
            link: '/docs/api/versioning-policy',
          },
        ],
      },
    },
  ],
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
  sidebar: (() => {
    const docsSidebar = [
      {
        text: 'Get Started',
        link: '/docs',
      },
      {
        text: 'AI',
        link: '/docs/guide/using-tempo-with-ai',
      },
      {
        text: 'Partners',
        link: '/docs/partners',
      },
      {
        text: 'Build on Tempo',
        items: [
          {
            text: 'Overview',
            link: '/docs/build',
          },
          {
            text: 'Getting Funds on Tempo',
            link: '/docs/guide/getting-funds',
          },
          {
            text: 'Make Payments',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/guide/payments',
              },
              {
                text: 'Send a payment',
                link: '/docs/guide/payments/send-a-payment',
              },
              {
                text: 'Accept a payment',
                link: '/docs/guide/payments/accept-a-payment',
              },
              {
                text: 'Configure receive policies',
                link: '/docs/guide/payments/configure-receive-policies',
              },
              {
                text: 'Attach a transfer memo',
                link: '/docs/guide/payments/transfer-memos',
              },
              {
                text: 'Use virtual addresses',
                link: '/docs/guide/payments/virtual-addresses',
              },
              {
                text: 'Pay fees in any stablecoin',
                link: '/docs/guide/payments/pay-fees-in-any-stablecoin',
              },
              {
                text: 'Sponsor user fees',
                link: '/docs/guide/payments/sponsor-user-fees',
              },
              {
                text: 'Send parallel transactions',
                link: '/docs/guide/payments/send-parallel-transactions',
              },
              // {
              //   text: 'Start a subscription 🚧',
              //   disabled: true,
              //   link: '/docs/guide/payments/start-a-subscription',
              // },
              // {
              //   text: 'Private payments 🚧',
              //   disabled: true,
              //   link: '/docs/guide/payments/private-payments',
              // },
            ],
          },
          {
            text: 'Issue Stablecoins',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/guide/issuance',
              },
              {
                text: 'Create a stablecoin',
                link: '/docs/guide/issuance/create-a-stablecoin',
              },
              {
                text: 'Mint stablecoins',
                link: '/docs/guide/issuance/mint-stablecoins',
              },
              {
                text: 'Use your stablecoin for fees',
                link: '/docs/guide/issuance/use-for-fees',
              },
              {
                text: 'Distribute rewards',
                link: '/docs/guide/issuance/distribute-rewards',
              },
              {
                text: 'Manage your stablecoin',
                link: '/docs/guide/issuance/manage-stablecoin',
              },
            ],
          },
          {
            text: 'Exchange Stablecoins',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/guide/stablecoin-dex',
              },
              {
                text: 'Managing fee liquidity',
                link: '/docs/guide/stablecoin-dex/managing-fee-liquidity',
              },
              {
                text: 'Executing swaps',
                link: '/docs/guide/stablecoin-dex/executing-swaps',
              },
              {
                text: 'Providing liquidity',
                link: '/docs/guide/stablecoin-dex/providing-liquidity',
              },
            ],
          },
          {
            text: 'Private Zones',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/guide/private-zones',
              },
              {
                text: 'Connect to a zone',
                link: '/docs/guide/private-zones/connect-to-a-zone',
              },
              {
                text: 'Deposit to a zone',
                link: '/docs/guide/private-zones/deposit-to-a-zone',
              },
              {
                text: 'Send tokens within a zone',
                link: '/docs/guide/private-zones/send-tokens-within-a-zone',
              },
              {
                text: 'Send tokens across zones',
                link: '/docs/guide/private-zones/send-tokens-across-zones',
              },
              {
                text: 'Swap across zones',
                link: '/docs/guide/private-zones/swap-across-zones',
              },
              {
                text: 'Withdraw from a zone',
                link: '/docs/guide/private-zones/withdraw-from-a-zone',
              },
            ],
          },
          {
            text: 'Make Agentic Payments',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/guide/machine-payments',
              },
              {
                text: 'Client quickstart',
                link: '/docs/guide/machine-payments/client',
              },
              {
                text: 'Agent quickstart',
                link: '/docs/guide/machine-payments/agent',
              },
              {
                text: 'Discover MPP services',
                link: '/docs/guide/machine-payments/discover-services',
              },
              {
                text: 'Server quickstart',
                link: '/docs/guide/machine-payments/server',
              },
              {
                text: 'Accept one-time payments',
                link: '/docs/guide/machine-payments/one-time-payments',
              },
              {
                text: 'Accept pay-as-you-go payments',
                link: '/docs/guide/machine-payments/pay-as-you-go',
              },
              {
                text: 'Accept streamed payments',
                link: '/docs/guide/machine-payments/streamed-payments',
              },
              {
                text: 'Use Cases',
                collapsed: false,
                items: [
                  {
                    text: 'Monetize Your API',
                    link: '/docs/guide/machine-payments/use-cases/monetize-your-api',
                  },
                  {
                    text: 'AI Model Access',
                    link: '/docs/guide/machine-payments/use-cases/ai-model-access',
                  },
                  {
                    text: 'Web Search & Research',
                    link: '/docs/guide/machine-payments/use-cases/web-search-and-research',
                  },
                  {
                    text: 'Image & Media Generation',
                    link: '/docs/guide/machine-payments/use-cases/image-and-media-generation',
                  },
                  {
                    text: 'Browser Automation',
                    link: '/docs/guide/machine-payments/use-cases/browser-automation',
                  },
                  {
                    text: 'Compute & Code Execution',
                    link: '/docs/guide/machine-payments/use-cases/compute-and-code-execution',
                  },
                  {
                    text: 'Storage',
                    link: '/docs/guide/machine-payments/use-cases/storage',
                  },
                  {
                    text: 'Blockchain Data & Analytics',
                    link: '/docs/guide/machine-payments/use-cases/blockchain-data',
                  },
                  {
                    text: 'Financial & Market Data',
                    link: '/docs/guide/machine-payments/use-cases/financial-data',
                  },
                  {
                    text: 'Data Enrichment & Leads',
                    link: '/docs/guide/machine-payments/use-cases/data-enrichment-and-leads',
                  },
                  {
                    text: 'Translation & Language',
                    link: '/docs/guide/machine-payments/use-cases/translation-and-language',
                  },
                  {
                    text: 'Maps & Location Data',
                    link: '/docs/guide/machine-payments/use-cases/location-and-maps',
                  },
                  {
                    text: 'Agent-to-Agent Services',
                    link: '/docs/guide/machine-payments/use-cases/agent-to-agent',
                  },
                ],
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
            link: '/docs/quickstart/integrate-tempo',
          },
          {
            text: 'Connect to the Network',
            link: '/docs/quickstart/connection-details',
          },
          {
            text: 'Use Tempo Transactions',
            link: '/docs/guide/tempo-transaction',
          },
          {
            text: 'Get Testnet Faucet Funds',
            link: '/docs/quickstart/faucet',
          },
          {
            text: 'EVM Differences',
            link: '/docs/quickstart/evm-compatibility',
          },
          {
            text: 'Predeployed Contracts',
            link: '/docs/quickstart/predeployed-contracts',
          },
          {
            text: 'Token List Registry',
            link: '/docs/quickstart/tokenlist',
          },
          {
            text: 'Wallet Developers',
            link: '/docs/quickstart/wallet-developers',
          },
          {
            text: 'Contract Verification',
            link: '/docs/quickstart/verify-contracts',
          },
          {
            text: 'Bridging',
            collapsed: false,
            items: [
              {
                text: 'Bridge via LayerZero',
                link: '/docs/guide/bridge-layerzero',
              },
              {
                text: 'Bridge via Bungee',
                link: '/docs/guide/bridge-bungee',
              },
              {
                text: 'Bridge via Relay',
                link: '/docs/guide/bridge-relay',
              },
            ],
          },
          {
            text: 'Ecosystem',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/ecosystem',
              },
              {
                text: 'Bridges & Exchanges',
                link: '/docs/ecosystem/bridges',
              },
              {
                text: 'Data & Analytics',
                link: '/docs/ecosystem/data-analytics',
              },
              {
                text: 'Block Explorers',
                link: '/docs/ecosystem/block-explorers',
              },
              {
                text: 'Wallets',
                link: '/docs/ecosystem/wallets',
              },
              {
                text: 'Smart Contract Libraries',
                link: '/docs/ecosystem/smart-contract-libraries',
              },
              {
                text: 'Node Infrastructure',
                link: '/docs/ecosystem/node-infrastructure',
              },
              {
                text: 'Security & Compliance',
                link: '/docs/ecosystem/security-compliance',
              },
              {
                text: 'Issuance & Orchestration',
                link: '/docs/ecosystem/orchestration',
              },
            ],
          },
        ],
      },
      {
        text: 'Tempo Protocol',
        items: [
          {
            text: 'Overview',
            link: '/docs/protocol',
          },
          {
            text: 'TIP-20 Tokens',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/tip20/overview',
              },
              {
                text: 'Specification',
                link: '/docs/protocol/tip20/spec',
              },
              {
                text: 'Virtual addresses',
                link: '/docs/protocol/tip20/virtual-addresses',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip20',
              },
            ],
          },
          {
            text: 'Tempo Token Rewards',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/tip20-rewards/overview',
              },
              {
                text: 'Specification',
                link: '/docs/protocol/tip20-rewards/spec',
              },
            ],
          },
          {
            text: 'Tempo Policies (TIP-403)',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/tip403/overview',
              },
              {
                text: 'Specification',
                link: '/docs/protocol/tip403/spec',
              },
              {
                text: 'Receive Policies',
                link: '/docs/protocol/tip403/receive-policies',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip403_registry',
              },
            ],
          },
          {
            text: 'Fees',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/fees',
              },
              {
                text: 'Specification',
                link: '/docs/protocol/fees/spec-fee',
              },
              {
                text: 'Fee AMM',
                collapsed: false,
                items: [
                  {
                    text: 'Overview',
                    link: '/docs/protocol/fees/fee-amm',
                  },
                  {
                    text: 'Specification',
                    link: '/docs/protocol/fees/spec-fee-amm',
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
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/transactions',
              },
              {
                text: 'Specification',
                link: '/docs/protocol/transactions/spec-tempo-transaction',
              },
              {
                text: 'EIP-4337 Comparison',
                link: '/docs/protocol/transactions/eip-4337',
              },
              {
                text: 'EIP-7702 Comparison',
                link: '/docs/protocol/transactions/eip-7702',
              },
              {
                text: 'Account Keychain Precompile Specification',
                link: '/docs/protocol/transactions/AccountKeychain',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/blob/main/crates/primitives/src/transaction/tempo_transaction.rs',
              },
            ],
          },
          {
            text: 'Blockspace',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/blockspace/overview',
              },
              {
                text: 'Payment Lane Specification',
                link: '/docs/protocol/blockspace/payment-lane-specification',
              },
              {
                text: 'Consensus and Finality',
                link: '/docs/protocol/blockspace/consensus',
              },
            ],
          },
          {
            text: 'Stablecoin DEX',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/exchange',
              },
              {
                text: 'Specification',
                link: '/docs/protocol/exchange/spec',
              },
              {
                text: 'Quote Tokens',
                link: '/docs/protocol/exchange/quote-tokens',
              },
              {
                text: 'Executing Swaps',
                link: '/docs/protocol/exchange/executing-swaps',
              },
              {
                text: 'Providing Liquidity',
                link: '/docs/protocol/exchange/providing-liquidity',
              },
              {
                text: 'DEX Balance',
                link: '/docs/protocol/exchange/exchange-balance',
              },
              {
                text: 'Rust Implementation',
                link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/stablecoin_dex',
              },
            ],
          },
          {
            text: 'Zones',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/zones',
              },
              {
                text: 'Architecture',
                link: '/docs/protocol/zones/architecture',
              },
              {
                text: 'Accounts',
                link: '/docs/protocol/zones/accounts',
              },
              {
                text: 'Bridging',
                link: '/docs/protocol/zones/bridging',
              },
              {
                text: 'RPC',
                link: '/docs/protocol/zones/rpc',
              },
              {
                text: 'Execution and gas',
                link: '/docs/protocol/zones/execution',
              },
              {
                text: 'Proving',
                link: '/docs/protocol/zones/proving',
              },
            ],
          },
          {
            text: 'Network Upgrades',
            collapsed: false,
            items: [
              {
                text: 'T7',
                badge: { text: 'Next', variant: 'note' },
                link: '/docs/protocol/upgrades/t7',
              },
              {
                text: 'T6',
                badge: { text: 'Latest', variant: 'info' },
                link: '/docs/protocol/upgrades/t6',
              },
              {
                text: 'T5',
                link: '/docs/protocol/upgrades/t5',
              },
              {
                text: 'T4',
                link: '/docs/protocol/upgrades/t4',
              },
              {
                text: 'T3',
                link: '/docs/protocol/upgrades/t3',
              },
              {
                text: 'T2',
                link: '/docs/protocol/upgrades/t2',
              },
            ],
          },
          {
            text: 'TIPs',
            link: '/docs/protocol/tips',
          },
        ],
      },
      {
        text: 'Tools & SDKs',
        items: [
          {
            text: 'Overview',
            link: '/docs/tools',
          },
          {
            text: 'Hosted Services',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/hosted-services',
              },
              {
                text: 'Hosted Fee Payer',
                link: '/docs/developer-tools/fee-payer',
              },
              {
                text: 'Indexer (tidx)',
                link: '/docs/developer-tools/indexer',
              },
            ],
          },
          {
            text: 'CLI',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/cli',
              },
              {
                text: 'Wallet CLI',
                link: '/docs/cli/wallet',
              },
              {
                text: 'Request',
                link: '/docs/cli/request',
              },
              {
                text: 'Download',
                link: '/docs/cli/download',
              },
              {
                text: 'Node',
                link: '/docs/cli/node',
              },
            ],
          },
          {
            text: 'Tempo Wallet',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/wallet',
              },
              {
                text: 'Recipes',
                link: '/docs/wallet/recipes',
              },
              {
                text: 'Reference',
                link: '/docs/wallet/reference',
              },
              {
                text: 'Use with agents',
                link: '/docs/wallet/use-with-agents',
              },
            ],
          },
          {
            text: 'RPC Reference',
            link: '/docs/protocol/rpc',
          },
          {
            text: 'SDKs',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/sdk',
              },
              {
                text: 'TypeScript',
                collapsed: false,
                items: [
                  {
                    text: 'Overview',
                    link: '/docs/sdk/typescript',
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
                    text: 'Prool Reference',
                    items: [
                      {
                        text: 'Setup',
                        link: '/docs/sdk/typescript/prool/setup',
                      },
                    ],
                  },
                ],
              },
              {
                text: 'Go',
                link: '/docs/sdk/go',
              },
              {
                text: 'Foundry',
                collapsed: false,
                items: [
                  {
                    text: 'Overview',
                    link: '/docs/sdk/foundry',
                  },
                  {
                    text: 'Use MPP with Foundry',
                    link: '/docs/sdk/foundry/mpp',
                  },
                  {
                    text: 'Signature Verification',
                    link: '/docs/sdk/foundry/signature-verifier',
                  },
                ],
              },
              {
                text: 'Python',
                link: '/docs/sdk/python',
              },
              {
                text: 'Rust',
                link: '/docs/sdk/rust',
              },
            ],
          },
        ],
      },
      {
        text: 'Run a Tempo Node',
        items: [
          {
            text: 'Overview',
            link: '/docs/guide/node',
          },
          {
            text: 'System Requirements',
            link: '/docs/guide/node/system-requirements',
          },
          {
            text: 'Installation',
            link: '/docs/guide/node/installation',
          },
          {
            text: 'Running RPC and Standby Nodes',
            link: '/docs/guide/node/rpc',
          },
          {
            text: 'Running a validator',
            items: [
              {
                text: 'Overview',
                link: '/docs/guide/node/validator',
              },
              {
                text: 'Validator Onboarding',
                link: '/docs/guide/node/validator-setup',
              },
              {
                text: 'Checking validator status',
                link: '/docs/guide/node/validator-status',
              },
              {
                text: 'Controlling validator lifecycle',
                link: '/docs/guide/node/validator-lifecycle',
              },
              {
                text: 'Managing validator keys',
                link: '/docs/guide/node/validator-keys',
              },
              {
                text: 'Validator failover',
                link: '/docs/guide/node/validator-failover',
              },
              {
                text: 'Monitoring a validator',
                link: '/docs/guide/node/validator-monitoring',
              },
              {
                text: 'Troubleshooting and FAQ',
                link: '/docs/guide/node/validator-troubleshooting',
              },
            ],
          },
          {
            text: 'Node Security',
            link: '/docs/guide/node/security',
          },
          {
            text: 'Network Upgrades and Releases',
            items: [
              {
                text: 'Upgrade Cadence',
                link: '/docs/guide/node/upgrade-cadence',
              },
              {
                text: 'Upgrades and Releases',
                link: '/docs/guide/node/network-upgrades',
              },
            ],
          },
          {
            text: 'Changelog',
            link: '/docs/changelog',
          },
        ],
      },
      // {
      //   text: 'Infrastructure & Tooling',
      //   items: [
      //     {
      //       text: 'Overview',
      //       link: '/docs/guide/infrastructure',
      //     },
      //     {
      //       text: 'Data Indexers',
      //       link: '/docs/guide/infrastructure/data-indexers',
      //     },
      //     {
      //       text: 'Developer Tools',
      //       link: '/docs/guide/infrastructure/developer-tools',
      //     },
      //     {
      //       text: 'Node Providers',
      //       link: '/docs/guide/infrastructure/node-providers',
      //     },
      //   ],
      // },
    ]

    const section = (text: string) => {
      const item = docsSidebar.find((item) => item.text === text)
      return item ? [item] : []
    }

    const docsHomeSidebar = [
      {
        text: 'First Steps',
        items: [
          { text: 'Connect to Tempo', link: '/docs/quickstart/integrate-tempo' },
          { text: 'Get Funds', link: '/docs/guide/getting-funds' },
          { text: 'Send a Payment', link: '/docs/guide/payments' },
          { text: 'Use Tempo Transactions', link: '/docs/guide/tempo-transaction' },
          { text: 'Issue a Stablecoin', link: '/docs/guide/issuance' },
        ],
      },
      {
        text: 'Resources',
        items: [
          { text: 'Tools & SDKs', link: '/docs/tools' },
          { text: 'Tempo Protocol', link: '/docs/protocol' },
          { text: 'Run a Tempo Node', link: '/docs/guide/node' },
          { text: 'Use Tempo with AI', link: '/docs/guide/using-tempo-with-ai' },
          { text: 'Partners', link: '/docs/partners' },
        ],
      },
    ]
    const buildSidebar = section('Build on Tempo')
    const integrateSidebar = section('Integrate Tempo')
    const specsSidebar = section('Tempo Protocol')
    const developerToolsSidebar = section('Tools & SDKs')
    const nodeSidebar = section('Run a Tempo Node')

    return {
      '/docs': docsHomeSidebar,
      '/docs/build': buildSidebar,
      '/docs/guide/getting-funds': buildSidebar,
      '/docs/guide/payments': buildSidebar,
      '/docs/guide/issuance': buildSidebar,
      '/docs/guide/stablecoin-dex': buildSidebar,
      '/docs/guide/private-zones': buildSidebar,
      '/docs/guide/machine-payments': buildSidebar,
      '/docs/quickstart': integrateSidebar,
      '/docs/guide/tempo-transaction': integrateSidebar,
      '/docs/guide/bridge-layerzero': integrateSidebar,
      '/docs/guide/bridge-bungee': integrateSidebar,
      '/docs/guide/bridge-relay': integrateSidebar,
      '/docs/ecosystem': integrateSidebar,
      '/docs/protocol': specsSidebar,
      '/docs/tools': developerToolsSidebar,
      '/docs/hosted-services': developerToolsSidebar,
      '/docs/developer-tools': developerToolsSidebar,
      '/docs/cli': developerToolsSidebar,
      '/docs/protocol/rpc': developerToolsSidebar,
      '/docs/sdk': developerToolsSidebar,
      '/docs/wallet': developerToolsSidebar,
      '/docs/guide/node': nodeSidebar,
      '/docs/changelog': nodeSidebar,
    }
  })(),
  topNav: [
    {
      text: 'Docs',
      link: '/docs',
    },

    { text: 'Ecosystem', link: 'https://tempo.xyz/ecosystem' },
    { text: 'Wallet', link: 'https://wallet.tempo.xyz' },
  ],
  redirects: [
    {
      source: '/docs/documentation/protocol/:path*',
      destination: '/docs/protocol/:path*',
    },
    {
      source: '/docs/stablecoin-exchange/:path*',
      destination: '/docs/guide/stablecoin-dex/:path*',
      status: 301,
    },
    {
      source: '/docs/quickstart/developer-tools',
      destination: '/docs/ecosystem',
      status: 301,
    },
    {
      source: '/docs/developer-tools',
      destination: '/docs/ecosystem',
      status: 301,
    },
    {
      source: '/docs/guide/ai-support',
      destination: '/docs/guide/using-tempo-with-ai',
    },
    {
      source: '/docs/guide/building-with-ai',
      destination: '/docs/guide/using-tempo-with-ai',
    },
    {
      source: '/docs/guide',
      destination: '/docs/quickstart/integrate-tempo',
    },
    {
      source: '/docs/quickstart',
      destination: '/docs/quickstart/integrate-tempo',
    },
    {
      source: '/docs/protocol/blockspace',
      destination: '/docs/protocol/blockspace/overview',
    },
    {
      source: '/docs/protocol/tip20',
      destination: '/docs/protocol/tip20/overview',
    },
    {
      source: '/docs/protocol/tip20-rewards',
      destination: '/docs/protocol/tip20-rewards/overview',
    },
    {
      source: '/docs/protocol/tip403',
      destination: '/docs/protocol/tip403/overview',
    },
    {
      source: '/docs/learn/partners',
      destination: '/docs/partners',
      status: 301,
    },
    {
      source: '/learn/partners',
      destination: '/docs/partners',
      status: 301,
    },
    {
      source: '/docs/guide/using-tempo-with-ai/partners',
      destination: '/docs/partners',
      status: 301,
    },
    {
      source: '/build/partners',
      destination: '/docs/partners',
      status: 301,
    },
    {
      source: '/docs/sdk/typescript/prool',
      destination: '/docs/sdk/typescript/prool/setup',
    },
    {
      source: '/docs/cli/reference',
      destination: '/docs/cli/wallet',
      status: 301,
    },
    {
      source: '/docs/quickstart/tip20',
      destination: '/docs/protocol/tip20/overview',
      status: 301,
    },
    {
      source: '/docs/protocol/exchange/pathUSD',
      destination: '/docs/protocol/exchange/quote-tokens#pathusd',
      status: 301,
    },
    {
      source: '/wallet',
      destination: '/docs/cli/wallet',
      status: 301,
    },
    {
      source: '/wallet/reference',
      destination: '/docs/cli/wallet',
      status: 301,
    },
    {
      source: '/wallet/:path*',
      destination: '/docs/cli/wallet',
      status: 301,
    },
    {
      source: '/cli/reference',
      destination: '/docs/cli/wallet',
      status: 301,
    },
    {
      source: '/cli/wallet',
      destination: '/docs/cli/wallet',
      status: 301,
    },
    {
      source: '/cli/:path*',
      destination: '/docs/cli/:path*',
      status: 301,
    },
    {
      source: '/sdk/typescript/prool',
      destination: '/docs/sdk/typescript/prool/setup',
      status: 301,
    },
    {
      source: '/guide/use-accounts/fee-sponsorship',
      destination: '/docs/guide/payments/sponsor-user-fees',
      status: 301,
    },
    {
      source: '/quickstart/tip20',
      destination: '/docs/protocol/tip20/overview',
      status: 301,
    },
    {
      source: '/protocol/exchange/pathUSD',
      destination: '/docs/protocol/exchange/quote-tokens#pathusd',
      status: 301,
    },
    {
      source: '/protocol/zones/overview',
      destination: '/docs/protocol/zones',
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
