---
name: tempo-docs
description: Find and explain official Tempo documentation for stablecoin accounts and payments, passkeys, fee sponsorship, TIP-20 issuance, the Stablecoin DEX, Earn, Routes, Zones, Machine Payments (MPP), Tempo EVM contracts, nodes and network upgrades, the Tempo API and indexer, SDKs, CLI tools, and partner integrations. Use when building on Tempo, integrating or reviewing Tempo code, or answering Tempo developer and protocol questions.
license: MIT OR Apache-2.0
---

# Tempo Docs

Use the documentation for the reader's task. Start with a product guide, then read the API, SDK, or protocol reference needed to implement it. Do not guess RPC or service URLs, contract addresses, chain IDs, fee tokens, package APIs, or protocol details; verify them from the docs before answering or writing code.

This skill is read-only. It may retrieve and explain documentation, but it must not install software, authenticate or fund wallets, change keys or credentials, call paid services, sign messages or transactions, or submit transactions. Those actions require a separate tool or plugin. To set up the Tempo CLI and Tempo Wallet, fund a wallet, or make paid requests, switch to the Tempo CLI skill at `https://tempo.xyz/skills/wallet/SKILL.md`, which performs that setup. For other actions, link the relevant documentation and name the tool that performs them, such as the paid tools in [Build with AI](https://tempo.xyz/developers/docs/guide/using-tempo-with-ai.md).

## Choose the documentation section

All links below use the canonical docs mount at `https://tempo.xyz/developers`.

| Section | Start here when the reader wants to… |
| --- | --- |
| [Get Started](https://tempo.xyz/developers/get-started.md) | Choose an integration, send a first test payment, get testnet funds, connect a coding agent, or find the SDKs and CLI. |
| [Accounts](https://tempo.xyz/developers/docs/accounts.md) | Create accounts, connect wallets, read balances, send or receive payments, and reconcile customer deposits. |
| [Earn](https://tempo.xyz/developers/docs/earn.md) | Choose a vault, deposit stablecoins, read positions, or withdraw. Earn is in beta; check access on the introduction page. |
| [Routes](https://tempo.xyz/developers/docs/routes.md) | Accept cross-network deposits, quote transfers, or track delivery. Routes is in beta; check access on the introduction page. |
| [Zones](https://tempo.xyz/developers/docs/zones.md) | Connect to a Zone and work with private balances, deposits, or withdrawals. Zones is in limited preview; check access on the introduction page. |
| [Machine Payments](https://tempo.xyz/developers/docs/agents.md) | Pay for APIs, accept API payments, discover services, or integrate MPP. |
| [Tempo EVM](https://tempo.xyz/developers/docs/development.md) | Build wallet support, manage signing keys, use transactions and fees, issue TIP-20 Tokens, deploy contracts, exchange stablecoins, run nodes, or read protocol specifications and changelog. |
| [API reference](https://tempo.xyz/developers/docs/api.md) | Find Tempo API endpoints by product, authentication, Console management endpoints, JSON-RPC, and the indexer. |
| [Partners](https://tempo.xyz/developers/docs/partners.md) | Find third-party wallets, bridges, RPC infrastructure, data services, and integrations. |

Accounts covers application payment workflows; Tempo EVM covers the chain capabilities behind them. Routes covers cross-network movement. The API reference supplements product guides with exact endpoints and schemas. SDKs and the CLI are under Get Started.

Within Tempo EVM, node operators start at [Run a node](https://tempo.xyz/developers/docs/guide/node.md). For network upgrades and activation timelines, read [Changelog](https://tempo.xyz/developers/docs/protocol/upgrades.md); for node software versions, read [Node releases](https://tempo.xyz/developers/docs/changelog.md).

Use current Zones pages before the earlier `/docs/guide/private-zones` sandbox walkthroughs. That sandbox uses a separate integration and does not establish which operations are available in the limited preview.

## Find and read the evidence

Prefer the hosted MCP server at `https://mcp.tempo.xyz` when available:

| Tool | Use it to… |
| --- | --- |
| `search` | Search Tempo and related documentation. |
| `find_pages` | Find matching page URLs from a source index. |
| `read_page` | Read a documentation page using its returned source and path or URL. |
| `code` | Combine multiple documentation lookups. |

Read the relevant pages before answering or changing code. If MCP is unavailable, read pages from `https://tempo.xyz/developers` directly. The hosted MCP index can lag a branch or deployment: if a section is missing or the result uses older navigation, fetch the documentation from the site being reviewed. A missing search result does not mean a product is unavailable.

- [Documentation index](https://tempo.xyz/developers/llms.txt): every page grouped by the current navigation.
- [Full documentation](https://tempo.xyz/developers/llms-full.txt): all exported pages with their section and source URL. Prefer individual pages for focused questions.
- Markdown pages: append `.md` to a page URL, for example `https://tempo.xyz/developers/docs/accounts/balances.md`. Strip a trailing slash first. Use the HTTP or browsing tool available in your environment.

For MPP behavior, cross-check [MPP documentation](https://mpp.dev/llms.txt). For exact SDK methods, read the relevant Viem, Wagmi, or Accounts reference returned by MCP or linked from the page.

## Keep answers grounded

- Check network, availability, authentication, supported operations, and response shapes on the relevant page. A product plan or earlier sandbox example is not evidence of current availability.
- Tempo Mainnet uses chain ID `4217`. Moderato is Tempo Testnet, with chain ID `42431`. Read RPC and explorer URLs from [Network details](https://tempo.xyz/developers/docs/quickstart/connection-details.md). Use Mainnet for production examples and Testnet only when the reader asks or the workflow requires it; when the network is unclear, name the one you chose.
- `pathUSD` is live on Tempo Mainnet. Faucet-issued `pathUSD` on Tempo Testnet shares its address but is testnet money; do not confuse it with a mainnet balance or asset.
- An API key authenticates API requests. Account signing keys and access keys authorize onchain transactions. They are not interchangeable.
- Keep access-key expiry, spending limits, and call scopes as narrow as the task allows. Access keys cannot sign a top-level contract creation.
- Transfer memos are 32 bytes, not 32 characters. Use them for short reconciliation references such as invoice or order IDs.
- Prefer the short Viem example on a task page; use CLI, Wagmi, Foundry, or runnable API examples when they fit the reader's environment, and match the reader's existing code patterns. Follow the linked client setup instead of inventing missing configuration.
- Interactive walkthroughs run on the web page. Markdown exports describe the steps and link to references; they do not execute transactions.
- Keep explanations concise. Link the pages supporting the answer and state any unverified behavior.

The only write this skill supports is documentation feedback, and only when the user asks: send sanitized feedback to `https://tempo.xyz/developers/api/feedback` with `source: "mcp"`, `message`, and relevant `toolName` or `relatedResource`.
