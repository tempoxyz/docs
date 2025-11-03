import { ModuleResolutionKind } from 'typescript'
import { defineConfig } from 'vocs'

export default defineConfig({
  banner: {
    content:
      'We have released our fourth testnet, named <span className="font-medium">Andante</span>. <a href="/testnet/andante" className="text-[#0588F0] no-underline">See updates →</a>',
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
        // TODO: Add rewrite for /sdk/typescript/viem -> /sdk/typescript/viem
        text: 'Viem Reference',
        items: [
          {
            text: 'Overview',
            link: '/sdk/typescript/viem',
          },
          {
            text: 'Actions',
            collapsed: true,
            items: [
              {
                text: 'AMM',
                items: [
                  { text: 'burn', link: '/sdk/typescript/viem/amm.burn' },
                  {
                    text: 'getLiquidityBalance',
                    link: '/sdk/typescript/viem/amm.getLiquidityBalance',
                  },
                  { text: 'getPool', link: '/sdk/typescript/viem/amm.getPool' },
                  { text: 'mint', link: '/sdk/typescript/viem/amm.mint' },
                  {
                    text: 'rebalanceSwap',
                    link: '/sdk/typescript/viem/amm.rebalanceSwap',
                  },
                  {
                    text: 'watchBurn',
                    link: '/sdk/typescript/viem/amm.watchBurn',
                  },
                  {
                    text: 'watchFeeSwap',
                    link: '/sdk/typescript/viem/amm.watchFeeSwap',
                  },
                  {
                    text: 'watchMint',
                    link: '/sdk/typescript/viem/amm.watchMint',
                  },
                  {
                    text: 'watchRebalanceSwap',
                    link: '/sdk/typescript/viem/amm.watchRebalanceSwap',
                  },
                ],
              },
              {
                text: 'Fee',
                items: [
                  {
                    text: 'getUserToken',
                    link: '/sdk/typescript/viem/fee.getUserToken',
                  },
                  {
                    text: 'setUserToken',
                    link: '/sdk/typescript/viem/fee.setUserToken',
                  },
                  {
                    text: 'watchSetUserToken',
                    link: '/sdk/typescript/viem/fee.watchSetUserToken',
                  },
                ],
              },
              {
                text: 'Policy',
                items: [
                  {
                    text: 'create',
                    link: '/sdk/typescript/viem/policy.create',
                  },
                  {
                    text: 'getData',
                    link: '/sdk/typescript/viem/policy.getData',
                  },
                  {
                    text: 'isAuthorized',
                    link: '/sdk/typescript/viem/policy.isAuthorized',
                  },
                  {
                    text: 'modifyBlacklist',
                    link: '/sdk/typescript/viem/policy.modifyBlacklist',
                  },
                  {
                    text: 'modifyWhitelist',
                    link: '/sdk/typescript/viem/policy.modifyWhitelist',
                  },
                  {
                    text: 'setAdmin',
                    link: '/sdk/typescript/viem/policy.setAdmin',
                  },
                  {
                    text: 'watchAdminUpdated',
                    link: '/sdk/typescript/viem/policy.watchAdminUpdated',
                  },
                  {
                    text: 'watchBlacklistUpdated',
                    link: '/sdk/typescript/viem/policy.watchBlacklistUpdated',
                  },
                  {
                    text: 'watchCreate',
                    link: '/sdk/typescript/viem/policy.watchCreate',
                  },
                  {
                    text: 'watchWhitelistUpdated',
                    link: '/sdk/typescript/viem/policy.watchWhitelistUpdated',
                  },
                ],
              },
              {
                text: 'Reward',
                items: [
                  {
                    text: 'cancel',
                    link: '/sdk/typescript/api/reward.cancel',
                  },
                  {
                    text: 'getStream',
                    link: '/sdk/typescript/api/reward.getStream',
                  },
                  {
                    text: 'getTotalPerSecond',
                    link: '/sdk/typescript/api/reward.getTotalPerSecond',
                  },
                  {
                    text: 'setRecipient',
                    link: '/sdk/typescript/api/reward.setRecipient',
                  },
                  {
                    text: 'start',
                    link: '/sdk/typescript/api/reward.start',
                  },
                ],
              },
              {
                text: 'Stablecoin Exchange',
                items: [
                  { text: 'buy', link: '/sdk/typescript/viem/dex.buy' },
                  { text: 'cancel', link: '/sdk/typescript/viem/dex.cancel' },
                  {
                    text: 'createPair',
                    link: '/sdk/typescript/viem/dex.createPair',
                  },
                  {
                    text: 'getBalance',
                    link: '/sdk/typescript/viem/dex.getBalance',
                  },
                  {
                    text: 'getBuyQuote',
                    link: '/sdk/typescript/viem/dex.getBuyQuote',
                  },
                  {
                    text: 'getOrder',
                    link: '/sdk/typescript/viem/dex.getOrder',
                  },
                  {
                    text: 'getPriceLevel',
                    link: '/sdk/typescript/viem/dex.getPriceLevel',
                  },
                  {
                    text: 'getSellQuote',
                    link: '/sdk/typescript/viem/dex.getSellQuote',
                  },
                  { text: 'place', link: '/sdk/typescript/viem/dex.place' },
                  {
                    text: 'placeFlip',
                    link: '/sdk/typescript/viem/dex.placeFlip',
                  },
                  { text: 'sell', link: '/sdk/typescript/viem/dex.sell' },
                  {
                    text: 'watchFlipOrderPlaced',
                    link: '/sdk/typescript/viem/dex.watchFlipOrderPlaced',
                  },
                  {
                    text: 'watchOrderCancelled',
                    link: '/sdk/typescript/viem/dex.watchOrderCancelled',
                  },
                  {
                    text: 'watchOrderFilled',
                    link: '/sdk/typescript/viem/dex.watchOrderFilled',
                  },
                  {
                    text: 'watchOrderPlaced',
                    link: '/sdk/typescript/viem/dex.watchOrderPlaced',
                  },
                  {
                    text: 'withdraw',
                    link: '/sdk/typescript/viem/dex.withdraw',
                  },
                ],
              },
              {
                text: 'Token',
                items: [
                  {
                    text: 'approve',
                    link: '/sdk/typescript/viem/token.approve',
                  },
                  { text: 'burn', link: '/sdk/typescript/viem/token.burn' },
                  {
                    text: 'burnBlocked',
                    link: '/sdk/typescript/viem/token.burnBlocked',
                  },
                  {
                    text: 'changeTransferPolicy',
                    link: '/sdk/typescript/viem/token.changeTransferPolicy',
                  },
                  {
                    text: 'create',
                    link: '/sdk/typescript/viem/token.create',
                  },
                  {
                    text: 'getAllowance',
                    link: '/sdk/typescript/viem/token.getAllowance',
                  },
                  {
                    text: 'getBalance',
                    link: '/sdk/typescript/viem/token.getBalance',
                  },
                  {
                    text: 'getMetadata',
                    link: '/sdk/typescript/viem/token.getMetadata',
                  },
                  {
                    text: 'grantRoles',
                    link: '/sdk/typescript/viem/token.grantRoles',
                  },
                  {
                    text: 'hasRole',
                    link: '/sdk/typescript/viem/token.hasRole',
                  },
                  { text: 'mint', link: '/sdk/typescript/viem/token.mint' },
                  { text: 'pause', link: '/sdk/typescript/viem/token.pause' },
                  {
                    text: 'permit',
                    link: '/sdk/typescript/viem/token.permit',
                  },
                  {
                    text: 'renounceRoles',
                    link: '/sdk/typescript/viem/token.renounceRoles',
                  },
                  {
                    text: 'revokeRoles',
                    link: '/sdk/typescript/viem/token.revokeRoles',
                  },
                  {
                    text: 'setRoleAdmin',
                    link: '/sdk/typescript/viem/token.setRoleAdmin',
                  },
                  {
                    text: 'setSupplyCap',
                    link: '/sdk/typescript/viem/token.setSupplyCap',
                  },
                  {
                    text: 'transfer',
                    link: '/sdk/typescript/viem/token.transfer',
                  },
                  {
                    text: 'unpause',
                    link: '/sdk/typescript/viem/token.unpause',
                  },
                  {
                    text: 'watchAdminRole',
                    link: '/sdk/typescript/viem/token.watchAdminRole',
                  },
                  {
                    text: 'watchApprove',
                    link: '/sdk/typescript/viem/token.watchApprove',
                  },
                  {
                    text: 'watchBurn',
                    link: '/sdk/typescript/viem/token.watchBurn',
                  },
                  {
                    text: 'watchCreate',
                    link: '/sdk/typescript/viem/token.watchCreate',
                  },
                  {
                    text: 'watchMint',
                    link: '/sdk/typescript/viem/token.watchMint',
                  },
                  {
                    text: 'watchRole',
                    link: '/sdk/typescript/viem/token.watchRole',
                  },
                  {
                    text: 'watchTransfer',
                    link: '/sdk/typescript/viem/token.watchTransfer',
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
                link: '/sdk/typescript/viem/createTempoClient',
              },
            ],
          },
          {
            text: 'Transports',
            collapsed: true,
            items: [
              {
                text: 'withFeePayer',
                link: '/sdk/typescript/viem/withFeePayer',
              },
            ],
          },
        ],
      },
      {
        text: 'Wagmi Reference',
        items: [
          {
            text: 'Overview',
            link: '/sdk/typescript/wagmi',
          },
          {
            text: 'Connectors 🚧',
            collapsed: true,
            items: [
              {
                text: 'dangerous_secp256k1 🚧',
                link: '/sdk/typescript/wagmi/connectors/dangerous_secp256k1',
              },
              {
                text: 'webAuthn 🚧',
                link: '/sdk/typescript/wagmi/connectors/webAuthn',
              },
            ],
          },
          {
            text: 'Actions 🚧',
            collapsed: true,
            items: [
              {
                text: 'AMM',
                items: [
                  {
                    text: 'burn 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.burn',
                  },
                  {
                    text: 'getLiquidityBalance 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.getLiquidityBalance',
                  },
                  {
                    text: 'getPool 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.getPool',
                  },
                  {
                    text: 'getPoolId 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.getPoolId',
                  },
                  {
                    text: 'getTotalSupply 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.getTotalSupply',
                  },
                  {
                    text: 'mint 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.mint',
                  },
                  {
                    text: 'rebalanceSwap 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.rebalanceSwap',
                  },
                  {
                    text: 'watchBurn 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.watchBurn',
                  },
                  {
                    text: 'watchFeeSwap 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.watchFeeSwap',
                  },
                  {
                    text: 'watchMint 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.watchMint',
                  },
                  {
                    text: 'watchRebalanceSwap 🚧',
                    link: '/sdk/typescript/wagmi/actions/amm.watchRebalanceSwap',
                  },
                ],
              },
              {
                text: 'Fee',
                items: [
                  {
                    text: 'getUserToken 🚧',
                    link: '/sdk/typescript/wagmi/actions/fee.getUserToken',
                  },
                  {
                    text: 'setUserToken 🚧',
                    link: '/sdk/typescript/wagmi/actions/fee.setUserToken',
                  },
                  {
                    text: 'watchSetUserToken 🚧',
                    link: '/sdk/typescript/wagmi/actions/fee.watchSetUserToken',
                  },
                ],
              },
              {
                text: 'Policy',
                items: [
                  {
                    text: 'create 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.create',
                  },
                  {
                    text: 'getData 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.getData',
                  },
                  {
                    text: 'isAuthorized 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.isAuthorized',
                  },
                  {
                    text: 'modifyBlacklist 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.modifyBlacklist',
                  },
                  {
                    text: 'modifyWhitelist 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.modifyWhitelist',
                  },
                  {
                    text: 'setAdmin 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.setAdmin',
                  },
                  {
                    text: 'watchAdminUpdated 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.watchAdminUpdated',
                  },
                  {
                    text: 'watchBlacklistUpdated 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.watchBlacklistUpdated',
                  },
                  {
                    text: 'watchCreate 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.watchCreate',
                  },
                  {
                    text: 'watchWhitelistUpdated 🚧',
                    link: '/sdk/typescript/wagmi/actions/policy.watchWhitelistUpdated',
                  },
                ],
              },
              {
                text: 'Stablecoin Exchange',
                items: [
                  {
                    text: 'buy 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.buy',
                  },
                  {
                    text: 'cancel 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.cancel',
                  },
                  {
                    text: 'createPair 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.createPair',
                  },
                  {
                    text: 'getBalance 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.getBalance',
                  },
                  {
                    text: 'getBuyQuote 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.getBuyQuote',
                  },
                  {
                    text: 'getOrder 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.getOrder',
                  },
                  {
                    text: 'getPriceLevel 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.getPriceLevel',
                  },
                  {
                    text: 'getSellQuote 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.getSellQuote',
                  },
                  {
                    text: 'place 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.place',
                  },
                  {
                    text: 'placeFlip 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.placeFlip',
                  },
                  {
                    text: 'sell 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.sell',
                  },
                  {
                    text: 'watchFlipOrderPlaced 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.watchFlipOrderPlaced',
                  },
                  {
                    text: 'watchOrderCancelled 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.watchOrderCancelled',
                  },
                  {
                    text: 'watchOrderFilled 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.watchOrderFilled',
                  },
                  {
                    text: 'watchOrderPlaced 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.watchOrderPlaced',
                  },
                  {
                    text: 'withdraw 🚧',
                    link: '/sdk/typescript/wagmi/actions/dex.withdraw',
                  },
                ],
              },
              {
                text: 'Token',
                items: [
                  {
                    text: 'approve 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.approve',
                  },
                  {
                    text: 'burn 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.burn',
                  },
                  {
                    text: 'burnBlocked 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.burnBlocked',
                  },
                  {
                    text: 'changeTransferPolicy 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.changeTransferPolicy',
                  },
                  {
                    text: 'create 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.create',
                  },
                  {
                    text: 'getAllowance 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.getAllowance',
                  },
                  {
                    text: 'getBalance 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.getBalance',
                  },
                  {
                    text: 'getMetadata 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.getMetadata',
                  },
                  {
                    text: 'grantRoles 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.grantRoles',
                  },
                  {
                    text: 'hasRole 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.hasRole',
                  },
                  {
                    text: 'mint 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.mint',
                  },
                  {
                    text: 'pause 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.pause',
                  },
                  {
                    text: 'permit 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.permit',
                  },
                  {
                    text: 'renounceRoles 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.renounceRoles',
                  },
                  {
                    text: 'revokeRoles 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.revokeRoles',
                  },
                  {
                    text: 'setRoleAdmin 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.setRoleAdmin',
                  },
                  {
                    text: 'setSupplyCap 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.setSupplyCap',
                  },
                  {
                    text: 'transfer 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.transfer',
                  },
                  {
                    text: 'unpause 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.unpause',
                  },
                  {
                    text: 'watchAdminRole 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.watchAdminRole',
                  },
                  {
                    text: 'watchApprove 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.watchApprove',
                  },
                  {
                    text: 'watchBurn 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.watchBurn',
                  },
                  {
                    text: 'watchCreate 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.watchCreate',
                  },
                  {
                    text: 'watchMint 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.watchMint',
                  },
                  {
                    text: 'watchRole 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.watchRole',
                  },
                  {
                    text: 'watchTransfer 🚧',
                    link: '/sdk/typescript/wagmi/actions/token.watchTransfer',
                  },
                ],
              },
            ],
          },
          {
            text: 'Hooks 🚧',
            collapsed: true,
            items: [
              {
                text: 'AMM',
                items: [
                  {
                    text: 'useBurn 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useBurn',
                  },
                  {
                    text: 'useLiquidityBalance 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useLiquidityBalance',
                  },
                  {
                    text: 'useMint 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useMint',
                  },
                  {
                    text: 'usePool 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.usePool',
                  },
                  {
                    text: 'usePoolId 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.usePoolId',
                  },
                  {
                    text: 'useRebalanceSwap 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useRebalanceSwap',
                  },
                  {
                    text: 'useTotalSupply 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useTotalSupply',
                  },
                  {
                    text: 'useWatchBurn 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchBurn',
                  },
                  {
                    text: 'useWatchFeeSwap 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchFeeSwap',
                  },
                  {
                    text: 'useWatchMint 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchMint',
                  },
                  {
                    text: 'useWatchRebalanceSwap 🚧',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchRebalanceSwap',
                  },
                ],
              },
              {
                text: 'Fee',
                items: [
                  {
                    text: 'useSetUserToken 🚧',
                    link: '/sdk/typescript/wagmi/hooks/fee.useSetUserToken',
                  },
                  {
                    text: 'useUserToken 🚧',
                    link: '/sdk/typescript/wagmi/hooks/fee.useUserToken',
                  },
                  {
                    text: 'useWatchSetUserToken 🚧',
                    link: '/sdk/typescript/wagmi/hooks/fee.useWatchSetUserToken',
                  },
                ],
              },
              {
                text: 'Policy',
                items: [
                  {
                    text: 'useCreate 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useCreate',
                  },
                  {
                    text: 'useData 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useData',
                  },
                  {
                    text: 'useIsAuthorized 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useIsAuthorized',
                  },
                  {
                    text: 'useModifyBlacklist 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useModifyBlacklist',
                  },
                  {
                    text: 'useModifyWhitelist 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useModifyWhitelist',
                  },
                  {
                    text: 'useSetAdmin 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useSetAdmin',
                  },
                  {
                    text: 'useWatchAdminUpdated 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useWatchAdminUpdated',
                  },
                  {
                    text: 'useWatchBlacklistUpdated 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useWatchBlacklistUpdated',
                  },
                  {
                    text: 'useWatchCreate 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useWatchCreate',
                  },
                  {
                    text: 'useWatchWhitelistUpdated 🚧',
                    link: '/sdk/typescript/wagmi/hooks/policy.useWatchWhitelistUpdated',
                  },
                ],
              },
              {
                text: 'Stablecoin Exchange',
                items: [
                  {
                    text: 'useBalance 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useBalance',
                  },
                  {
                    text: 'useBuy 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useBuy',
                  },
                  {
                    text: 'useBuyQuote 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useBuyQuote',
                  },
                  {
                    text: 'useCancel 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useCancel',
                  },
                  {
                    text: 'useCreatePair 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useCreatePair',
                  },
                  {
                    text: 'useOrder 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useOrder',
                  },
                  {
                    text: 'usePlace 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.usePlace',
                  },
                  {
                    text: 'usePlaceFlip 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.usePlaceFlip',
                  },
                  {
                    text: 'usePriceLevel 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.usePriceLevel',
                  },
                  {
                    text: 'useSell 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useSell',
                  },
                  {
                    text: 'useSellQuote 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useSellQuote',
                  },
                  {
                    text: 'useWatchFlipOrderPlaced 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchFlipOrderPlaced',
                  },
                  {
                    text: 'useWatchOrderCancelled 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchOrderCancelled',
                  },
                  {
                    text: 'useWatchOrderFilled 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchOrderFilled',
                  },
                  {
                    text: 'useWatchOrderPlaced 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchOrderPlaced',
                  },
                  {
                    text: 'useWithdraw 🚧',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWithdraw',
                  },
                ],
              },
              {
                text: 'Token',
                items: [
                  {
                    text: 'useAllowance 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useAllowance',
                  },
                  {
                    text: 'useApprove 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useApprove',
                  },
                  {
                    text: 'useBalance 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useBalance',
                  },
                  {
                    text: 'useBurn 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useBurn',
                  },
                  {
                    text: 'useBurnBlocked 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useBurnBlocked',
                  },
                  {
                    text: 'useChangeTransferPolicy 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useChangeTransferPolicy',
                  },
                  {
                    text: 'useCreate 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useCreate',
                  },
                  {
                    text: 'useGrantRoles 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useGrantRoles',
                  },
                  {
                    text: 'useHasRole 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useHasRole',
                  },
                  {
                    text: 'useMetadata 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useMetadata',
                  },
                  {
                    text: 'useMint 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useMint',
                  },
                  {
                    text: 'usePause 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.usePause',
                  },
                  {
                    text: 'usePermit 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.usePermit',
                  },
                  {
                    text: 'useRenounceRoles 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useRenounceRoles',
                  },
                  {
                    text: 'useRevokeRoles 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useRevokeRoles',
                  },
                  {
                    text: 'useSetRoleAdmin 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useSetRoleAdmin',
                  },
                  {
                    text: 'useSetSupplyCap 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useSetSupplyCap',
                  },
                  {
                    text: 'useTransfer 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useTransfer',
                  },
                  {
                    text: 'useUnpause 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useUnpause',
                  },
                  {
                    text: 'useWatchAdminRole 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchAdminRole',
                  },
                  {
                    text: 'useWatchApprove 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchApprove',
                  },
                  {
                    text: 'useWatchBurn 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchBurn',
                  },
                  {
                    text: 'useWatchCreate 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchCreate',
                  },
                  {
                    text: 'useWatchMint 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchMint',
                  },
                  {
                    text: 'useWatchRole 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchRole',
                  },
                  {
                    text: 'useWatchTransfer 🚧',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchTransfer',
                  },
                ],
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
