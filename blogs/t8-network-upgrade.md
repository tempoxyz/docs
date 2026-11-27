---
title: "T8 network upgrade: Committee state, compact orders, and fee policy updates"
excerpt: "T8 exposes the current validator committee, reduces DEX order storage, updates FeeAMM policy checks, and completes the TIP-20 rewards shutdown."
date: 2026-07-30
category: network-upgrades
---

*The T8 network upgrade gives contracts and monitoring tools a direct view of the active validator committee and reduces storage for new Stablecoin DEX orders. It also updates fee policy checks and completes the TIP-20 rewards shutdown. Read the [T8 upgrade docs](/docs/protocol/upgrades/t8) for integration details.*

T8 focuses on infrastructure used by validators, token issuers, liquidity providers, and indexers. Its changes distinguish configured validators from the committee actually running consensus, preserve public DEX interfaces while compacting storage, and clarify which policy checks apply during fee collection.

## Read the committee running consensus

The configured validator registry and the effective consensus committee can differ. A registry change may not yet have taken effect, and a failed distributed key generation round can leave the previous committee in place.

T8 adds execution-layer state for the current effective committee. Contracts and offchain tools can use `getCommitteeMembers()` to read that membership without reconstructing it from consensus data. `ValidatorConfigV2.getActiveValidators()` continues to return the configured registry.

For monitoring and integrations that depend on current membership, use the committee query. At activation, the new state becomes useful after the first epoch-boundary committee update. The [current committee state specification](https://tips.sh/1070) describes the update rules.

## Keep fee collection and liquidity policy checks distinct

During protocol fee collection, T8 removes the recipient policy check on the FeeManager address. The fee payer must still be an authorized sender.

Public FeeAMM operations remain subject to token policies. `mint`, `burn`, `rebalanceSwap`, and `distributeFees` continue to enforce the relevant checks, with additional checks on `mint` and `burn` tying authorization to the liquidity provider throughout a position's lifecycle.

Issuers still control participation in FeeAMM liquidity by authorizing the FeeManager where required. Issuer and validator tooling should surface missing authorization because it can leave fees or liquidity flows unavailable or stranded. See the [FeeAMM policy specification](https://tips.sh/1042).

## Store new DEX orders in fewer slots

T8 introduces versioned order storage for the Stablecoin DEX. Version-1 records reduce active order storage from six slots to four. The compact V2Order layout stores an orderbook index instead of the full book key, reducing indexed order records from four slots to three.

Existing orders remain readable in their legacy layout. The public `getOrder(uint128)` interface stays compatible, and event-driven indexers should not need a storage-layout change. Tools that read raw storage must decode each order according to its version, including mixed-version order lists.

Existing orderbooks are not automatically migrated to indexed storage. They continue writing version-1 orders until migration tooling supplies the verified index through `setBookIndex(uint32)`. Read the [versioned order storage specification](https://tips.sh/1062) and [T8 DEX integration notes](/docs/protocol/upgrades/t8#for-dex-frontends-and-indexers).

## Complete the TIP-20 rewards shutdown

T8 completes the rewards shutdown that began in T7. Transfers, mints, burns, fee refunds, and other ordinary balance changes stop checkpointing reward accumulators.

Rewards settled before T8 remain claimable. Lazy rewards that were not checkpointed before activation are forfeited: a later transfer or balance change cannot settle them. Rewards integrations should reflect that distinction when showing claimable balances. See the [rewards deprecation specification](https://tips.sh/1075).

## Rollout and integration guidance

T8 activated on testnet on July 27, 2026, and mainnet on July 30, 2026. [Tempo v1.11.0](https://github.com/tempoxyz/tempo/releases/tag/v1.11.0) introduced support for the upgrade.

Use the [T8 upgrade docs](/docs/protocol/upgrades/t8) to review the changes relevant to your integration. Node operators should consult the [Network Upgrades and Releases table](/docs/guide/node/network-upgrades#node-operator-updates) for current release guidance.
