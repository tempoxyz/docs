---
name: tempo
description: >
  Use this skill when building applications on Tempo, integrating Tempo into an
  app, writing or reviewing Tempo code, or answering Tempo developer questions
  about accounts, wallets, passkeys, stablecoin payments, fee sponsorship,
  MPP, hosted services, indexer queries, stablecoin issuance, the Stablecoin
  DEX, contract verification, SDKs, or Tempo protocol concepts. For agent
  wallet setup, service discovery, or paid HTTP requests, use the tempo-wallet
  skill.
---

# Tempo Developer Skill

Use this skill to build applications on Tempo. Prefer Tempo docs from the
hosted MCP server first; if MCP is unavailable, read the relevant page from
`https://docs.tempo.xyz` or append `.md` to the docs URL. Do not guess current
RPC URLs, contract addresses, chain IDs, package APIs, or protocol details;
verify them from docs before writing code.

## Routing

| User is building... | Start with |
|---|---|
| A new Tempo app or network setup | `/quickstart/integrate-tempo`, `/quickstart/connection-details`, `/sdk` |
| Wallet UX | `/quickstart/wallet-developers`, `/quickstart/connection-details`, `/sdk` |
| Stablecoin payments | `/guide/payments`, especially send, accept, virtual addresses, memos, fees, sponsorship, and parallel transactions |
| Sponsored or gasless transactions | `/guide/payments/sponsor-user-fees`, `/developer-tools/fee-payer` |
| MPP or paid APIs | `/guide/machine-payments`, then `/guide/machine-payments/client`, `/server`, or `/agent` |
| Agent-paid service calls | Use the `tempo-wallet` skill for wallet login, service discovery, and `tempo request` |
| Hosted indexer queries | `/developer-tools/indexer` |
| Stablecoin issuance | `/guide/issuance`, `/protocol/tip20/overview`, `/protocol/tip20/spec` |
| Stablecoin DEX swaps or liquidity | `/guide/stablecoin-dex`, `/protocol/exchange` |
| Contract deployment or verification | `/quickstart/verify-contracts` |
| Low-level protocol behavior | `/protocol`, then the relevant transactions, fees, TIP-20, exchange, or zones spec |

Read the relevant page before answering an integration question or changing
code. Use the docs page’s linked examples when available.

## Implementation Defaults

- Prefer TypeScript examples for web apps, using the Tempo SDK pages and the
  repo’s existing Wagmi/Viem patterns.
- Prefer Foundry examples for Solidity contracts and contract verification.
- Use Tempo Testnet examples unless the user explicitly asks for mainnet.
- For production-oriented changes, check the production, security, or hosted
  service docs before recommending defaults.

## Critical Rules

- Never invent Tempo addresses, fee tokens, RPC endpoints, sponsor URLs, or
  verifier URLs. Fetch them from docs.
- For transfer memos, preserve the documented 32-byte memo constraint and use
  them for reconciliation metadata such as invoice IDs or payment references.
- For access keys, keep scopes and spending limits narrow. Do not use access
  keys for contract deployment flows unless the docs explicitly support it.

## Useful Docs

- Getting started: `https://docs.tempo.xyz/docs/quickstart/integrate-tempo`
- Connection details: `https://docs.tempo.xyz/docs/quickstart/connection-details`
- Wallet: `https://docs.tempo.xyz/docs/wallet`
- Payments: `https://docs.tempo.xyz/docs/guide/payments`
- Machine payments: `https://docs.tempo.xyz/docs/guide/machine-payments`
- Hosted services: `https://docs.tempo.xyz/docs/hosted-services`
- SDKs: `https://docs.tempo.xyz/docs/sdk`
- Protocol specs: `https://docs.tempo.xyz/docs/protocol`
