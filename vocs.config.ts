import { defineConfig } from 'vocs'

export default defineConfig({
  title: 'Tempo',
  description: 'Documentation for Tempo testnet and protocol specifications',
  logoUrl: {
    light:
      'https://raw.githubusercontent.com/tempoxyz/.github/refs/heads/main/assets/combomark-bright.svg',
    dark: 'https://raw.githubusercontent.com/tempoxyz/.github/refs/heads/main/assets/combomark-dark.svg',
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
    '/testnet': [
      {
        text: 'Overview',
        link: '/testnet',
      },
      {
        text: 'FAQ',
        link: '/testnet/faq',
      },
      {
        text: 'Releases',
        items: [
          {
            text: 'Lento (Testnet #3)',
            link: '/testnet/lento',
          },
          {
            text: 'Adagietto (Testnet #2)',
            link: '/testnet/adagietto',
          },
          {
            text: 'Adagio (Testnet #1)',
            link: '/testnet/adagio',
          },
        ],
      },
    ],
    '/litepaper': [
      {
        text: 'Overview',
        link: '/litepaper',
      },
      {
        text: 'Motivation',
        link: '/litepaper/motivation',
      },
      {
        text: 'Neutrality',
        link: '/litepaper/neutrality',
      },
      {
        text: 'Payments',
        link: '/litepaper/payments',
      },
      {
        text: 'Privacy',
        link: '/litepaper/privacy',
      },
      {
        text: 'Performance',
        link: '/litepaper/performance',
      },
      {
        text: 'Use Cases',
        link: '/litepaper/use-cases',
      },
    ],
    '/documentation': [
      {
        text: 'Overview',
        link: '/documentation',
      },
      {
        text: 'Token Management',
        items: [
          {
            text: 'Overview',
            link: '/documentation/tokens',
          },
          {
            text: 'Deployment',
            link: '/documentation/tokens/deployment',
          },
          {
            text: 'Roles & Permissions',
            link: '/documentation/tokens/roles',
          },
          {
            text: 'Minting & Burning',
            link: '/documentation/tokens/minting',
          },
          {
            text: 'Policies',
            link: '/documentation/tokens/policies',
          },
        ],
      },
      {
        text: 'Sending Transactions',
        items: [
          {
            text: 'Overview',
            link: '/documentation/transactions',
          },
          {
            text: 'Fee Tokens',
            link: '/documentation/transactions/fee-tokens',
          },
          {
            text: 'Payment Lanes',
            link: '/documentation/transactions/payment-lanes',
          },
          {
            text: 'Batch Transactions',
            link: '/documentation/transactions/batch-transactions',
          },
          {
            text: 'Fee AMM',
            link: '/documentation/transactions/fee-amm',
          },
          {
            text: 'Fee Sponsorship',
            link: '/documentation/transactions/fee-sponsorship',
          },
        ],
      },
      {
        text: 'Account Management',
        items: [
          {
            text: 'Default Accounts',
            link: '/documentation/accounts',
          },
        ],
      },
    ],
    '/protocol': [
      {
        text: 'Overview',
        link: '/protocol',
      },
      {
        text: 'Github',
        link: 'https://github.com/tempoxyz/specs',
      },
      {
        text: 'Tokens',
        items: [
          {
            text: 'Overview',
            link: '/protocol/tokens',
          },
          {
            text: 'TIP-20',
            link: '/protocol/tokens/tip-20',
          },
          {
            text: 'TIP-4217',
            link: '/protocol/tokens/tip-4217',
          },
          {
            text: 'TIP-403',
            link: '/protocol/tokens/tip-403',
          },
        ],
      },
      {
        text: 'Transactions',
        items: [
          {
            text: 'Overview',
            link: '/protocol/transactions',
          },
          {
            text: 'Fee Tokens',
            link: '/protocol/transactions/fee-tokens',
          },
          {
            text: 'Fee Payers',
            link: '/protocol/transactions/fee-payers',
          },
          {
            text: 'Fee AMM',
            link: '/protocol/transactions/fee-amm',
          },
          {
            text: 'Payments Lane',
            link: '/protocol/transactions/payments-lane',
          },
        ],
      },
      {
        text: 'Accounts',
        items: [
          {
            text: 'Overview',
            link: '/protocol/accounts',
          },
        ],
      },
      {
        text: 'Consensus',
        items: [
          {
            text: 'Overview',
            link: '/protocol/consensus',
          },
        ],
      },
      {
        text: 'Specs',
        items: [
          {
            text: 'Account Abstraction Tx Type',
            link: '/protocol/specs/AccountAbstractionTx',
          },
          {
            text: 'Default Account Abstraction (DAA)',
            link: '/protocol/specs/DefaultAccountAbstraction',
          },
          { text: 'Fee AMM Specification', link: '/protocol/specs/FeeAMM' },
          { text: 'Payment lane', link: '/protocol/specs/PaymentLane' },
          {
            text: 'Stablecoin Exchange Specification',
            link: '/protocol/specs/StablecoinExchange',
          },
          {
            text: 'Tempo Transactions (Type 0x77)',
            link: '/protocol/specs/TempoTransaction',
          },
          {
            text: 'Token Preferences',
            link: '/protocol/specs/TokenPreferences',
          },
        ],
      },
    ],
    '/sdk/typescript': [
      {
        text: 'Getting Started',
        link: '/sdk/typescript',
      },
      {
        text: 'Guides',
        items: [
          {
            text: 'Creating & Managing Tokens 🚧',
            link: '/sdk/typescript/guides/creating-managing-tokens',
            disabled: true,
          },
          {
            text: 'Managing Liquidity with Fee AMM 🚧',
            link: '/sdk/typescript/guides/fee-amm',
            disabled: true,
          },
          {
            text: 'Interacting with Enshrined DEX 🚧',
            link: '/sdk/typescript/guides/interacting-with-enshrined-dex',
            disabled: true,
          },
          {
            text: 'Setting Fee Tokens 🚧',
            link: '/sdk/typescript/guides/setting-fee-tokens',
            disabled: true,
          },
          {
            text: 'Sponsoring Transactions 🚧',
            link: '/sdk/typescript/guides/sponsoring-transactions',
            disabled: true,
          },
        ],
      },
      {
        text: 'API Reference',
        items: [
          {
            text: 'Overview',
            link: '/sdk/typescript/api',
          },
          {
            text: 'Actions',
            collapsed: true,
            items: [
              {
                text: 'AMM',
                items: [
                  { text: 'burn', link: '/sdk/typescript/api/amm.burn' },
                  {
                    text: 'getLiquidityBalance',
                    link: '/sdk/typescript/api/amm.getLiquidityBalance',
                  },
                  { text: 'getPool', link: '/sdk/typescript/api/amm.getPool' },
                  {
                    text: 'getPoolId',
                    link: '/sdk/typescript/api/amm.getPoolId',
                  },
                  {
                    text: 'getTotalSupply',
                    link: '/sdk/typescript/api/amm.getTotalSupply',
                  },
                  { text: 'mint', link: '/sdk/typescript/api/amm.mint' },
                  {
                    text: 'rebalanceSwap',
                    link: '/sdk/typescript/api/amm.rebalanceSwap',
                  },
                ],
              },
              {
                text: 'Fee',
                items: [
                  {
                    text: 'getUserToken',
                    link: '/sdk/typescript/api/fee.getUserToken',
                  },
                  {
                    text: 'setUserToken',
                    link: '/sdk/typescript/api/fee.setUserToken',
                  },
                ],
              },
              {
                text: 'Policy',
                items: [
                  {
                    text: 'create',
                    link: '/sdk/typescript/api/policy.create',
                  },
                  {
                    text: 'getData',
                    link: '/sdk/typescript/api/policy.getData',
                  },
                  {
                    text: 'isAuthorized',
                    link: '/sdk/typescript/api/policy.isAuthorized',
                  },
                  {
                    text: 'modifyBlacklist',
                    link: '/sdk/typescript/api/policy.modifyBlacklist',
                  },
                  {
                    text: 'modifyWhitelist',
                    link: '/sdk/typescript/api/policy.modifyWhitelist',
                  },
                  {
                    text: 'setAdmin',
                    link: '/sdk/typescript/api/policy.setAdmin',
                  },
                ],
              },
              {
                text: 'Token',
                items: [
                  {
                    text: 'approve',
                    link: '/sdk/typescript/api/token.approve',
                  },
                  { text: 'burn', link: '/sdk/typescript/api/token.burn' },
                  {
                    text: 'burnBlocked',
                    link: '/sdk/typescript/api/token.burnBlocked',
                  },
                  {
                    text: 'changeTransferPolicy',
                    link: '/sdk/typescript/api/token.changeTransferPolicy',
                  },
                  {
                    text: 'create',
                    link: '/sdk/typescript/api/token.create',
                  },
                  {
                    text: 'getAllowance',
                    link: '/sdk/typescript/api/token.getAllowance',
                  },
                  {
                    text: 'getBalance',
                    link: '/sdk/typescript/api/token.getBalance',
                  },
                  {
                    text: 'getMetadata',
                    link: '/sdk/typescript/api/token.getMetadata',
                  },
                  {
                    text: 'grantRoles',
                    link: '/sdk/typescript/api/token.grantRoles',
                  },
                  { text: 'mint', link: '/sdk/typescript/api/token.mint' },
                  { text: 'pause', link: '/sdk/typescript/api/token.pause' },
                  {
                    text: 'permit',
                    link: '/sdk/typescript/api/token.permit',
                  },
                  {
                    text: 'renounceRoles',
                    link: '/sdk/typescript/api/token.renounceRoles',
                  },
                  {
                    text: 'revokeRoles',
                    link: '/sdk/typescript/api/token.revokeRoles',
                  },
                  {
                    text: 'setRoleAdmin',
                    link: '/sdk/typescript/api/token.setRoleAdmin',
                  },
                  {
                    text: 'setSupplyCap',
                    link: '/sdk/typescript/api/token.setSupplyCap',
                  },
                  {
                    text: 'transfer',
                    link: '/sdk/typescript/api/token.transfer',
                  },
                  {
                    text: 'unpause',
                    link: '/sdk/typescript/api/token.unpause',
                  },
                ],
              },
            ],
          },
          {
            text: 'Clients',
            collapsed: true,
            items: [
              {
                text: 'createTempoClient',
                link: '/sdk/typescript/api/createTempoClient',
              },
            ],
          },
          {
            text: 'Transports',
            collapsed: true,
            items: [
              {
                text: 'withFeePayer',
                link: '/sdk/typescript/api/withFeePayer',
              },
            ],
          },
        ],
      },
    ],
  },
  topNav: [
    { text: 'Testnet', link: '/testnet' },
    { text: 'Documentation', link: '/documentation' },
    { text: 'Protocol', link: '/protocol' },
    { text: 'Litepaper', link: '/litepaper' },
    { text: 'SDK', link: '/sdk/typescript' },
  ],
})
