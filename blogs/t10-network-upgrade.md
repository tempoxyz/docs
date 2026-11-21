---
title: "T10 network upgrade: Native zone creation"
excerpt: "T10 brings ZoneFactory into the Tempo protocol, with deterministic ZonePortal addresses and shared runtimes for portals, verification, and messaging."
date: 2026-08-21
category: network-upgrades
---

*The T10 network upgrade makes zone creation a native Tempo protocol operation. Each new zone receives a deterministic portal address and uses shared, protocol-managed runtimes. Read the [T10 upgrade docs](/docs/protocol/upgrades/t10) for the factory interface and canonical addresses.*

Zone creation moves from a separately deployed factory contract into the protocol. This gives zone operators and integrations a canonical factory and common portal logic, while each portal keeps its own state.

## Create zones through the native factory

T10 introduces `ZoneFactory` as a precompile at `0x5AF2000000000000000000000000000000000000`. It preserves the registry behavior used to discover zones: sequential zone IDs, `zones`, `nextZoneId`, `isZonePortal`, and the `ZoneCreated` event.

The initial T10 rollout is permissioned. Only the factory owner can call `createZone`; opening creation requires a later hardfork. A successful creation consumes at least 15,000,000 gas.

The initial TIP-20 token must also have an explicit TIP-403 policy binding before the factory can create a zone with it. That prerequisite builds on [T9's token policy bindings](/docs/protocol/upgrades/t9).

## Give each zone a deterministic portal

Every new zone receives a `ZonePortal` address that encodes its zone ID. For example, zone ID `1` maps to `0x5AD0000000000000000000000000000000000001`.

Integrations should use `ZoneFactory.isZonePortal(address)` to validate a portal. The factory provides the canonical check, so applications do not need their own address-prefix and zone-ID validation logic.

Each portal is an ERC-1167 proxy to a shared implementation. Portals maintain independent state while executing the same canonical logic.

## Install shared runtimes through the protocol

At activation, T10 atomically installs the factory and the shared portal, verifier, and messenger runtimes at reserved addresses. The [T10 runtime table](/docs/protocol/upgrades/t10#protocol-managed-zone-runtimes) lists those addresses for integrations.

The [TIP-1091 specification](https://github.com/tempoxyz/tempo/blob/main/tips/tip-1091.md) describes native factory behavior, deterministic portals, and runtime installation.

## Rollout and integration guidance

T10 activated on testnet on August 20, 2026, at 14:00 UTC and mainnet on August 21, 2026, at 14:00 UTC. [Tempo v1.13.0](https://github.com/tempoxyz/tempo/releases/tag/v1.13.0) introduced support for the upgrade.

Zone integrations should use the native factory, validate portals through its registry, and ensure the initial token has its TIP-403 binding. Read the [T10 upgrade docs](/docs/protocol/upgrades/t10) for integration details, and consult the [Network Upgrades and Releases table](/docs/guide/node/network-upgrades#node-operator-updates) for current node release guidance.
