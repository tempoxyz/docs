import { Changelog, defineConfig, Embedding, Reranker, Retriever } from 'vocs/config'
import { resolveBaseUrl } from './src/lib/base-url'
import { rehypeCompactShikiStyles } from './src/lib/compact-shiki-styles'
import {
  developerSurfaceRedirects,
  docsRouteDestination,
  proxiedLegacyDocsRoutes,
} from './src/lib/docs-routing'
import { docsSections, specificationsSection } from './src/lib/docs-sections'
import { docsStructuredDataHead } from './src/lib/docs-structured-data'
import { createFeedbackAdapter } from './src/lib/feedback-adapter'
import { demoteMarkdownHeadings } from './src/lib/markdown-headings'
import { plainMarkdownComponents } from './src/lib/markdown-output'
import { loadTempoOpenApi } from './src/lib/tempo-openapi'

// Only set baseUrl in production — Vocs injects a <base> tag from this value,
// which causes all links to resolve to the absolute URL on preview deployments.
const baseUrl = resolveBaseUrl()
const openApiSpecUrl = process.env.OPENAPI_SPEC_URL ?? 'https://api.tempo.xyz/openapi.json'

const searchIndexFields = ['title', 'titles', 'subtitle', 'path', 'excerpt']
const searchBoost = { title: 5, subtitle: 3, titles: 2, path: 3, excerpt: 3 }
const tempoChangelog = Changelog.github({ prereleases: true, repo: 'tempoxyz/tempo' })

const changelog = Changelog.from({
  ...tempoChangelog,
  async fetch(options = {}) {
    const limit = options.limit ?? 50
    // The repository also publishes package-only tags. Over-fetch, then retain
    // the requested number of network releases for the public changelog.
    const releases = await tempoChangelog.fetch({
      ...options,
      limit: Math.min(limit * 5, 100),
    })

    return releases
      .filter((release) => /^v\d+\.\d+\.\d+(?:[-+].*)?$/.test(release.version))
      .slice(0, limit)
      .map((release) => {
        // GitHub-generated release notes use HTML disclosures. Markdown output cannot retain
        // them, so preserve their content as a heading instead.
        const body = release.body
          .replace(/<details\b[^>]*>/gi, '')
          .replace(/<\/details>/gi, '')
          .replace(/<summary\b[^>]*>([\s\S]*?)<\/summary>/gi, '\n\n#### $1\n\n')

        return {
          ...release,
          // The changelog page owns the only H1. Release titles render as H2, so shift body
          // headings down one level while preserving the release note's relative hierarchy.
          body: demoteMarkdownHeadings(
            Changelog.stripDuplicateTitle({ body, title: release.title }),
          ),
        }
      })
  },
})

