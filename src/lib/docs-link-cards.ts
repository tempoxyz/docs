import { docsSetupChoices } from './docs-setup'

export const docsLinkCards = {
  setup: docsSetupChoices,
  funding: [
    {
      title: 'Get testnet funds',
      description: 'Use test stablecoins on Moderato to try payments and build your integration.',
      icon: 'code',
      links: [
        ['Testnet faucet', '/docs/quickstart/faucet'],
        ['Send a test payment', '/get-started/quickstart'],
      ],
    },
    {
      title: 'Add money with Tempo Wallet',
      description: 'Use the fiat onramp in Tempo Wallet, or open its funding flow directly from your app.',
      icon: 'wallet',
      links: [
        ['Try the onramp', '/docs/guide/getting-funds#tempo-wallet'],
        ['Add funding to your app', '/docs/guide/getting-funds#open-funding-with-the-accounts-sdk'],
      ],
    },
    {
      title: 'Transfer from another network',
      description: 'Use Routes to move stablecoins to Tempo or accept customer deposits from other networks.',
      icon: 'network',
      links: [
        ['Transfer with Routes', '/docs/routes'],
        ['Customer deposit addresses', '/docs/routes/deposits'],
        ['Bridge integrations', '/docs/guide/getting-funds#bridge'],
      ],
    },
    {
      title: 'Get OUSD on Tempo',
      description: 'Explore minting through an integration partner or swapping stablecoins already on Tempo.',
      icon: 'tokens',
      links: [
        ['OUSD funding options', '/docs/guide/ousd#get-ousd'],
        ['Swap stablecoins', '/docs/guide/stablecoin-dex/executing-swaps'],
      ],
    },
  ],
  accounts: [
    {
      title: 'Create and fund accounts',
      description: 'Choose a signer, connect a wallet, and get an account ready to use.',
      icon: 'wallet',
      links: [
        ['Create an account', '/docs/accounts/create'],
        ['Connect a wallet', '/docs/accounts/integrate'],
        ['Fund an account', '/docs/guide/getting-funds'],
      ],
    },
    {
      title: 'Show balances and activity',
      description:
        'Read stablecoin balances and connect onchain activity to your customer records.',
      icon: 'api',
      links: [
        ['Balances and activity', '/docs/accounts/balances'],
        ['Choose an account model', '/docs/accounts/integration'],
      ],
    },
    {
      title: 'Send payments',
      description: 'Build a payment flow and decide who covers transaction fees.',
      icon: 'code',
      links: [
        ['Send payments', '/docs/guide/payments/send-a-payment'],
        ['Browser payments', '/docs/guide/payments/send-a-payment/browser'],
        ['Sponsor fees', '/docs/guide/payments/sponsor-user-fees'],
      ],
    },
    {
      title: 'Receive and reconcile',
      description:
        'Accept deposits and identify which customer or invoice each payment belongs to.',
      icon: 'network',
      links: [
        ['Receive payments', '/docs/guide/payments/accept-a-payment'],
        ['Customer deposit addresses', '/docs/guide/payments/virtual-addresses'],
        ['Payment references', '/docs/guide/payments/transfer-memos'],
      ],
    },
  ],
  build: [
    {
      title: 'Build a wallet integration',
      description: 'Add wallet support and try a browser payment with Wagmi.',
      icon: 'wallet',
      links: [
        ['Accounts and keys', '/docs/accounts/keys'],
        ['Integrate a wallet', '/docs/quickstart/wallet-developers'],
        ['Browser payments', '/docs/guide/payments/send-a-payment/browser'],
      ],
    },
    {
      title: 'Create and exchange tokens',
      description: 'Create a test stablecoin, then try a swap on Moderato.',
      icon: 'tokens',
      links: [
        ['Create a TIP-20 token', '/docs/guide/issuance/create-a-stablecoin'],
        ['Swap stablecoins', '/docs/guide/stablecoin-dex/executing-swaps'],
      ],
    },
    {
      title: 'Deploy smart contracts',
      description: 'Use Foundry to deploy Solidity contracts and verify their source.',
      icon: 'code',
      links: [
        ['Deploy a contract', '/docs/network/contracts'],
        ['Verify a contract', '/docs/quickstart/verify-contracts'],
      ],
    },
    {
      title: 'Connect your application',
      description:
        'Choose your tools and check what changes when moving an Ethereum application to Tempo.',
      icon: 'network',
      links: [
        ['RPC endpoints and chain IDs', '/docs/quickstart/connection-details'],
        ['SDKs and CLI', '/docs/tools'],
        ['EVM differences', '/docs/quickstart/evm-compatibility'],
      ],
    },
  ],
  apis: [
    {
      title: 'Use the Tempo API',
      description:
        'Read balances and activity, integrate Tempo products, and configure API access.',
      icon: 'api',
      links: [
        ['API reference', '/docs/api/reference'],
        ['Authentication', '/docs/api/authentication'],
        ['API keys', '/docs/api/console/api-keys'],
      ],
    },
    {
      title: 'Read chain data',
      description: 'Call node methods directly or query indexed blockchain data with SQL.',
      icon: 'network',
      links: [
        ['JSON-RPC', '/docs/api/json-rpc'],
        ['Indexer', '/docs/api/indexer-api'],
      ],
    },
    {
      title: 'Sponsor transactions',
      description: 'Use the hosted fee payer to sponsor and broadcast transactions.',
      icon: 'wallet',
      links: [
        ['Fee payer', '/docs/api/fee-payer'],
        ['Typed API client', '/docs/api/typed-client'],
      ],
    },
    {
      title: 'Manage API access',
      description: 'Manage projects, access, and billing in Tempo Console.',
      icon: 'code',
      links: [
        ['Console guide', '/docs/api/console'],
        ['Open Tempo Console', 'https://console.tempo.xyz/'],
      ],
    },
  ],
  network: [
    {
      title: 'Connect and test',
      description: 'Choose a network, configure your RPC endpoint, and fund a test account.',
      icon: 'network',
      links: [
        ['Network details', '/docs/quickstart/connection-details'],
        ['Testnet faucet', '/docs/quickstart/faucet'],
      ],
    },
    {
      title: 'Bring an Ethereum application',
      description: 'Check execution differences and the RPC methods supported by Tempo nodes.',
      icon: 'code',
      links: [
        ['EVM differences', '/docs/quickstart/evm-compatibility'],
        ['JSON-RPC reference', '/docs/protocol/rpc'],
      ],
    },
    {
      title: 'Run your infrastructure',
      description: 'Operate your own Tempo node or find a provider for your application.',
      icon: 'server',
      links: [
        ['Run a node', '/docs/guide/node'],
        ['Infrastructure providers', '/docs/partners/rpc-and-nodes'],
      ],
    },
    {
      title: 'Follow the protocol',
      description: 'Read the specifications and track network upgrades.',
      icon: 'api',
      links: [
        ['Protocol specifications', '/docs/protocol'],
        ['Network upgrades', '/docs/protocol/upgrades'],
        ['Tempo source code', 'https://github.com/tempoxyz/tempo'],
      ],
    },
  ],
} as const
