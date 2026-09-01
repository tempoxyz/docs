# Tempo AI

Agent and editor integration metadata for Tempo.

This directory contains the plugin payloads and skills referenced by the AI marketplace manifests.

Marketplace manifests:

- `.agents/plugins/marketplace.json` for the `docs` Codex marketplace
- `.claude-plugin/marketplace.json` for the `claude` marketplace
- `.cursor-plugin/marketplace.json` for compatible Agent Plugin marketplaces

## Remote MCP

Use the hosted MCP server:

```txt
https://mcp.tempo.xyz
```

The current server exposes `search`, `find_pages`, `read_page`, and `code` for documentation search, page discovery, cleaned page reads, and multi-step lookups. Wallet and paid-request workflows are handled by the `tempo-wallet` skill using the Tempo CLI.

Feedback from MCP clients should be sent to the shared docs ingress:

```txt
POST https://tempo.xyz/developers/api/feedback
```

Use `source: "mcp"` plus a short `message`, and include `toolName`, `relatedResource`, or `client` when available.

## Codex

The Codex plugin lives in `ai/plugins/tempo`.

The Mercator plugin lives in `ai/plugins/mercator` and is available from the Codex, Claude, and
compatible Agent Plugin marketplace manifests.

## Claude

The Claude plugin lives in `providers/claude/plugin`.

## Skills

- `tempo`: generic Tempo developer skill placeholder.
- `tempo-wallet`: wallet setup, service discovery, and paid HTTP requests with `tempo wallet` and `tempo request`.