function extractSearchField(document: Record<string, unknown>, fieldName: string) {
  if (fieldName === 'path') {
    return String(document.href ?? '')
      .split('#')[0]
      .replace(/^\/docs\//, '/')
      .replaceAll('/', ' ')
  }
  if (fieldName === 'excerpt') {
    return String(document.text ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 24)
      .join(' ')
  }
  return document[fieldName]
}

function boostSearchDocument(
  _documentId: unknown,
  _term: string,
  storedFields?: Record<string, unknown>,
) {
  const priority = (storedFields?.searchPriority as number | undefined) ?? 1
  const href = storedFields?.href as string | undefined
  const segments = href ? href.split('/').filter(Boolean).length : 1
  const depth = href?.startsWith('/docs/') ? Math.max(segments - 1, 1) : segments
  const docsBoost = href?.startsWith('/docs/') ? 1.5 : 1
  return priority * (1 / Math.max(depth, 1)) * docsBoost
}

const apiConsoleSidebar = {
  text: 'API Console',
  collapsed: true,
  items: [
    {
      text: 'Overview',
      link: '/docs/api/console',
    },
    {
      text: 'Projects and environments',
      link: '/docs/api/console/projects-and-environments',
    },
    {
      text: 'API keys',
      link: '/docs/api/console/api-keys',
    },
    {
      text: 'Usage and billing',
      link: '/docs/api/console/usage-and-billing',
    },
    {
      text: 'Teams and access',
      link: '/docs/api/console/team',
    },
  ],
}

export default defineConfig({
  // banner: {
  //   dismissable: false,
  //   backgroundColor: '#5B4CDB',
  //   content: 'Your announcement here. [Learn more.](https://tempo.xyz) →',
  //   height: '40px',
  //   textColor: 'white',
  // },
  changelog,
  checkDeadlinks: true,
  editLink: {
    link: 'https://github.com/tempoxyz/docs/edit/main/src/pages/:path',
    text: 'Suggest changes to this page',
  },
  title: 'Tempo Docs',
  titleTemplate: (path, { frontmatter, title }) => {
    const pagePath = typeof path === 'string' ? path : '/'
    const seoTitle =
      typeof frontmatter?.seoTitle === 'string' ? frontmatter.seoTitle.trim() : undefined
    if (seoTitle) return seoTitle
    if (pagePath === '/' || /^\/get-started(?:\/|$)/.test(pagePath)) return '%s ⋅ Tempo Docs'
    if (pagePath.startsWith('/docs/')) return '%s ⋅ Tempo Docs'
    if (title?.includes('Tempo')) return undefined
    return '%s ⋅ Tempo'
  },
  description: 'Documentation for the Tempo network and protocol specifications',
  renderStrategy: 'partial-static',
  feedback: createFeedbackAdapter(),
  head: docsStructuredDataHead,
  jsonLd: false,
  ai: {
    retriever: process.env.CLOUDFLARE_API_TOKEN
      ? Retriever.local({
          embedding: Embedding.cloudflare(),
          // Production pages are served behind the tempo.xyz `/developers`
          // proxy; the default origin-relative endpoint escapes the prefix.
          endpoint:
            process.env.VERCEL_ENV === 'production'
              ? 'https://tempo.xyz/developers/api/search'
              : undefined,
          hybrid: true,
          reranker: Reranker.cloudflare(),
          sources: [
            { url: 'https://viem.sh/llms.txt', label: 'viem' },
            { url: 'https://wagmi.sh/llms.txt', label: 'wagmi' },
            { url: 'https://mpp.dev/llms.txt', label: 'mpp' },
            { url: 'https://accounts.tempo.xyz/llms.txt', label: 'accounts' },
          ],
        })
      : undefined,
  },
  search: {
    index: {
      fields: searchIndexFields,
      storeFields: ['path', 'excerpt'],
      extractField: extractSearchField,
    },
    query: {
      combineWith: 'OR',
      fuzzy: 0.1,
      prefix: false,
      boost: searchBoost,
      boostDocument: boostSearchDocument,
    },
  },
  sitemap: {
    include: (path) =>
      (path === '/' || /^\/(?:get-started|docs|blog)(?:\/|$)/.test(path)) &&
      !/^\/docs\/?$/.test(path) &&
      !path.split('/').some((segment) => /^\[.*\]$/.test(segment)),
    lastmod: (_path, { filePath, lastmod }) => (/\.mdx?$/.test(filePath) ? lastmod : false),
  },
  markdown: {
    rehypePlugins: [rehypeCompactShikiStyles],
    outputRemarkPlugins: [plainMarkdownComponents],
  },
  baseUrl: baseUrl || undefined,
  trailingSlashRedirect: false,
  // NOTE: this function is serialized to source and re-evaluated at runtime,
  // so it must stay self-contained (no references to module-scope values).
  // src/lib/og-sections.ts mirrors these maps for scripts/probe-og.ts, and
  // src/lib/og-sections.test.ts fails if the two drift.
  ogImageUrl: (path, options = {}) => {
    const urlBase = options.baseUrl?.replace(/\/$/, '') ?? ''
    const docsPath = String(path ?? '').replace(/^\/docs(?=\/|$)/, '') || '/'
    const landingPaths = ['/', '/changelog']
    if (landingPaths.includes(docsPath)) return `${urlBase}/og-docs.png?v=4`

    const sectionMap: Record<string, string> = {
      accounts: 'ACCOUNTS',
      agents: 'MACHINE PAYMENTS',
      api: 'API',
      blog: 'BLOG',
      build: 'BUILD',
      cli: 'CLI',
      'developer-tools': 'DEVELOPER TOOLS',
      development: 'DEVELOPER RESOURCES',
      earn: 'EARN',
      ecosystem: 'ECOSYSTEM',
      'get-started': 'GET STARTED',
      guide: 'BUILD',
      partners: 'PARTNERS',
      payments: 'PAYMENTS',
      performance: 'PERFORMANCE',
      protocol: 'PROTOCOL',
      quickstart: 'INTEGRATE',
      routes: 'ROUTES',
      sdk: 'SDKs',
      server: 'SERVER',
      tools: 'TOOLS',
      wallet: 'WALLET',
      zones: 'ZONES',
    }

    const subsectionMap: Record<string, string> = {
      blockspace: 'BLOCKSPACE',
      console: 'CONSOLE',
      exchange: 'DEX',
      fees: 'FEES',
      foundry: 'FOUNDRY',
      go: 'GO',
      issuance: 'ISSUANCE',
      'machine-payments': 'MACHINE PAY',
      node: 'NODE',
      payments: 'PAYMENTS',
      'private-zones': 'ZONES',
      python: 'PYTHON',
      rpc: 'RPC',
      rust: 'RUST',
      'stablecoin-dex': 'EXCHANGE',
      'tempo-transaction': 'TRANSACTIONS',
      tip20: 'TIP-20',
      tip403: 'TIP-403',
      tips: 'TIPS',
      transactions: 'TRANSACTIONS',
      typescript: 'TYPESCRIPT',
      upgrades: 'UPGRADES',
      zones: 'ZONES',
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
      v: '4',
    }).toString()

    // The HBSet display font's mixed-case "Blog" wordmark has awkward
    // spacing at OG scale. Keep the page title sentence-cased, but use the
    // cleaner all-caps treatment in the blog index thumbnail.
    const imageTitle = docsPath === '/blog' ? 'BLOG' : '%title'

    return `${urlBase}/api/og?title=${imageTitle}&${extra}`
  },
  openapi: [
    {
      path: '/docs/api',
      spec: () => loadTempoOpenApi(openApiSpecUrl),
      sidebar: {
        backLink: false,
        collapsed: true,
        top: [{ text: '← Back to developer resources', link: '/docs/development' }],
        intro: [
          apiConsoleSidebar,
          {
            text: 'Authentication',
            link: '/docs/api/authentication',
          },
          {
            text: 'Conventions',
            link: '/docs/api/conventions',
          },
          {
            text: 'Transactions and transfers',
            link: '/docs/api/transactions-and-transfers',
          },
          {
            text: 'JSON-RPC API',
            link: '/docs/api/json-rpc',
          },
          {
            text: 'Fee payer API',
            link: '/docs/api/fee-payer',
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
            text: 'Rate limits',
            link: '/docs/api/rate-limits',
          },
          {
            text: 'Errors',
            link: '/docs/api/errors',
          },
          {
            text: 'Versioning policy',
            link: '/docs/api/versioning-policy',
          },
          {
            text: 'TypeScript',
            link: '/docs/api/typed-client',
          },
          {
            text: 'FAQ',
            link: '/docs/api/faq',
          },
          {
            text: 'Reference',
            link: '/docs/api/reference',
          },
        ],
        tagGroupsCollapsed: false,
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
    const getStartedSidebar = [
      {
        text: 'Get Started',
        items: [
          { text: 'Overview', link: '/get-started' },
          { text: 'Stablecoins on Tempo', link: '/get-started/stablecoins' },
        ],
      },
      {
        text: 'Start building',
        items: [
          { text: 'Build with AI', link: '/docs/guide/using-tempo-with-ai' },
          { text: 'Create an account', link: '/docs/accounts/create' },
          { text: 'Get test funds', link: '/docs/quickstart/faucet' },
          { text: 'First payment', link: '/docs/guide/payments/send-a-payment' },
          { text: 'Network details', link: '/docs/quickstart/connection-details' },
        ],
      },
    ]
    const accountsSidebar = [
      {
        text: 'Accounts',
        items: [
          { text: 'Overview', link: '/docs/accounts' },
          { text: 'Create an account', link: '/docs/accounts/create' },
          { text: 'Connect a wallet', link: '/docs/accounts/integrate' },
          { text: 'Use a wallet provider', link: '/docs/accounts/providers' },
          { text: 'Fund an account', link: '/docs/guide/getting-funds' },
          { text: 'Balances and activity', link: '/docs/accounts/balances' },
        ],
      },
      {
        text: 'Access and permissions',
        items: [
          { text: 'Access keys', link: '/docs/accounts/access-keys' },
          { text: 'Give an agent access', link: '/docs/accounts/agents' },
          { text: 'Manage admin keys', link: '/docs/accounts/admin-keys' },
        ],
      },
      {
        text: 'Wallet development',
        collapsed: false,
        items: [
          { text: 'Integrate a wallet', link: '/docs/quickstart/wallet-developers' },
          { text: 'Token lists', link: '/docs/quickstart/tokenlist' },
        ],
      },
    ]
    const paymentsSidebar = [
      {
        text: 'Payments',
        items: [
          { text: 'Overview', link: '/docs/payments' },
          { text: 'Send a payment', link: '/docs/guide/payments/send-a-payment' },
          { text: 'Receive a payment', link: '/docs/guide/payments/accept-a-payment' },
        ],
      },
      {
        text: 'Payment features',
        items: [
          { text: 'Payment references', link: '/docs/guide/payments/transfer-memos' },
          { text: 'Customer deposit addresses', link: '/docs/guide/payments/virtual-addresses' },
          { text: 'Sponsor fees', link: '/docs/guide/payments/sponsor-user-fees' },
          { text: 'Choose a fee token', link: '/docs/guide/payments/pay-fees-in-any-stablecoin' },
          {
            text: 'Batch payments',
            link: '/docs/guide/payments/send-a-payment#batch-payment-transactions',
          },
          {
            text: 'Send payments in parallel',
            link: '/docs/guide/payments/send-parallel-transactions',
          },
          {
            text: 'Control incoming payments',
            link: '/docs/guide/payments/configure-receive-policies',
          },
        ],
      },
      {
        text: 'Machine payments',
        items: [
          { text: 'Overview', link: '/docs/agents' },
          { text: 'Use Mercator', link: '/docs/guide/mercator' },
          { text: 'Pay for services', link: '/docs/guide/machine-payments/client' },
          { text: 'Pay with the CLI', link: '/docs/guide/machine-payments/agent' },
          { text: 'Find services', link: '/docs/guide/machine-payments/discover-services' },
          { text: 'Accept payments for an API', link: '/docs/guide/machine-payments/server' },
          { text: 'Payment sessions', link: '/docs/guide/machine-payments/pay-as-you-go' },
          {
            text: 'More about MPP',
            collapsed: true,
            items: [
              { text: 'How MPP works', link: '/docs/guide/machine-payments' },
              { text: 'One-time payments', link: '/docs/guide/machine-payments/one-time-payments' },
              { text: 'Streamed payments', link: '/docs/guide/machine-payments/streamed-payments' },
              {
                text: 'Use cases',
                collapsed: true,
                items: [
                  {
                    text: 'Monetize your API',
                    link: '/docs/guide/machine-payments/use-cases/monetize-your-api',
                  },
                  {
                    text: 'AI model access',
                    link: '/docs/guide/machine-payments/use-cases/ai-model-access',
                  },
                  {
                    text: 'Web search and research',
                    link: '/docs/guide/machine-payments/use-cases/web-search-and-research',
                  },
                  {
                    text: 'Image and media generation',
                    link: '/docs/guide/machine-payments/use-cases/image-and-media-generation',
                  },
                  {
                    text: 'Browser automation',
                    link: '/docs/guide/machine-payments/use-cases/browser-automation',
                  },
                  {
                    text: 'Compute and code execution',
                    link: '/docs/guide/machine-payments/use-cases/compute-and-code-execution',
                  },
                  {
                    text: 'Storage',
                    link: '/docs/guide/machine-payments/use-cases/storage',
                  },
                  {
                    text: 'Blockchain data and analytics',
                    link: '/docs/guide/machine-payments/use-cases/blockchain-data',
                  },
                  {
                    text: 'Financial and market data',
                    link: '/docs/guide/machine-payments/use-cases/financial-data',
                  },
                  {
                    text: 'Data enrichment and leads',
                    link: '/docs/guide/machine-payments/use-cases/data-enrichment-and-leads',
                  },
                  {
                    text: 'Translation and language',
                    link: '/docs/guide/machine-payments/use-cases/translation-and-language',
                  },
                  {
                    text: 'Maps and location data',
                    link: '/docs/guide/machine-payments/use-cases/location-and-maps',
                  },
                  {
                    text: 'Agent-to-agent services',
                    link: '/docs/guide/machine-payments/use-cases/agent-to-agent',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const earnSidebar = [
      {
        text: 'Earn',
        items: [
          { text: 'Overview', link: '/docs/earn' },
          { text: 'Choose a vault', link: '/docs/earn/vaults' },
          { text: 'Deposit funds', link: '/docs/earn/integrate' },
          { text: 'Balances and earnings', link: '/docs/earn/balances' },
          { text: 'Withdraw funds', link: '/docs/earn/withdraw' },
          { text: 'How Earn works', link: '/docs/earn/how-it-works' },
        ],
      },
      {
        text: 'For providers',
        collapsed: false,
        items: [{ text: 'Connect a yield source', link: '/docs/earn#connect-a-yield-source' }],
      },
    ]
    const routesSidebar = [
      {
        text: 'Routes',
        items: [
          { text: 'Overview', link: '/docs/routes' },
          { text: 'Make a transfer', link: '/docs/routes/transfers' },
          { text: 'Accept deposits', link: '/docs/routes/deposits' },
          { text: 'Track delivery', link: '/docs/routes/delivery' },
          { text: 'Quotes and fees', link: '/docs/routes/quotes' },
          { text: 'Supported networks and assets', link: '/docs/routes/networks' },
          { text: 'Swap on Tempo', link: '/docs/guide/stablecoin-dex/executing-swaps' },
        ],
      },
      {
        text: 'For liquidity providers',
        collapsed: false,
        items: [
          { text: 'How exchange works', link: '/docs/guide/stablecoin-dex' },
          {
            text: 'Provide exchange liquidity',
            link: '/docs/guide/stablecoin-dex/providing-liquidity',
          },
          {
            text: 'Provide fee liquidity',
            link: '/docs/guide/stablecoin-dex/managing-fee-liquidity',
          },
        ],
      },
    ]
    const zonesSidebar = [
      {
        text: 'Zones',
        items: [
          { text: 'Overview', link: '/docs/zones' },
          { text: 'Privacy model', link: '/docs/zones/privacy' },
          { text: 'Connect to a Zone', link: '/docs/zones/connect' },
          { text: 'Deposit funds', link: '/docs/zones/deposit' },
          { text: 'Balances and activity', link: '/docs/zones/balances' },
          { text: 'Withdraw funds', link: '/docs/zones/withdraw' },
        ],
      },
      {
        text: 'Testnet sandbox',
        collapsed: false,
        items: [
          { text: 'Sandbox overview', link: '/docs/guide/private-zones' },
          {
            text: 'Connect to a sandbox Zone',
            link: '/docs/guide/private-zones/connect-to-a-zone',
          },
          {
            text: 'Deposit to a sandbox Zone',
            link: '/docs/guide/private-zones/deposit-to-a-zone',
          },
          {
            text: 'Send tokens within a Zone',
            link: '/docs/guide/private-zones/send-tokens-within-a-zone',
          },
          {
            text: 'Send tokens across Zones',
            link: '/docs/guide/private-zones/send-tokens-across-zones',
          },
          { text: 'Swap across Zones', link: '/docs/guide/private-zones/swap-across-zones' },
          {
            text: 'Withdraw from a sandbox Zone',
            link: '/docs/guide/private-zones/withdraw-from-a-zone',
          },
        ],
      },
    ]
    const ecosystemSidebar = [
      {
        text: 'Partners',
        items: [
          {
            text: 'Overview',
            link: '/docs/ecosystem',
          },
          {
            text: 'Assets',
            collapsed: false,
            items: [
              { text: 'Assets on Tempo', link: '/docs/ecosystem/assets' },
              { text: 'OUSD on Tempo', link: '/docs/guide/ousd' },
            ],
          },
          {
            text: 'Wallets',
            collapsed: false,
            items: [
              { text: 'Wallet providers', link: '/docs/ecosystem/wallets' },
              { text: 'Smart accounts', link: '/docs/ecosystem/smart-contract-libraries' },
            ],
          },
          {
            text: 'Exchanges',
            link: '/docs/ecosystem/exchanges',
          },
          {
            text: 'Bridges',
            collapsed: false,
            items: [
              { text: 'Bridge providers', link: '/docs/ecosystem/bridges' },
              { text: 'LayerZero', link: '/docs/guide/bridge-layerzero' },
              { text: 'Bungee', link: '/docs/guide/bridge-bungee' },
              { text: 'Relay', link: '/docs/guide/bridge-relay' },
            ],
          },
          {
            text: 'Payments & ramps',
            link: '/docs/ecosystem/orchestration',
          },
          {
            text: 'Node providers',
            link: '/docs/ecosystem/node-infrastructure',
          },
          {
            text: 'Data',
            link: '/docs/ecosystem/data-analytics',
          },
          {
            text: 'Developer tools',
            collapsed: false,
            items: [
              { text: 'Overview', link: '/docs/ecosystem/developer-tools' },
              { text: 'Explorers and debugging', link: '/docs/ecosystem/block-explorers' },
            ],
          },
          {
            text: 'Security and compliance',
            link: '/docs/ecosystem/security-compliance',
          },
        ],
      },
      {
        text: 'Work with Tempo',
        items: [
          {
            text: 'Partner with Tempo',
            link: '/docs/partners',
          },
        ],
      },
    ]
    const nodeSidebar = {
      text: 'Run a node',
      collapsed: true,
      items: [
        {
          text: 'Overview',
          link: '/docs/guide/node',
        },
        {
          text: 'System requirements',
          link: '/docs/guide/node/system-requirements',
        },
        {
          text: 'Installation',
          link: '/docs/guide/node/installation',
        },
        {
          text: 'Run RPC and standby nodes',
          link: '/docs/guide/node/rpc',
        },
        {
          text: 'Consensus, DKG, and network identity',
          link: '/docs/guide/node/consensus-and-dkg',
        },
        {
          text: 'Run a validator',
          items: [
            {
              text: 'Overview',
              link: '/docs/guide/node/validator',
            },
            {
              text: 'Validator onboarding',
              link: '/docs/guide/node/validator-setup',
            },
            {
              text: 'Validator network topology',
              link: '/docs/guide/node/validator-topology',
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
          text: 'Node security',
          link: '/docs/guide/node/security',
        },
        {
          text: 'Upgrade a node',
          link: '/docs/guide/node/upgrade-cadence',
        },
      ],
    }
    const protocolSidebar = [
      {
        text: 'Specifications',
        items: [
          { text: 'Changelog', link: '/docs/protocol/upgrades' },
          { text: 'Overview', link: '/docs/protocol' },
          { text: 'Protocol changes', link: '/docs/protocol#how-protocol-changes-happen' },
          {
            text: 'Accounts and transactions',
            collapsed: true,
            items: [
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
                    text: 'EIP-4337 comparison',
                    link: '/docs/protocol/transactions/eip-4337',
                  },
                  {
                    text: 'EIP-7702 comparison',
                    link: '/docs/protocol/transactions/eip-7702',
                  },
                  {
                    text: 'Account Keychain specification',
                    link: '/docs/protocol/transactions/AccountKeychain',
                  },
                  {
                    text: 'Rust implementation',
                    link: 'https://github.com/tempoxyz/tempo/blob/main/crates/primitives/src/transaction/tempo_transaction.rs',
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
                        text: 'Rust implementation',
                        link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip_fee_manager',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            text: 'Tokens and policies',
            collapsed: true,
            items: [
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
                    text: 'Rust implementation',
                    link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip20',
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
                    text: 'Receive policies',
                    link: '/docs/protocol/tip403/receive-policies',
                  },
                  {
                    text: 'Rust implementation',
                    link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/tip403_registry',
                  },
                ],
              },
            ],
          },
          {
            text: 'Exchange',
            collapsed: true,
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
                text: 'Quote tokens',
                link: '/docs/protocol/exchange/quote-tokens',
              },
              {
                text: 'Executing swaps',
                link: '/docs/protocol/exchange/executing-swaps',
              },
              {
                text: 'Providing liquidity',
                link: '/docs/protocol/exchange/providing-liquidity',
              },
              {
                text: 'DEX balance',
                link: '/docs/protocol/exchange/exchange-balance',
              },
              {
                text: 'Rust implementation',
                link: 'https://github.com/tempoxyz/tempo/tree/main/crates/precompiles/src/stablecoin_dex',
              },
            ],
          },
          {
            text: 'Consensus and blockspace',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/docs/protocol/blockspace/overview',
              },
              {
                text: 'Payment lane specification',
                link: '/docs/protocol/blockspace/payment-lane-specification',
              },
              {
                text: 'Consensus and finality',
                link: '/docs/protocol/blockspace/consensus',
              },
            ],
          },
          {
            text: 'Zones',
            collapsed: true,
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
          { text: 'TIPs', link: 'https://tips.sh/' },
        ],
      },
    ]
    const changelogSidebar = [
      { text: '← Back to Specifications', link: '/docs/protocol' },
      {
        text: 'Changelog',
        items: [
          { text: 'Overview', link: '/docs/protocol/upgrades' },
          {
            text: 'Network upgrades',
            collapsed: false,
            items: [
              {
                text: 'T12',
                badge: { text: 'Planned', variant: 'note' as const },
                link: '/docs/protocol/upgrades/t12',
              },
              {
                text: 'T11',
                badge: { text: 'Latest', variant: 'info' as const },
                link: '/docs/protocol/upgrades/t11',
              },
              {
                text: 'T10',
                link: '/docs/protocol/upgrades/t10',
              },
              {
                text: 'T9',
                link: '/docs/protocol/upgrades/t9',
              },
              {
                text: 'T8',
                link: '/docs/protocol/upgrades/t8',
              },
              {
                text: 'T7',
                link: '/docs/protocol/upgrades/t7',
              },
              {
                text: 'T6',
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
          { text: 'Node releases', link: '/docs/changelog' },
          { text: 'Operator updates', link: '/docs/guide/node/network-upgrades' },
          { text: 'Upgrade process', link: '/docs/guide/node/upgrade-cadence' },
          { text: 'TIPs', link: 'https://tips.sh/' },
        ],
      },
    ]
    const developerToolsSidebar = [
      {
        text: 'Tools & SDKs',
        items: [
          {
            text: 'Overview',
            link: '/docs/tools',
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
                text: 'Wallet',
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
            text: 'Wallet',
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
            text: 'Server tools',
            collapsed: false,
            items: [
              {
                text: 'Overview',
                link: '/docs/server',
              },
              {
                text: 'Relay and fee payer handler',
                link: '/docs/server/relay-handler',
              },
            ],
          },
          {
            text: 'RPC reference',
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
                    text: 'Viem reference',
                    link: 'https://viem.sh/tempo',
                  },
                  {
                    text: 'Wagmi reference',
                    link: 'https://wagmi.sh/tempo',
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
                    text: 'Signature verification',
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
    ]

    const resourcesOverview = {
      text: 'Developer Resources',
      items: [{ text: 'Overview', link: '/docs/development' }],
    }
    const developerResourcesSidebar = [
      {
        text: 'Developer Resources',
        items: [
          { text: 'Overview', link: '/docs/development' },
          { text: 'Build with AI', link: '/docs/guide/using-tempo-with-ai' },
          ...developerToolsSidebar[0].items
            .filter((item) => item.text === 'SDKs' || item.text === 'CLI')
            .sort((a, b) => (a.text === 'SDKs' ? -1 : b.text === 'SDKs' ? 1 : 0))
            .map((item) => ({ ...item, collapsed: true })),
          { text: 'Tempo API', link: '/docs/api' },
          { text: 'Networks', link: '/docs/quickstart/connection-details' },
          { text: 'EVM differences', link: '/docs/quickstart/evm-compatibility' },
          { text: 'Explorers', link: '/docs/ecosystem/block-explorers' },
          { text: 'Partners', link: '/docs/ecosystem' },
        ],
      },
      {
        text: 'Libraries and reference',
        collapsed: true,
        items: [
          { text: 'Tools overview', link: '/docs/tools' },
          ...developerToolsSidebar[0].items
            .filter((item) => item.text === 'Wallet' || item.text === 'Server tools')
            .map((item) => ({ ...item, collapsed: true })),
          { text: 'Integrate an existing application', link: '/docs/quickstart/integrate-tempo' },
          { text: 'Verify contracts', link: '/docs/quickstart/verify-contracts' },
          { text: 'System contracts', link: '/docs/quickstart/predeployed-contracts' },
          { text: 'Testnet funds', link: '/docs/quickstart/faucet' },
          { text: 'JSON-RPC reference', link: '/docs/protocol/rpc' },
        ],
      },
      nodeSidebar,
    ]
    const partnerResourcesSidebar = [resourcesOverview, ...ecosystemSidebar]

    const productSidebars = {
      overview: getStartedSidebar,
      accounts: accountsSidebar,
      earn: earnSidebar,
      routes: routesSidebar,
      zones: zonesSidebar,
      payments: paymentsSidebar,
      development: developerResourcesSidebar,
      protocol: protocolSidebar,
      changelog: changelogSidebar,
    }

    return {
      '/docs': getStartedSidebar,
      ...Object.fromEntries(
        [...docsSections, specificationsSection].flatMap((section) =>
          section.matches.map((path) => [path, productSidebars[section.id]]),
        ),
      ),
      '/docs/protocol/upgrades': changelogSidebar,
      '/docs/changelog': changelogSidebar,
      '/docs/guide/node/network-upgrades': changelogSidebar,
      '/docs/ecosystem': partnerResourcesSidebar,
      '/docs/partners': partnerResourcesSidebar,
      '/docs/guide/ousd': partnerResourcesSidebar,
      '/docs/guide/bridge-layerzero': partnerResourcesSidebar,
      '/docs/guide/bridge-bungee': partnerResourcesSidebar,
      '/docs/guide/bridge-relay': partnerResourcesSidebar,
    }
  })(),
  topNav: [
    {
      text: 'Docs',
      link: '/',
    },

    { text: 'Blog', link: '/blog' },
  ],
  redirects: [
    ...developerSurfaceRedirects,
    // Vercel mirrors these at `/developers` because the static router runs before
    // Vocs at that proxy mount. The route contract and tests keep them aligned.
    ...proxiedLegacyDocsRoutes,
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
      destination: '/docs/protocol/upgrades/t7#deprecate-tip-20-rewards',
    },
    {
      source: '/docs/protocol/tip20-rewards/:path*',
      destination: '/docs/protocol/upgrades/t7#deprecate-tip-20-rewards',
    },
    {
      source: '/docs/guide/issuance/distribute-rewards',
      destination: '/docs/protocol/upgrades/t7#deprecate-tip-20-rewards',
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
  ].map((redirect) => ({
    ...redirect,
    // Every entry is a retired documentation URL. Vocs returns Location
    // verbatim, so the production destination must include the proxy mount.
    destination: docsRouteDestination(redirect.destination),
    status: 301 as const,
  })),
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
})
