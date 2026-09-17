---
title: "T9 network upgrade: Provable token policy bindings for zones"
excerpt: "T9 records TIP-20 token policy bindings in TIP-403 so zones and provable contract flows can verify which issuer policy applies to a token."
date: 2026-08-06
category: network-upgrades
---

*The T9 network upgrade records a TIP-20 token's transfer policy ID in the TIP-403 registry. This gives Tempo Zones and provable contract flows a registry-backed way to verify which issuer policy applies. Read the [T9 upgrade docs](/docs/protocol/upgrades/t9) for integration and migration details.*

[Tempo Zones](/docs/protocol/zones) keep balances, transfers, and account relationships private, while tokens still need to follow their issuer's transfer policy. Before a token can be enabled in a zone, the zone needs a provable binding between that token and its policy.

## Bind tokens to policies in TIP-403

TIP-403 already stores transfer policies. T9 adds a binding that records which policy a TIP-20 token uses, making that relationship available from registry state.

New tokens write the binding when they are created. Policy changes after T9 keep the binding up to date. Apps, indexers, and provable contract flows can use the registry view when they need to check a token's policy ID.

The [TIP-1092 specification](https://github.com/tempoxyz/tempo/blob/main/tips/tip-1092.md) defines the binding and migration behavior.

## Migrate existing tokens when the binding is needed

Existing tokens can copy their current local policy ID into TIP-403 through a targeted migration. This records the binding without changing the token's transfer policy or rules.

Migration is needed when an existing token must be enabled in a zone, used by a provable contract flow, or read by tooling that depends on the TIP-403 binding. Integrators can migrate the specific tokens their workflow needs and verify each binding afterward.

During token enablement, ZonePortal checks for the binding. If it is missing, the portal migrates that token and checks again. It rejects the token if the binding is still missing.

## Rollout and integration guidance

T9 activated on testnet on August 5, 2026, and mainnet on August 6, 2026. [Tempo v1.12.0](https://github.com/tempoxyz/tempo/releases/tag/v1.12.0) introduced support for the upgrade.

For issuers and zone integrators, the main step is to ensure that tokens used in registry-dependent flows have a TIP-403 binding. Read the [T9 upgrade docs](/docs/protocol/upgrades/t9) for the migration guidance, and consult the [Network Upgrades and Releases table](/docs/guide/node/network-upgrades#node-operator-updates) for current node release guidance.
