# Tempo AI

Agent and editor integration metadata for Tempo.

This directory contains the plugin payloads and skills referenced by the AI marketplace manifests.

Marketplace manifests:

- `.agents/plugins/marketplace.json` for the `tempo` Codex marketplace
- `.claude-plugin/marketplace.json` for the `tempo` Claude marketplace
- `.cursor-plugin/marketplace.json` for compatible Agent Plugin marketplaces

## Remote MCP

Use the hosted MCP server:

```txt
https://mcp.tempo.xyz
```

The current server exposes `search`, `find_pages`, `read_page`, and `code` for read-only documentation search, page discovery, cleaned page reads, and multi-step lookups. Wallet and paid-request workflows live in the separate `tempo-wallet` plugin.

Feedback from MCP clients should be sent to the shared docs ingress:

```txt
POST https://tempo.xyz/developers/api/feedback
```

Use `source: "mcp"` plus a short `message`, and include `toolName`, `relatedResource`, or `client` when available.

## Codex

The read-only Tempo Docs plugin lives in `ai/plugins/tempo-docs`.

The Tempo Wallet plugin lives in `ai/plugins/tempo-wallet`. Keep wallet setup, funding, paid requests, and transaction execution out of the Tempo Docs bundle.

The Mercator plugin lives in `ai/plugins/mercator` and is available from the Codex, Claude, and
compatible Agent Plugin marketplace manifests.

## Claude

Claude uses the same plugin payloads under `ai/plugins`.

## Skills

- `tempo-docs`: read-only Tempo documentation and developer guidance.
- `tempo-wallet`: wallet setup, service discovery, and paid HTTP requests with `tempo wallet` and `tempo request`; packaged separately from Tempo Docs.
