import { ModuleResolutionKind } from 'typescript'
import { defineConfig } from 'vocs'

export default defineConfig({
  banner: {
    content:
      'We have released our fourth testnet, named <span class="font-medium">Andante</span>. <a href="/testnet/andante" class="text-[#0588F0] no-underline">See updates →</a>',
  },
  head() {
    return (
      <>
        <meta
          content="width=device-width, initial-scale=1, maximum-scale=1"
          name="viewport"
        />
        <meta content="/social.jpg" property="og:image" />
        <meta content="image/png" property="og:image:type" />
        <meta content="1200" property="og:image:width" />
        <meta content="630" property="og:image:height" />
      </>
    )
  },
  title: 'Tempo',
  description: 'Documentation for Tempo testnet and protocol specifications',
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
    '/testnet': [
      {
        text: 'Overview',
        link: '/testnet',
      },
      {
        text: 'Getting started',
        link: '/testnet/getting-started',
      },
      {
        text: 'FAQ',
        link: '/testnet/faq',
      },
      {
        text: 'Releases',
        items: [
          {
            text: 'Andante (Testnet #4)',
            link: '/testnet/andante',
          },
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
    ],
    '/documentation': [
      {
        text: 'Overview',
        link: '/documentation',
      },
      {
        text: 'Tokens',
        items: [
          {
            text: 'Overview',
            link: '/documentation/tokens',
          },
          {
            text: 'Creating Tokens',
            link: '/documentation/tokens/creating-tokens',
          },
          {
            text: 'linkingUSD',
            link: '/documentation/tokens/linkingUSD',
          },
          {
            text: 'Roles & Permissions',
            link: '/documentation/tokens/roles',
          },
          {
            text: 'Controlling Supply',
            link: '/documentation/tokens/controlling-supply',
          },
          {
            text: 'Transfer Policies',
            link: '/documentation/tokens/transfer-policies',
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
          {
            text: 'Scheduled Transactions',
            link: '/documentation/transactions/scheduled-transactions',
          },
        ],
      },
      {
        text: 'Exchanging Tokens',
        items: [
          {
            text: 'Overview',
            link: '/documentation/exchange',
          },
          {
            text: 'Executing Swaps',
            link: '/documentation/exchange/executing-swaps',
          },
          {
            text: 'Providing Liquidity',
            link: '/documentation/exchange/providing-liquidity',
          },
          {
            text: 'Exchange Balance',
            link: '/documentation/exchange/exchange-balance',
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
          {
            text: 'Passkey Authentication',
            link: '/documentation/accounts/passkeys',
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
          {
            text: 'Account Abstraction',
            link: '/protocol/transactions/account-abstraction',
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
        text: 'Exchange',
        items: [
          {
            text: 'Contract Interface',
            link: '/protocol/exchange/contract-interface',
          },
          {
            text: 'Execution Semantics',
            link: '/protocol/exchange/execution-semantics',
          },
          {
            text: 'Market Rules',
            link: '/protocol/exchange/market-rules',
          },
        ],
      },
    ],
    '/rpc': [
      {
        text: 'Overview',
        link: '/rpc',
      },
      {
        text: 'amm_getLiquidityPools 🚧',
        link: '/rpc/amm_getLiquidityPools',
      },
      {
        text: 'dex_getOrderbooks 🚧',
        link: '/rpc/dex_getOrderbooks',
      },
      {
        text: 'dex_getOrders',
        link: '/rpc/dex_getOrders',
      },
      {
        text: 'eth_getTransactions 🚧',
        link: '/rpc/eth_getTransactions',
      },
      {
        text: 'policy_getAddresses 🚧',
        link: '/rpc/policy_getAddresses',
      },
      {
        text: 'token_getRoleHistory 🚧',
        link: '/rpc/token_getRoleHistory',
      },
      {
        text: 'token_getTokens 🚧',
        link: '/rpc/token_getTokens',
      },
      {
        text: 'token_getTokensByAddress 🚧',
        link: '/rpc/token_getTokensByAddress',
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
                  {
                    text: 'watchBurn',
                    link: '/sdk/typescript/api/amm.watchBurn',
                  },
                  {
                    text: 'watchFeeSwap',
                    link: '/sdk/typescript/api/amm.watchFeeSwap',
                  },
                  {
                    text: 'watchMint',
                    link: '/sdk/typescript/api/amm.watchMint',
                  },
                  {
                    text: 'watchRebalanceSwap',
                    link: '/sdk/typescript/api/amm.watchRebalanceSwap',
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
                  {
                    text: 'watchSetUserToken',
                    link: '/sdk/typescript/api/fee.watchSetUserToken',
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
                  {
                    text: 'watchAdminUpdated',
                    link: '/sdk/typescript/api/policy.watchAdminUpdated',
                  },
                  {
                    text: 'watchBlacklistUpdated',
                    link: '/sdk/typescript/api/policy.watchBlacklistUpdated',
                  },
                  {
                    text: 'watchCreate',
                    link: '/sdk/typescript/api/policy.watchCreate',
                  },
                  {
                    text: 'watchWhitelistUpdated',
                    link: '/sdk/typescript/api/policy.watchWhitelistUpdated',
                  },
                ],
              },
              {
                text: 'Stablecoin Exchange',
                items: [
                  { text: 'buy', link: '/sdk/typescript/api/dex.buy' },
                  { text: 'cancel', link: '/sdk/typescript/api/dex.cancel' },
                  {
                    text: 'createPair',
                    link: '/sdk/typescript/api/dex.createPair',
                  },
                  {
                    text: 'getBalance',
                    link: '/sdk/typescript/api/dex.getBalance',
                  },
                  {
                    text: 'getBuyQuote',
                    link: '/sdk/typescript/api/dex.getBuyQuote',
                  },
                  {
                    text: 'getOrder',
                    link: '/sdk/typescript/api/dex.getOrder',
                  },
                  {
                    text: 'getPriceLevel',
                    link: '/sdk/typescript/api/dex.getPriceLevel',
                  },
                  {
                    text: 'getSellQuote',
                    link: '/sdk/typescript/api/dex.getSellQuote',
                  },
                  { text: 'place', link: '/sdk/typescript/api/dex.place' },
                  {
                    text: 'placeFlip',
                    link: '/sdk/typescript/api/dex.placeFlip',
                  },
                  { text: 'sell', link: '/sdk/typescript/api/dex.sell' },
                  {
                    text: 'watchFlipOrderPlaced',
                    link: '/sdk/typescript/api/dex.watchFlipOrderPlaced',
                  },
                  {
                    text: 'watchOrderCancelled',
                    link: '/sdk/typescript/api/dex.watchOrderCancelled',
                  },
                  {
                    text: 'watchOrderFilled',
                    link: '/sdk/typescript/api/dex.watchOrderFilled',
                  },
                  {
                    text: 'watchOrderPlaced',
                    link: '/sdk/typescript/api/dex.watchOrderPlaced',
                  },
                  {
                    text: 'withdraw',
                    link: '/sdk/typescript/api/dex.withdraw',
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
                  {
                    text: 'hasRole',
                    link: '/sdk/typescript/api/token.hasRole',
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
                  {
                    text: 'watchAdminRole',
                    link: '/sdk/typescript/api/token.watchAdminRole',
                  },
                  {
                    text: 'watchApprove',
                    link: '/sdk/typescript/api/token.watchApprove',
                  },
                  {
                    text: 'watchBurn',
                    link: '/sdk/typescript/api/token.watchBurn',
                  },
                  {
                    text: 'watchCreate',
                    link: '/sdk/typescript/api/token.watchCreate',
                  },
                  {
                    text: 'watchMint',
                    link: '/sdk/typescript/api/token.watchMint',
                  },
                  {
                    text: 'watchRole',
                    link: '/sdk/typescript/api/token.watchRole',
                  },
                  {
                    text: 'watchTransfer',
                    link: '/sdk/typescript/api/token.watchTransfer',
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
    { text: 'SDK', link: '/sdk/typescript' },
    {
      text: 'References',
      items: [
        { text: 'Protocol', link: '/protocol' },
        { text: 'RPC', link: '/rpc' },
        { text: 'Litepaper', link: '/litepaper' },
      ],
    },
  ],
  twoslash: {
    compilerOptions: {
      moduleResolution: ModuleResolutionKind.Bundler,
    },
  },
})
