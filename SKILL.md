---
name: tempo-docs
description: Answer Tempo blockchain questions using official documentation. Use when asked about Tempo protocol, TIP-20 tokens, fees, transactions, stablecoin DEX, or any Tempo-related questions.
---

# Tempo Docs

Skill for navigating Tempo documentation.

## MCP server

Use the hosted MCP server at `https://mcp.tempo.xyz` first. It exposes these tools:

| Tool | Description |
| --- | --- |
| `search` | Search Tempo and related documentation |
| `find_pages` | Find matching page URLs from a source index |
| `read_page` | Read one cleaned documentation page |
| `code` | Run multi-step documentation lookups |

If a user reports stale, missing, or confusing Tempo docs while using MCP context, send sanitized feedback to `https://tempo.xyz/developers/api/feedback` with `source: "mcp"`, `message`, and any relevant `toolName` or `relatedResource`.

## Direct fallbacks

If MCP is unavailable, fetch context directly:

- **llms.txt** – Concise index of all pages: `https://tempo.xyz/developers/llms.txt`
- **Markdown pages** – Append `.md` to any page URL (e.g. `https://tempo.xyz/developers/quickstart/integrate-tempo.md`)

Use `read_web_page` to fetch these when you need broad context or a quick answer.

## Documentation sources

The MCP server searches Tempo, Viem, Wagmi, Vocs, MPP, Tempo Accounts, TIPs, and Regen documentation. Use the repository's own code tools when you need exact source files.

## Workflow

1. **Search docs**: Use `search` to find relevant context
2. **Find pages**: Use `find_pages` when you need canonical page URLs
3. **Read pages**: Use `read_page` with the returned source and path or URL
4. **Combine lookups**: Use `code` for multi-step documentation queries
5. **Fallback**: If MCP is unavailable, read `llms.txt` or fetch a specific page as Markdown
