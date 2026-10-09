---
name: tempo-docs
description: Find and explain official Tempo documentation for stablecoin accounts and payments, Earn vaults, Routes, Zones, Machine Payments, Tempo EVM, APIs, SDKs, CLI tools, and ecosystem integrations. Use for Tempo integration questions, code examples, protocol behavior, and documentation lookup.
---

# Tempo Docs

Use the documentation for the reader's task. Start with a product guide, then read the API, SDK, or protocol reference needed to implement it.

## Choose the documentation section

All links below use the canonical docs mount at `https://tempo.xyz/developers`.

| Section | Start here when the reader wants to… |
| --- | --- |
| [Get Started](https://tempo.xyz/developers/get-started.md) | Choose an integration, send a first test payment, get testnet funds, or connect a coding agent. |
| [Accounts](https://tempo.xyz/developers/docs/accounts.md) | Create accounts, connect wallets, read balances, send or receive payments, and reconcile customer deposits. |
| [Earn](https://tempo.xyz/developers/docs/earn.md) | Choose a vault, deposit stablecoins, read positions, or withdraw. Earn is in beta; check access on the introduction page. |
| [Routes](https://tempo.xyz/developers/docs/routes.md) | Accept cross-network deposits, quote transfers, or track delivery. Routes is in beta; check access on the introduction page. |
| [Zones](https://tempo.xyz/developers/docs/zones.md) | Connect to a Zone and work with private balances, deposits, or withdrawals. Zones is in limited preview; check access on the introduction page. |
| [Machine Payments](https://tempo.xyz/developers/docs/agents.md) | Pay for APIs, accept API payments, discover services, or integrate MPP. |
| [Tempo EVM](https://tempo.xyz/developers/docs/development.md) | Build wallet support, manage signing keys, use transactions and fees, issue TIP-20 Tokens, deploy contracts, exchange stablecoins, run nodes, or read protocol specifications and changelog. |
| [APIs & SDKs](https://tempo.xyz/developers/docs/tools.md) | Find the API reference, authentication, SDKs, CLI, and wallet or server libraries. |
| [Partners](https://tempo.xyz/developers/docs/partners.md) | Find third-party wallets, bridges, RPC infrastructure, data services, and integrations. |

Accounts covers application payment workflows; Tempo EVM covers the chain capabilities behind them. Routes covers cross-network movement. API reference belongs under APIs & SDKs; it supplements product guides.

Use current Zones pages before the earlier `/docs/guide/private-zones` sandbox walkthroughs. That sandbox uses a separate integration and does not establish which operations are available in the limited preview.

## Find and read the evidence

Use the hosted MCP server at `https://mcp.tempo.xyz` when available:

| Tool | Use it to… |
| --- | --- |
| `search` | Search Tempo and related documentation. |
| `find_pages` | Find matching page URLs from a source index. |
| `read_page` | Read a documentation page using its returned source and path or URL. |
| `code` | Combine multiple documentation lookups. |

Read the relevant pages before answering. The hosted MCP index can lag a branch or deployment: if a section is missing or the result uses older navigation, fetch the documentation directly from the site being reviewed. A missing search result does not mean a product is unavailable.

- [Documentation index](https://tempo.xyz/developers/llms.txt): every page grouped by the current navigation.
- [Full documentation](https://tempo.xyz/developers/llms-full.txt): all exported pages with their section and source URL. Prefer individual pages for focused questions.
- Markdown pages: append `.md` to a page URL, for example `https://tempo.xyz/developers/docs/accounts/balances.md`. Strip a trailing slash first. Use the HTTP or browsing tool available in your environment.

For MPP behavior, cross-check [MPP documentation](https://mpp.dev/llms.txt). For exact SDK methods, read the relevant Viem, Wagmi, or Accounts reference returned by MCP or linked from the page.

## Keep answers grounded

- Check network, availability, authentication, supported operations, and response shapes on the relevant page. A product plan or earlier sandbox example is not evidence of current availability.
- Tempo Mainnet uses chain ID `4217`. Moderato is Tempo Testnet, with chain ID `42431`. Faucet-issued `pathUSD` is testnet money; do not confuse it with a mainnet balance or asset.
- An API key authenticates API requests. Account signing keys and access keys authorize onchain transactions. They are not interchangeable.
- Prefer the short Viem example on a task page; use CLI, Wagmi, or runnable API examples when they fit the reader's environment. Follow its linked client setup instead of inventing missing configuration.
- Interactive walkthroughs run on the web page. Markdown exports describe the steps and link to references; they do not execute transactions.
- Keep explanations concise. Link the pages supporting the answer and state any unverified behavior.

This skill guides documentation lookup. It does not authorize transactions, credential changes, or sending feedback. Send sanitized documentation feedback only when the user asks, using `https://tempo.xyz/developers/api/feedback` with `source: "mcp"`, `message`, and relevant `toolName` or `relatedResource`.
