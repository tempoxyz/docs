# Tempo AI

Agent and editor integration metadata for Tempo.

This directory contains the plugin payloads and skills referenced by the root-level AI marketplace manifests.

Root-level manifests:

- `marketplace.json` for the `codex` marketplace
- `.claude-plugin/marketplace.json` for the `claude` marketplace

## Remote MCP

Use the hosted MCP server:

```txt
https://mcp.tempo.xyz
```

The current server exposes docs search, page discovery, and cleaned page reads. Wallet and paid-request workflows are handled by the `tempo-wallet` skill using the Tempo CLI.

## Codex

The Codex plugin lives in `plugins/tempo`.

## Claude

The Claude plugin lives in `providers/claude/plugin`.

## Skills

- `tempo`: generic Tempo developer skill placeholder.
- `tempo-wallet`: wallet setup, service discovery, and paid HTTP requests with `tempo wallet` and `tempo request`.
