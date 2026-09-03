---
name: tempo-docs
description: >
  Read Tempo documentation when building applications on Tempo, integrating
  Tempo into an app, reviewing Tempo code, or answering developer questions
  about accounts, passkeys, stablecoin payments, fee sponsorship, MPP, the
  Tempo API, indexer queries, stablecoin issuance, the Stablecoin DEX, contract
  verification, SDKs, or Tempo protocol concepts.
license: MIT
---

# Tempo Docs

Use this skill to build applications on Tempo. Prefer `search`, `find_pages`,
`read_page`, and `code` from the hosted MCP server at
`https://mcp.tempo.xyz`; if MCP is unavailable, read the relevant page from
`https://tempo.xyz/developers` or append `.md` to the docs URL. Do not guess current
RPC URLs, contract addresses, chain IDs, package APIs, or protocol details;
verify them from docs before writing code.

This plugin is read-only. It may retrieve and explain documentation, but it
must not install software, authenticate or fund wallets, call paid services,
sign messages or transactions, or submit transactions. When a user requests
one of those actions, provide the relevant documentation and state that the
action requires a separate tool or plugin.

## Routing

| User is building... | Start with |
|---|---|
| A new Tempo app or network setup | `/quickstart/integrate-tempo`, `/quickstart/connection-details`, `/sdk` |
| Wallet UX | `/quickstart/wallet-developers`, `/quickstart/connection-details`, `/sdk` |
| Stablecoin payments | `/guide/payments`, especially send, accept, virtual addresses, memos, fees, sponsorship, and parallel transactions |
| Sponsored or gasless transactions | `/guide/payments/sponsor-user-fees`, `/api/fee-payer` |
| MPP or paid APIs | `/guide/machine-payments`, then `/guide/machine-payments/client`, `/server`, or `/agent` |
| Agent-paid service calls | `/guide/machine-payments/agent`; provide documentation only |
| Hosted indexer queries | `/api/indexer-api` |
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
- For production examples, use the current Tempo Mainnet details from the docs. Use Tempo Testnet only when the user requests it or a development workflow explicitly requires it.
- Treat `pathUSD` as a live mainnet TIP-20 stablecoin. Distinguish production `pathUSD` from faucet-issued testnet tokens.
- When network intent is unclear, verify the current connection details and name the selected network explicitly.
- For production-oriented changes, check the production, security, or Tempo
  API docs before recommending defaults.

## Critical Rules

- Never invent Tempo addresses, fee tokens, RPC endpoints, sponsor URLs, or
  verifier URLs. Fetch them from docs.
- For transfer memos, preserve the documented 32-byte memo constraint and use
  them for reconciliation metadata such as invoice IDs or payment references.
- For access keys, keep scopes and spending limits narrow. Do not use access
  keys for contract deployment flows unless the docs explicitly support it.

## Useful Docs

- Getting started: `https://tempo.xyz/developers/docs/quickstart/integrate-tempo`
- Connection details: `https://tempo.xyz/developers/docs/quickstart/connection-details`
- Wallet: `https://tempo.xyz/developers/docs/wallet`
- Payments: `https://tempo.xyz/developers/docs/guide/payments`
- Machine payments: `https://tempo.xyz/developers/docs/guide/machine-payments`
- Tempo API: `https://tempo.xyz/developers/docs/api`
- SDKs: `https://tempo.xyz/developers/docs/sdk`
- Protocol specs: `https://tempo.xyz/developers/docs/protocol`
