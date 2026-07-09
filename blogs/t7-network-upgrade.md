---
title: "T7 network upgrade: Lower fees, storage credits, and more"
excerpt: "The T7 network upgrade lowers fees on Tempo with capped dynamic fees and new storage credits that make repeated onchain workflows cheaper."
date: 2026-07-09
category: network-upgrades
---

**The T7 network upgrade lowers fees on Tempo. T7 introduces capped dynamic fees: the base fee cap is 40% below today's fixed fee and can fall a further 20x during off-peak periods. New storage credits make repeated onchain workflows cheaper, from user contracts to StablecoinDEX orders and MPP payment channels.** [Read the T7 docs to start integrating →](/docs/protocol/upgrades/t7)

## Dynamic base fee

T7 replaces Tempo's fixed base fee with a bounded dynamic base fee. The new cap is 40% lower than the current fixed fee, and when block gas usage is below target, the fee can fall toward a floor set at one twentieth of the cap. The fee never exceeds the cap, so integrators keep a hard ceiling on per-transaction costs while gaining the upside of cheaper quiet periods.

![A diagram comparing today's fixed fee, the T7 cap, and the T7 floor for a 50,000 gas TIP-20 transfer.](/blog/t7-dynamic-base-fee-range.svg)

*T7 keeps a hard cap on the base fee while allowing lower fees during off-peak periods.*

As an example, the typical gas for a TIP-20 token transfer between two existing users (~50,000 gas) now costs about $0.0006 at the new cap and about $0.00003 at the quiet-period floor, compared to $0.001 today. At the floor, that transfer is therefore about 33x cheaper than today's fixed fee.

![A diagram showing the base fee falling when block usage is below target and rising back toward the cap as usage increases.](/blog/t7-dynamic-base-fee-response.svg)

*The cap and floor are fixed bounds. The live base fee moves inside that range as block usage changes.*

The base fee starts at the cap at activation and moves with block usage. For wallets, checkout flows, and infrastructure that display fees, this means expecting the base fee to move rather than stay fixed, and comparing pre-T7 fixed-fee periods separately from post-T7 dynamic-fee periods in fee analytics.

Read the specification for [dynamic base fees](https://tips.sh/1067).

## Storage credits

Many payment and liquidity workflows follow the same lifecycle: create state, clear it, then create more state in the same transaction. Order placement and cancellation on DEXes follow this pattern, as do MPP channel opens and closes and escrow creation and release. Before T7, each creation paid the full storage-creation cost, so, for example, in the flow above, the contract would be charged for two state creations even though it created only one net piece of state.

Storage credits change that. When a contract clears eligible storage, it earns a credit, and when it later creates eligible storage, the credit offsets roughly 98% of the cost.

The savings are targeted rather than a blanket gas discount: they apply where a workflow repeatedly creates and clears temporary state. For apps with repeat contract workflows, this means meaningful gas savings can be passed to returning users.

Read the specification for [storage credits](https://tips.sh/1060).

## Per-user credits for DEX orders and payment channels

Shared contracts introduce an attribution problem. If a contract earns credits from many users' activity, the next storage write spends those credits regardless of who earned them, and the savings land on the wrong users. T7 solves this with per-user accounting in the two places where the lifecycle pattern shows up most: credits stay with the user who earned them.

On the StablecoinDEX, credits are tracked per maker. When a maker cancels or fully fills an eligible order, the savings stay attached to that maker and apply the next time they place an eligible order. Active makers pay less on repeat order placement, and no one can spend savings another maker earned.

On MPP payment channels, credits are tracked per payer through the TIP20ChannelReserve precompile. When a payer closes or withdraws a finished channel, the reserve records a credit for that payer and applies it when the same payer opens their next channel. Per-request vouchers already stay off-chain, so per-payment costs do not change. The savings apply to the channel lifecycle itself, which means repeated pay-as-you-go sessions from the same payer cost less to run.

The same pattern is available to any shared contract: track which user earned credits and spend them only for that user. If you build shared systems with temporary state, the main integration decision is whether to allocate credits per user, payer, maker, or account rather than pooling them globally.

Read the specifications:

- [StablecoinDEX Order Storage Credits](https://tips.sh/1064)
- [TIP-20 Channel Storage Credits](https://tips.sh/1066)

For the MPP session flow, see [Accept pay-as-you-go payments](/docs/guide/machine-payments/pay-as-you-go) in the docs.

## What integrators should know

T7 went live on testnet on July 2 and rolls out to mainnet on July 9. Node operators should run the [v1.10.1 release](https://github.com/tempoxyz/tempo/releases/tag/v1.10.1) to stay in sync with mainnet. The full set of changes and gas benchmarks are in the release notes, and the current node-operator release status is in the [Network Upgrades and Releases table](/docs/guide/node/network-upgrades#node-operator-updates).

For contract developers, the main opportunity is to identify workflows with temporary state and decide how storage-credit savings should be allocated: per user, payer, maker, or account. Avoid global credit pools in shared contracts when savings should stay attached to the party who earned them.

See the [v1.10.1 release](https://github.com/tempoxyz/tempo/releases/tag/v1.10.1) and the [T7 upgrade docs](/docs/protocol/upgrades/t7).

## Resources

- [T7 upgrade docs](/docs/protocol/upgrades/t7)
- [Dynamic base fee](https://tips.sh/1067)
- [Storage credits](https://tips.sh/1060)
- [StablecoinDEX order storage credits](https://tips.sh/1064)
- [TIP-20 channel storage credits](https://tips.sh/1066)
- [Accept pay-as-you-go payments](/docs/guide/machine-payments/pay-as-you-go)
- [v1.10.1 release](https://github.com/tempoxyz/tempo/releases/tag/v1.10.1)
- [Tempo on GitHub](https://github.com/tempoxyz)
- [All TIPs](/docs/protocol/tips)
