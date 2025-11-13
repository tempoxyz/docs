import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Instance } from 'tempo.ts/prool'
import { ModuleResolutionKind } from 'typescript'
import autoImport from 'unplugin-auto-import/vite'
import iconsResolver from 'unplugin-icons/resolver'
import icons from 'unplugin-icons/vite'
import { defineConfig } from 'vocs'

const twoslashSupportFile = readFileSync(
  join(process.cwd(), 'snippets', 'twoslash-env.d.ts'),
  'utf-8',
)

export default defineConfig({
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
    '/get-started': [
      {
        text: 'Introduction',
        items: [
          {
            text: 'Welcome',
            link: '/get-started',
          },
          {
            text: 'Features',
            collapsed: true,
            items: [
              {
                text: 'Payment Features',
                link: '/get-started/features/payment-features',
              },
              {
                text: 'Stablecoin Liquidity',
                link: '/get-started/features/stablecoin-liquidity',
              },
              {
                text: 'Account Features',
                link: '/get-started/features/wallet-features',
              },
              {
                text: 'Performance',
                link: '/get-started/features/performance',
              },
              {
                text: 'Validator Network',
                link: '/get-started/features/validator-network',
              },
            ],
          },
        ],
      },
      {
        text: 'Quickstart',
        items: [
          {
            text: 'Connect to Tempo',
            link: '/get-started/quickstart/connect-to-tempo',
          },
          {
            text: 'Integrate an SDK',
            link: '/get-started/quickstart/integrate-an-sdk',
          },
          {
            text: 'Testnet Faucet',
            link: '/get-started/quickstart/faucet',
          },
          {
            text: 'Predeployed Contracts',
            link: '/get-started/quickstart/predeployed-contracts',
          },
          {
            text: 'EVM Compatibility',
            link: '/get-started/quickstart/evm-compatibility',
          },
        ],
      },
      {
        text: 'Guides',
        items: [
          {
            text: 'Overview',
            link: '/get-started/guides',
          },
          {
            text: 'Create a Passkey Account',
            link: '/get-started/guides/create-a-passkey-account',
          },
          {
            text: 'Send a Payment 🚧',
            disabled: true,
            link: '/get-started/guides/send-a-payment',
          },
          {
            text: 'Deploy a Contract',
            link: '/get-started/guides/deploy-a-contract',
          },
          {
            text: 'Issue a Stablecoin 🚧',
            disabled: true,
            link: '/get-started/guides/issue-a-stablecoin',
          },
          {
            text: 'Exchange Stablecoins 🚧',
            disabled: true,
            link: '/get-started/guides/exchange-stablecoins',
          },
          {
            text: 'Sponsor a Transaction 🚧',
            disabled: true,
            link: '/get-started/guides/sponsor-a-transaction',
          },
        ],
      },
      {
        text: 'Tempo Node',
        items: [
          {
            text: 'Overview',
            link: '/get-started/node',
          },
          {
            text: 'Installation',
            link: '/get-started/node/installation',
          },
          {
            text: 'Running the Node',
            link: '/get-started/node/usage',
          },
          {
            text: 'System Requirements',
            link: '/get-started/node/system-requirements',
          },
        ],
      },
      {
        text: 'Infrastructure & Tooling',
        items: [
          {
            text: 'Overview',
            link: '/get-started/infrastructure',
          },
          {
            text: 'Data Indexers',
            link: '/get-started/infrastructure/data-indexers',
          },
          {
            text: 'Developer Tools',
            link: '/get-started/infrastructure/developer-tools',
          },
          {
            text: 'Node Providers',
            link: '/get-started/infrastructure/node-providers',
          },
        ],
      },
    ],
    '/documentation': [
      {
        text: 'Overview',
        link: '/documentation',
      },
      {
        text: 'Fees',
        items: [
          {
            text: 'Overview',
            link: '/documentation/fees',
          },
          {
            text: 'Preferences Cascade',
            link: '/documentation/fees/preferences',
          },
          {
            text: 'Fee AMM Liquidity',
            link: '/documentation/fees/managing-liquidity',
          },
          {
            text: 'Fee Lifecycle',
            link: '/documentation/fees/fee-lifecycle',
          },
        ],
      },
      {
        text: 'Transactions',
        items: [
          {
            text: 'Overview',
            link: '/documentation/transactions',
          },
          {
            text: 'Transaction Fee Tokens',
            link: '/documentation/transactions/transaction-fee-tokens',
          },
          {
            text: 'Batch Transactions',
            link: '/documentation/transactions/batch-transactions',
          },
          {
            text: 'Fee Sponsorship',
            link: '/documentation/transactions/fee-sponsorship',
          },
          {
            text: 'Scheduled Transactions',
            link: '/documentation/transactions/scheduled-transactions',
          },
          {
            text: 'WebAuthn/P256 Signatures',
            link: '/documentation/transactions/webauthn-p256-signatures',
          },
        ],
      },
      {
        text: 'TIP-20 Tokens',
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
            text: 'Roles & Permissions',
            link: '/documentation/tokens/roles',
          },
          {
            text: 'Reconciliation (Memos)',
            link: '/documentation/tokens/reconciliation',
          },
          {
            text: 'Controlling Supply',
            link: '/documentation/tokens/controlling-supply',
          },
          {
            text: 'Transfer Policies',
            link: '/documentation/tokens/transfer-policies',
          },
          {
            text: 'Streaming Rewards',
            link: '/documentation/tokens/rewards',
          },
        ],
      },
      {
        text: 'Stablecoin Exchange',
        items: [
          {
            text: 'Overview',
            link: '/documentation/exchange',
          },
          {
            text: 'linkingUSD',
            link: '/documentation/exchange/linkingUSD',
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
        text: 'Accounts',
        items: [
          {
            text: 'Overview',
            link: '/documentation/accounts',
          },
        ],
      },
      {
        text: 'Consensus',
        items: [
          {
            text: 'Overview',
            link: '/documentation/consensus',
          },
        ],
      },
      {
        text: 'Blockspace',
        items: [
          {
            text: 'Payment Lanes',
            link: '/documentation/blockspace/payment-lanes',
          },
          {
            text: 'Sub-Blocks',
            link: '/documentation/blockspace/sub-blocks',
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
        text: 'Precompile Contract Addresses',
        link: '/protocol/overview/contract-addresses',
      },
      {
        text: 'Transactions',
        items: [
          {
            text: 'AATransaction (Type 0x76)',
            link: '/protocol/transactions/aa-transaction',
          },
        ],
      },
      {
        text: 'Fees',
        items: [
          {
            text: 'Fees',
            link: '/protocol/fees/fees',
          },
          {
            text: 'Fee AMM',
            link: '/protocol/fees/fee-amm',
          },
        ],
      },
      {
        text: 'Token Standards',
        items: [
          {
            text: 'TIP-20',
            link: '/protocol/tokens/tip-20',
          },
          {
            text: 'TIP-403',
            link: '/protocol/tokens/tip-403',
          },
          {
            text: 'Reward Distribution',
            link: '/protocol/tokens/reward-distribution',
          },
        ],
      },
      {
        text: 'Stablecoin Exchange',
        items: [
          {
            text: 'Stablecoin Exchange',
            link: '/protocol/stablecoin-exchange/stablecoin-exchange',
          },
          {
            text: 'LinkingUSD',
            link: '/protocol/stablecoin-exchange/linking-usd',
          },
        ],
      },
      {
        text: 'Block Organization ',
        items: [
          {
            text: 'Block Format',
            link: '/protocol/consensus-blockspace/block-format',
          },
          {
            text: 'Payment Lanes',
            link: '/protocol/consensus-blockspace/payment-lanes',
          },
          {
            text: 'Sub-blocks',
            link: '/protocol/consensus-blockspace/subblocks',
          },
        ],
      },
      {
        text: 'Deprecated',
        items: [
          {
            text: 'FeeTokenTransaction (Type 0x77)',
            link: '/protocol/transactions/fee-token-transaction',
          },
          {
            text: 'Default Account Abstraction',
            link: '/protocol/default-accounts',
          },
        ],
      },
      {
        text: 'Reference Implementations',
        items: [
          {
            text: 'FeeManager',
            link: 'https://github.com/tempoxyz/docs/blob/main/specs/src/FeeManager.sol',
          },
          {
            text: 'FeeAMM',
            link: 'https://github.com/tempoxyz/docs/blob/main/specs/src/FeeAMM.sol',
          },
          {
            text: 'StablecoinExchange',
            link: 'https://github.com/tempoxyz/docs/blob/main/specs/src/StablecoinExchange.sol',
          },
          {
            text: 'TIP20',
            link: 'https://github.com/tempoxyz/docs/blob/main/specs/src/TIP20.sol',
          },
          {
            text: 'TIP20RewardRegistry',
            link: 'https://github.com/tempoxyz/docs/blob/main/specs/src/TIP20RewardRegistry.sol',
          },
          {
            text: 'TIP403Registry',
            link: 'https://github.com/tempoxyz/docs/blob/main/specs/src/TIP403Registry.sol',
          },
          {
            text: 'LinkingUSD',
            link: 'https://github.com/tempoxyz/docs/blob/main/specs/src/LinkingUSD.sol',
          },
        ],
      },
      {
        text: 'ABI References',
        link: '/protocol/abi-references',
      },
    ],
    '/sdk/solidity': [
      {
        text: 'Getting Started',
        items: [
          {
            text: 'Introduction',
            link: '/sdk/solidity',
          },
          {
            text: 'Configure your project',
            link: '/sdk/solidity/configure',
          },
          {
            text: 'Build, test, and deploy contracts',
            link: '/sdk/solidity/run',
          },
        ],
      },
    ],
    '/sdk/rust': [
      {
        text: 'Getting Started',
        items: [
          {
            text: 'Introduction',
            link: '/sdk/rust',
          },
          {
            text: 'Install',
            link: '/sdk/rust/install',
          },
          {
            text: 'Configure a provider',
            link: '/sdk/rust/configure',
          },
          {
            text: 'Perform actions',
            link: '/sdk/rust/perform-actions',
          },
        ],
      },
      {
        text: 'More documentation',
        link: 'https://alloy.rs/',
      },
    ],
    '/sdk/typescript': [
      {
        text: 'Getting Started',
        link: '/sdk/typescript',
      },
      {
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
                    link: '/sdk/typescript/viem/reward.cancel',
                  },
                  {
                    text: 'getStream',
                    link: '/sdk/typescript/viem/reward.getStream',
                  },
                  {
                    text: 'getTotalPerSecond',
                    link: '/sdk/typescript/viem/reward.getTotalPerSecond',
                  },
                  {
                    text: 'setRecipient',
                    link: '/sdk/typescript/viem/reward.setRecipient',
                  },
                  {
                    text: 'start',
                    link: '/sdk/typescript/viem/reward.start',
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
                    text: 'getTickLevel',
                    link: '/sdk/typescript/viem/dex.getTickLevel',
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
            text: 'Actions',
            collapsed: true,
            items: [
              {
                text: 'AMM',
                items: [
                  {
                    text: 'burn',
                    link: '/sdk/typescript/wagmi/actions/amm.burn',
                  },
                  {
                    text: 'getLiquidityBalance',
                    link: '/sdk/typescript/wagmi/actions/amm.getLiquidityBalance',
                  },
                  {
                    text: 'getPool',
                    link: '/sdk/typescript/wagmi/actions/amm.getPool',
                  },
                  {
                    text: 'mint',
                    link: '/sdk/typescript/wagmi/actions/amm.mint',
                  },
                  {
                    text: 'rebalanceSwap',
                    link: '/sdk/typescript/wagmi/actions/amm.rebalanceSwap',
                  },
                  {
                    text: 'watchBurn',
                    link: '/sdk/typescript/wagmi/actions/amm.watchBurn',
                  },
                  {
                    text: 'watchFeeSwap',
                    link: '/sdk/typescript/wagmi/actions/amm.watchFeeSwap',
                  },
                  {
                    text: 'watchMint',
                    link: '/sdk/typescript/wagmi/actions/amm.watchMint',
                  },
                  {
                    text: 'watchRebalanceSwap',
                    link: '/sdk/typescript/wagmi/actions/amm.watchRebalanceSwap',
                  },
                ],
              },
              {
                text: 'Fee',
                items: [
                  {
                    text: 'getUserToken',
                    link: '/sdk/typescript/wagmi/actions/fee.getUserToken',
                  },
                  {
                    text: 'setUserToken',
                    link: '/sdk/typescript/wagmi/actions/fee.setUserToken',
                  },
                  {
                    text: 'watchSetUserToken',
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
                    text: 'buy',
                    link: '/sdk/typescript/wagmi/actions/dex.buy',
                  },
                  {
                    text: 'cancel',
                    link: '/sdk/typescript/wagmi/actions/dex.cancel',
                  },
                  {
                    text: 'createPair',
                    link: '/sdk/typescript/wagmi/actions/dex.createPair',
                  },
                  {
                    text: 'getBalance',
                    link: '/sdk/typescript/wagmi/actions/dex.getBalance',
                  },
                  {
                    text: 'getBuyQuote',
                    link: '/sdk/typescript/wagmi/actions/dex.getBuyQuote',
                  },
                  {
                    text: 'getOrder',
                    link: '/sdk/typescript/wagmi/actions/dex.getOrder',
                  },
                  {
                    text: 'getTickLevel',
                    link: '/sdk/typescript/wagmi/actions/dex.getTickLevel',
                  },
                  {
                    text: 'getSellQuote',
                    link: '/sdk/typescript/wagmi/actions/dex.getSellQuote',
                  },
                  {
                    text: 'place',
                    link: '/sdk/typescript/wagmi/actions/dex.place',
                  },
                  {
                    text: 'placeFlip',
                    link: '/sdk/typescript/wagmi/actions/dex.placeFlip',
                  },
                  {
                    text: 'sell',
                    link: '/sdk/typescript/wagmi/actions/dex.sell',
                  },
                  {
                    text: 'watchFlipOrderPlaced',
                    link: '/sdk/typescript/wagmi/actions/dex.watchFlipOrderPlaced',
                  },
                  {
                    text: 'watchOrderCancelled',
                    link: '/sdk/typescript/wagmi/actions/dex.watchOrderCancelled',
                  },
                  {
                    text: 'watchOrderFilled',
                    link: '/sdk/typescript/wagmi/actions/dex.watchOrderFilled',
                  },
                  {
                    text: 'watchOrderPlaced',
                    link: '/sdk/typescript/wagmi/actions/dex.watchOrderPlaced',
                  },
                  {
                    text: 'withdraw',
                    link: '/sdk/typescript/wagmi/actions/dex.withdraw',
                  },
                ],
              },
              {
                text: 'Token',
                items: [
                  {
                    text: 'approve',
                    link: '/sdk/typescript/wagmi/actions/token.approve',
                  },
                  {
                    text: 'burn',
                    link: '/sdk/typescript/wagmi/actions/token.burn',
                  },
                  {
                    text: 'burnBlocked',
                    link: '/sdk/typescript/wagmi/actions/token.burnBlocked',
                  },
                  {
                    text: 'changeTransferPolicy',
                    link: '/sdk/typescript/wagmi/actions/token.changeTransferPolicy',
                  },
                  {
                    text: 'create',
                    link: '/sdk/typescript/wagmi/actions/token.create',
                  },
                  {
                    text: 'getAllowance',
                    link: '/sdk/typescript/wagmi/actions/token.getAllowance',
                  },
                  {
                    text: 'getBalance',
                    link: '/sdk/typescript/wagmi/actions/token.getBalance',
                  },
                  {
                    text: 'getMetadata',
                    link: '/sdk/typescript/wagmi/actions/token.getMetadata',
                  },
                  {
                    text: 'grantRoles',
                    link: '/sdk/typescript/wagmi/actions/token.grantRoles',
                  },
                  {
                    text: 'hasRole',
                    link: '/sdk/typescript/wagmi/actions/token.hasRole',
                  },
                  {
                    text: 'mint',
                    link: '/sdk/typescript/wagmi/actions/token.mint',
                  },
                  {
                    text: 'pause',
                    link: '/sdk/typescript/wagmi/actions/token.pause',
                  },
                  {
                    text: 'renounceRoles',
                    link: '/sdk/typescript/wagmi/actions/token.renounceRoles',
                  },
                  {
                    text: 'revokeRoles',
                    link: '/sdk/typescript/wagmi/actions/token.revokeRoles',
                  },
                  {
                    text: 'setRoleAdmin',
                    link: '/sdk/typescript/wagmi/actions/token.setRoleAdmin',
                  },
                  {
                    text: 'setSupplyCap',
                    link: '/sdk/typescript/wagmi/actions/token.setSupplyCap',
                  },
                  {
                    text: 'transfer',
                    link: '/sdk/typescript/wagmi/actions/token.transfer',
                  },
                  {
                    text: 'unpause',
                    link: '/sdk/typescript/wagmi/actions/token.unpause',
                  },
                  {
                    text: 'watchAdminRole',
                    link: '/sdk/typescript/wagmi/actions/token.watchAdminRole',
                  },
                  {
                    text: 'watchApprove',
                    link: '/sdk/typescript/wagmi/actions/token.watchApprove',
                  },
                  {
                    text: 'watchBurn',
                    link: '/sdk/typescript/wagmi/actions/token.watchBurn',
                  },
                  {
                    text: 'watchCreate',
                    link: '/sdk/typescript/wagmi/actions/token.watchCreate',
                  },
                  {
                    text: 'watchMint',
                    link: '/sdk/typescript/wagmi/actions/token.watchMint',
                  },
                  {
                    text: 'watchRole',
                    link: '/sdk/typescript/wagmi/actions/token.watchRole',
                  },
                  {
                    text: 'watchTransfer',
                    link: '/sdk/typescript/wagmi/actions/token.watchTransfer',
                  },
                ],
              },
            ],
          },
          {
            text: 'Hooks',
            collapsed: true,
            items: [
              {
                text: 'AMM',
                items: [
                  {
                    text: 'useBurn',
                    link: '/sdk/typescript/wagmi/hooks/amm.useBurn',
                  },
                  {
                    text: 'useLiquidityBalance',
                    link: '/sdk/typescript/wagmi/hooks/amm.useLiquidityBalance',
                  },
                  {
                    text: 'useMint',
                    link: '/sdk/typescript/wagmi/hooks/amm.useMint',
                  },
                  {
                    text: 'usePool',
                    link: '/sdk/typescript/wagmi/hooks/amm.usePool',
                  },
                  {
                    text: 'useRebalanceSwap',
                    link: '/sdk/typescript/wagmi/hooks/amm.useRebalanceSwap',
                  },
                  {
                    text: 'useWatchBurn',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchBurn',
                  },
                  {
                    text: 'useWatchFeeSwap',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchFeeSwap',
                  },
                  {
                    text: 'useWatchMint',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchMint',
                  },
                  {
                    text: 'useWatchRebalanceSwap',
                    link: '/sdk/typescript/wagmi/hooks/amm.useWatchRebalanceSwap',
                  },
                ],
              },
              {
                text: 'Fee',
                items: [
                  {
                    text: 'useSetUserToken',
                    link: '/sdk/typescript/wagmi/hooks/fee.useSetUserToken',
                  },
                  {
                    text: 'useUserToken',
                    link: '/sdk/typescript/wagmi/hooks/fee.useUserToken',
                  },
                  {
                    text: 'useWatchSetUserToken',
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
                    text: 'useBalance',
                    link: '/sdk/typescript/wagmi/hooks/dex.useBalance',
                  },
                  {
                    text: 'useBuy',
                    link: '/sdk/typescript/wagmi/hooks/dex.useBuy',
                  },
                  {
                    text: 'useBuyQuote',
                    link: '/sdk/typescript/wagmi/hooks/dex.useBuyQuote',
                  },
                  {
                    text: 'useCancel',
                    link: '/sdk/typescript/wagmi/hooks/dex.useCancel',
                  },
                  {
                    text: 'useCreatePair',
                    link: '/sdk/typescript/wagmi/hooks/dex.useCreatePair',
                  },
                  {
                    text: 'useOrder',
                    link: '/sdk/typescript/wagmi/hooks/dex.useOrder',
                  },
                  {
                    text: 'usePlace',
                    link: '/sdk/typescript/wagmi/hooks/dex.usePlace',
                  },
                  {
                    text: 'usePlaceFlip',
                    link: '/sdk/typescript/wagmi/hooks/dex.usePlaceFlip',
                  },
                  {
                    text: 'useTickLevel',
                    link: '/sdk/typescript/wagmi/hooks/dex.useTickLevel',
                  },
                  {
                    text: 'useSell',
                    link: '/sdk/typescript/wagmi/hooks/dex.useSell',
                  },
                  {
                    text: 'useSellQuote',
                    link: '/sdk/typescript/wagmi/hooks/dex.useSellQuote',
                  },
                  {
                    text: 'useWatchFlipOrderPlaced',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchFlipOrderPlaced',
                  },
                  {
                    text: 'useWatchOrderCancelled',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchOrderCancelled',
                  },
                  {
                    text: 'useWatchOrderFilled',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchOrderFilled',
                  },
                  {
                    text: 'useWatchOrderPlaced',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWatchOrderPlaced',
                  },
                  {
                    text: 'useWithdraw',
                    link: '/sdk/typescript/wagmi/hooks/dex.useWithdraw',
                  },
                ],
              },
              {
                text: 'Token',
                items: [
                  {
                    text: 'useGetAllowance',
                    link: '/sdk/typescript/wagmi/hooks/token.useGetAllowance',
                  },
                  {
                    text: 'useApprove',
                    link: '/sdk/typescript/wagmi/hooks/token.useApprove',
                  },
                  {
                    text: 'useGetBalance',
                    link: '/sdk/typescript/wagmi/hooks/token.useGetBalance',
                  },
                  {
                    text: 'useBurn',
                    link: '/sdk/typescript/wagmi/hooks/token.useBurn',
                  },
                  {
                    text: 'useBurnBlocked',
                    link: '/sdk/typescript/wagmi/hooks/token.useBurnBlocked',
                  },
                  {
                    text: 'useChangeTransferPolicy',
                    link: '/sdk/typescript/wagmi/hooks/token.useChangeTransferPolicy',
                  },
                  {
                    text: 'useCreate',
                    link: '/sdk/typescript/wagmi/hooks/token.useCreate',
                  },
                  {
                    text: 'useGrantRoles',
                    link: '/sdk/typescript/wagmi/hooks/token.useGrantRoles',
                  },
                  {
                    text: 'useHasRole',
                    link: '/sdk/typescript/wagmi/hooks/token.useHasRole',
                  },
                  {
                    text: 'useGetMetadata',
                    link: '/sdk/typescript/wagmi/hooks/token.useGetMetadata',
                  },
                  {
                    text: 'useMint',
                    link: '/sdk/typescript/wagmi/hooks/token.useMint',
                  },
                  {
                    text: 'usePause',
                    link: '/sdk/typescript/wagmi/hooks/token.usePause',
                  },
                  {
                    text: 'useRenounceRoles',
                    link: '/sdk/typescript/wagmi/hooks/token.useRenounceRoles',
                  },
                  {
                    text: 'useRevokeRoles',
                    link: '/sdk/typescript/wagmi/hooks/token.useRevokeRoles',
                  },
                  {
                    text: 'useSetRoleAdmin',
                    link: '/sdk/typescript/wagmi/hooks/token.useSetRoleAdmin',
                  },
                  {
                    text: 'useSetSupplyCap',
                    link: '/sdk/typescript/wagmi/hooks/token.useSetSupplyCap',
                  },
                  {
                    text: 'useTransfer',
                    link: '/sdk/typescript/wagmi/hooks/token.useTransfer',
                  },
                  {
                    text: 'useUnpause',
                    link: '/sdk/typescript/wagmi/hooks/token.useUnpause',
                  },
                  {
                    text: 'useWatchAdminRole',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchAdminRole',
                  },
                  {
                    text: 'useWatchApprove',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchApprove',
                  },
                  {
                    text: 'useWatchBurn',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchBurn',
                  },
                  {
                    text: 'useWatchCreate',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchCreate',
                  },
                  {
                    text: 'useWatchMint',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchMint',
                  },
                  {
                    text: 'useWatchRole',
                    link: '/sdk/typescript/wagmi/hooks/token.useWatchRole',
                  },
                  {
                    text: 'useWatchTransfer',
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
    { text: 'Get Started', link: '/get-started' },
    { text: 'Documentation', link: '/documentation' },
    {
      text: 'SDKs',
      items: [
        { text: 'TypeScript', link: '/sdk/typescript' },
        { text: 'Rust', link: '/sdk/rust' },
        { text: 'Solidity', link: '/sdk/solidity' },
      ],
    },
    {
      text: 'Protocol Specs',
      link: '/protocol/overview/intro',
    },
  ],
  twoslash: {
    compilerOptions: {
      moduleResolution: ModuleResolutionKind.Bundler,
    },
    extraFiles: {
      'twoslash-env.d.ts': twoslashSupportFile,
    },
  },
  vite: {
    plugins: [
      {
        name: 'tempo-node',
        async configureServer(_server) {
          if (
            !('VITE_LOCAL' in process.env) ||
            process.env['VITE_LOCAL'] === 'false'
          )
            return
          const instance = Instance.tempo({
            dev: { blockTime: '500ms' },
            port: 8545,
          })
          console.log('→ starting tempo node...')
          await instance.start()
          console.log('√ tempo node started on port 8545')
        },
      },
      icons({ compiler: 'jsx', jsx: 'react' }),
      autoImport({
        dts: './auto-imports.d.ts',
        dirs: ['components'],
        resolvers: [
          iconsResolver({
            enabledCollections: [
              // https://icones.js.org/collection/lucide
              'lucide',
            ],
            extension: 'jsx',
            prefix: false,
          }),
        ],
      }),
    ],
  },
})
