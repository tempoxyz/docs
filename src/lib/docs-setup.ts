export const docsSetupChoices = [
  {
    title: 'Connect to Tempo',
    description: 'Find RPC endpoints and chain IDs, then fund a test account on Moderato.',
    icon: 'network',
    links: [
      ['RPC and chain IDs', '/docs/quickstart/connection-details'],
      ['Testnet faucet', '/docs/quickstart/faucet'],
    ],
  },
  {
    title: 'Choose your tools',
    description: 'Use Viem or Wagmi for TypeScript and React, or choose another SDK or the CLI.',
    icon: 'code',
    links: [
      ['SDKs and CLI', '/docs/tools'],
      ['Explore Tempo EVM', '/docs/development'],
    ],
  },
  {
    title: 'Work with the API',
    description: "Explore endpoints for balances and activity, and manage your project's API keys.",
    icon: 'api',
    links: [
      ['API reference', '/docs/api/reference'],
      ['API keys', '/docs/api/console/api-keys'],
    ],
  },
  {
    title: 'Set up your coding agent',
    description: 'Connect your agent to Tempo documentation with MCP, or install the Tempo skills.',
    icon: 'agent',
    links: [['Build with AI', '/docs/guide/using-tempo-with-ai']],
  },
] as const
