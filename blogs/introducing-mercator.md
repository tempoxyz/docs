---
title: "Introducing Mercator"
excerpt: "Mercator helps agents discover, price, and execute paid tool workflows through one interface, powered by the Machine Payments Protocol."
authors: "Brendan Ryan, Parv Ahuja, Georgios Konstantopoulos"
date: 2026-09-23
category: product-announcements
---

*Mercator is a single interface for agents to discover, price, and execute open-ended workflows using paid tools, powered by the Machine Payments Protocol (MPP). With Mercator, your agent describes a task, selects from a live corpus of services, and pays only for what it runs. [Get started at mercator.sh](https://mercator.sh).*

Agents are increasingly doing more open-ended and economically valuable work. A single ambitious task can span research, data enrichment, compute, and an action, such as sending an email or producing a report. Today's tooling assumes the opposite. MCP configs, tool registries, and hardcoded harness integrations all require declaring tools ahead of time, narrowing the paths an agent can take at the source. When an agent discovers it needs a geocoder, a company-data API, or a web search tool it wasn't explicitly provisioned with, it stops: someone has to sign up, fetch an API key, and wire in credentials before work can resume.

Machine-native payments solve half of this. The Machine Payments Protocol ([MPP](https://mpp.dev)) and [x402](https://x402.org) let an agent pay for a tool call over HTTP with no account. But agents still need to know *where* to find these services, which ones are high quality, and how to map them back to the original task. Mercator solves this: finding the right services for a task, composing them into a workflow, and reliably running that workflow.

## Mercator at a glance

Mercator is an intent-based tool gateway for agents. Your agent describes what it wants to achieve; Mercator finds the right services and reliably executes them on the agent's behalf, without API keys, sign-up portals, or pre-arranged billing relationships.

![An agent sends its intent and budget to Mercator, which plans paid calls to downstream services and composes the result.](/blog/mercator-workflow.svg)

*Mercator connects the agent to services that can complete each step of a paid workflow.*

Mercator gives agents a stable surface area via MCP or REST and can ingest downstream services reachable via open payment protocols like [MPP](https://mpp.dev) and [x402](https://x402.org). Clients pay Mercator on Tempo, while downstream services can settle over whatever rails or currencies they already support.

## How Mercator works

Mercator relies on two core primitives to reliably produce high quality results over a wide range of services and queries.

**Intent-based search** takes natural-language intent, not tool names. *"What is the weather in Paris"* finds OpenWeather. *"Search SEC filings about climate risk"* finds EDGAR full-text search. *"Find cafes near Moscone Center"* finds Google Maps. The agent sees a short, confident list rather than a directory.

Callers can rate a workflow after it runs. Ratings feed directly back into ranking, and callers who submit high-signal feedback earn rebates against the cost of the workflow they rated.

**Durable execution.** After searching, the agent builds an execution plan: an immutable DAG whose nodes reference each other's outputs. Plans execute durably, atomically, and concurrently whenever possible, ensuring that agents receive the data they need, even in the face of downstream tool reliability issues.

### Under the hood

Search in Mercator involves much more than a single index lookup or categorization query. A good result has to be relevant to the task, callable by the agent, and reliable in practice. To consider all of these signals across a wide variety of services, Mercator’s search system runs as a multi-stage pipeline, with each stage either removing candidates or re-ranking them.

![Mercator searches, filters, reranks, and resolves services before returning results to the agent.](/blog/mercator-search-pipeline.svg)

*Live service health and job ratings feed back into ranking.*

Retrieval systems can find services on the right topic, but not always ones that can consistently do the job. For *"latest 10-K for Stripe,"* a company-news API and an SEC filings API both look relevant, but only one can return the relevant documents. Mercator re-ranks the short list with [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), a small categorization model that asks whether each endpoint can perform the requested action within the query's constraints. Because Jev only scores candidates that are already plausible, this online categorization call stays fast and cheap. On our internal benchmark, adding Jev improved MRR@5 by 25% and cut the rate of known-bad endpoints in results by 80%.

## Measured performance

Agents using Mercator deliver better results on tasks that need data they weren't provisioned for. The same agent, with Mercator added, scores higher on every one of our production benchmark suites:

| Suite | Baseline | With Mercator | Δ |
| :---- | ----: | ----: | ----: |
| WideSearch | 70.7% | 73.3% | +2.6 pts |
| FreshQA | 66.7% | 68.5% | +1.8 pts |
| GAIA | 80.0% | 81.1% | +1.1 pts |
| DeepSynth | 56.1% | 56.7% | +0.6 pts |

The lift is largest for cheaper models. Codex running GPT-5.6 Luna with Mercator scores 70.3% across these suites, up from 66.8% without it, and within 2.3 points of GPT-5.6 Sol alone at 72.6%. GPT-5.6 Terra gains 4.2 points (67.6% → 71.8%).

## Powered by MACH

Mercator settles on Tempo over MPP, but getting started does not require a stablecoin balance or navigating complicated crypto onramping flows.

Mercator is powered by MACH, a Tempo-native token you can purchase directly at [mercator.sh/fund](https://mercator.sh/fund). MACH is accessible via Apple Pay, and spend is drawn down per job against the quote you already approved. Mercator supports MACH in addition to USDC and other stablecoins.

## Get started today

Mercator is available today at [mercator.tempo.xyz](https://mercator.tempo.xyz).

- **Install the CLI:** `curl -fsSL https://mercator.tempo.xyz/install.sh | sh`
- **Add the MCP endpoint directly:** `codex mcp add mercator --url https://mercator.tempo.xyz/mcp`

Run a service that speaks MPP or x402? [Get it listed](https://mercator.sh/docs#mercator-for-service-owners) — Mercator ingests any endpoint reachable over open payment and discovery protocols.
