import { defineConfig } from 'vocs'

export default defineConfig({
  title: 'Tempo Docs',
  description: 'Documentation for the Tempo blockchain',
  baseUrl: 'https://docs.tempo.xyz',
  ogImageUrl: {
    '/': '/og.png',
    '/docs': '/api/og?title=%title&description=%description',
  },
  socials: [
    {
      icon: 'github',
      link: 'https://github.com/tempoxyz/tempo',
    },
    {
      icon: 'x',
      link: 'https://x.com/tempoxyz',
    },
  ],
  sidebar: {
    '/': [
      {
        text: 'Home',
        link: '/',
      },
      {
        text: 'Integrate Tempo Testnet',
        items: [
          { text: 'Overview', link: '/quickstart/' },
          { text: 'Network Upgrades', link: '/network-upgrades' },
          { text: 'Connection Details', link: '/quickstart/connection-details' },
          { text: 'Faucet', link: '/quickstart/faucet' },
          { text: 'Developer Tools', link: '/quickstart/developer-tools' },
          { text: 'EVM Differences', link: '/quickstart/evm-differences' },
          { text: 'Predeployed Contracts', link: '/quickstart/predeployed-contracts' },
          { text: 'Wallet Developers', link: '/quickstart/wallet-developers' },
        ],
      },
      {
        text: 'Start Building on Tempo',
        items: [
          {
            text: 'Use Tempo Transactions',
            link: '/guide/tempo-transaction/',
          },
          {
            text: 'Create & Use Accounts',
            items: [
              { text: 'Overview', link: '/guide/use-accounts/' },
              { text: 'Embed Passkey Accounts', link: '/guide/use-accounts/embed-passkey-accounts' },
              { text: 'Use Existing Wallets', link: '/guide/use-accounts/use-existing-wallets' },
              { text: 'Add Funds', link: '/guide/use-accounts/add-funds' },
            ],
          },
          {
            text: 'Make Payments',
            items: [
              { text: 'Overview', link: '/guide/payments/' },
              { text: 'Send a Payment', link: '/guide/payments/send-a-payment' },
              { text: 'Accept Payments', link: '/guide/payments/accept-payments' },
              { text: 'Fee Payment Options', link: '/guide/payments/fee-payment-options' },
              { text: 'Sponsor Transactions', link: '/guide/payments/sponsor-transactions' },
              { text: 'Parallel Transactions', link: '/guide/payments/parallel-transactions' },
            ],
          },
          {
            text: 'Issue Stablecoins',
            items: [
              { text: 'Overview', link: '/guide/issuance/' },
              { text: 'Create a Stablecoin', link: '/guide/issuance/create-a-stablecoin' },
              { text: 'Mint & Burn', link: '/guide/issuance/mint-and-burn' },
              { text: 'Set Fees', link: '/guide/issuance/set-fees' },
              { text: 'Enable Rewards', link: '/guide/issuance/enable-rewards' },
              { text: 'Manage Issuance', link: '/guide/issuance/manage-issuance' },
            ],
          },
          {
            text: 'Exchange Stablecoins',
            items: [
              { text: 'Overview', link: '/guide/stablecoin-dex/' },
              { text: 'Fee Liquidity', link: '/guide/stablecoin-dex/fee-liquidity' },
              { text: 'Swap Stablecoins', link: '/guide/stablecoin-dex/swap-stablecoins' },
              { text: 'Orderbook Trading', link: '/guide/stablecoin-dex/orderbook-trading' },
              { text: 'Provide Liquidity', link: '/guide/stablecoin-dex/provide-liquidity' },
            ],
          },
        ],
      },
      {
        text: 'Tempo Protocol Specs',
        items: [
          {
            text: 'TIP-20 Tokens',
            link: '/protocol/tip20/',
          },
          {
            text: 'TIP-20 Rewards',
            link: '/protocol/tip20-rewards/',
          },
          {
            text: 'TIP-403 Policies',
            link: '/protocol/tip403/',
          },
          {
            text: 'Fees & Fee AMM',
            link: '/protocol/fees/',
          },
          {
            text: 'Tempo Transactions',
            link: '/protocol/transactions/',
          },
          {
            text: 'Blockspace',
            link: '/protocol/blockspace/',
          },
          {
            text: 'Stablecoin DEX',
            link: '/protocol/exchange/',
          },
          {
            text: 'TIPs',
            link: '/protocol/tips/',
          },
        ],
      },
      {
        text: 'Tempo SDKs',
        items: [
          {
            text: 'TypeScript',
            items: [
              { text: 'Overview', link: '/sdk/typescript/' },
              { text: 'Viem', link: '/sdk/typescript/viem' },
              { text: 'Wagmi', link: '/sdk/typescript/wagmi' },
              { text: 'Server Handler', link: '/sdk/typescript/server-handler' },
            ],
          },
          { text: 'Go', link: '/sdk/go/' },
          { text: 'Foundry', link: '/sdk/foundry/' },
          { text: 'Rust', link: '/sdk/rust/' },
        ],
      },
    ],
    '/learn': [
      {
        text: 'Learn',
        items: [
          {
            text: 'Stablecoins',
            link: '/learn/stablecoins/',
          },
          {
            text: 'Tempo',
            link: '/learn/tempo/',
          },
          {
            text: 'Use Cases',
            items: [
              { text: 'Remittances', link: '/learn/use-cases/remittances' },
              { text: 'Payouts', link: '/learn/use-cases/payouts' },
              { text: 'Embedded Finance', link: '/learn/use-cases/embedded-finance' },
              { text: 'Deposits', link: '/learn/use-cases/deposits' },
              { text: 'Microtransactions', link: '/learn/use-cases/microtransactions' },
              { text: 'Agentic Commerce', link: '/learn/use-cases/agentic-commerce' },
            ],
          },
        ],
      },
    ],
  },
})
