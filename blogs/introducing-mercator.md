---
title: "Supercharge your agentic workflows with Mercator"
excerpt: "A new effort option for agents: discover, price, and execute paid tool workflows through one interface."
authors: "Brendan Ryan, Parv Ahuja, Georgios Konstantopoulos"
date: 2026-09-23
category: product-announcements
---

<a id="mercator-at-a-glance"></a>

Mercator is a tool router for multi-step agentic workflows. Think of it as a new effort option for your agent: alongside choosing a model and reasoning level, you can give it access to paid tools that help it complete more of the task. A smaller model can use those tools to close part of the gap to a larger one.

Instead of choosing and configuring every tool ahead of time, your agent describes what it needs. Mercator searches a catalog of services powered by the Machine Payments Protocol ([MPP](https://mpp.dev)) and [x402](https://x402.org), ranks them by fit, reliability, and cost, and executes the selected workflow.

Mercator is powered by MACH, a Tempo-native credit you can buy with Apple Pay. You can pay for downstream tools without setting up an account and API key with each provider. [Get started at mercator.sh](https://mercator.sh).

![An agent sends its intent and budget to Mercator, which plans paid calls to downstream services and composes the result.](/blog/mercator-workflow.svg)

<a id="measured-performance"></a>

## How good is Mercator?

Mercator gives agents another way to improve their results alongside choosing a stronger model or increasing reasoning effort. With Mercator, GPT-5.6 Luna at `high` effort outperforms the same model at `xhigh` without it across the four benchmarks shown below.

Across a range of benchmarks, Mercator improves Luna’s average score at every reasoning level we tested.

![GPT-5.6 Luna scores with and without Mercator across medium, high, and xhigh reasoning effort. Mercator adds 3.0, 3.5, and 0.3 percentage points, respectively, across four selected benchmark suites.](/blog/mercator-benchmarks.svg)

The same agent, with Mercator added, scores higher across these four production benchmark suites:

| Suite | Baseline | With Mercator | Δ |
| :--- | ---: | ---: | ---: |
| WideSearch | 70.7% | 73.3% | +2.6 pts |
| FreshQA | 66.7% | 68.5% | +1.8 pts |
| GAIA | 80.0% | 81.1% | +1.1 pts |
| DeepSynth | 56.1% | 56.6% | +0.6 pts |

The lift is largest for the cheaper models. With Mercator, Codex running GPT-5.6 Luna at `high` effort scores **70.3% across these suites, up from 66.8%**—a 3.5-point gain, and within 2.3 points of GPT-5.6 Sol at `medium` effort without Mercator (72.6%). GPT-5.6 Terra at `xhigh` gains **4.2 points, from 67.6% to 71.8%**.

## How Mercator works

Mercator exposes MCP and REST interfaces and connects agents to downstream tools reachable through open payment protocols like MPP and x402. Clients pay Mercator on Tempo; downstream services can settle over their supported rails and currencies.

Mercator relies on two core primitives:

- **Intent-based search** takes natural-language intent rather than tool names. “What is the weather in Paris” finds OpenWeather, “Search SEC filings about climate risk” finds EDGAR full-text search, and “Find cafes near Moscone Center” finds Google Maps. The agent gets a short list of relevant services.
- **Durable execution** runs the agent's plan, whose steps can reference earlier outputs. Independent steps can run concurrently, and the workflow can recover from transient downstream failures.

Alongside objective signals such as reliability, latency, and cost, agents can rate a completed workflow's quality and correctness. Feedback contributes to ranking, and eligible reviews can receive MACH rewards.

### Under the hood

Search in Mercator is more than a single index lookup. A good result has to be relevant to the task, callable by the agent, and reliable in practice. To weigh these signals across many services, Mercator runs search as a multi-stage pipeline. Each stage either removes candidates or re-ranks them.

![Mercator searches, filters, reranks, and resolves services before returning results to the agent.](/blog/mercator-search-pipeline.svg)

Retrieval systems can find services on the right topic without finding ones that can complete the job. For “retrieve a company's SEC 10-K filing,” a company-news API and an SEC filings API may both look relevant, but only the latter exposes the requested document retrieval. Mercator re-ranks a pre-filtered candidate list with [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), a small categorization model that scores whether each endpoint can perform the requested action within the query's constraints. Because Jev only scores plausible candidates, the categorization step works on a short list.

## Why build Mercator?

Agents are doing more open-ended, economically valuable work. A single task can span research, data enrichment, compute, and an action such as sending an email or producing a report. MCP configs, tool registries, and hardcoded harness integrations require declaring tools ahead of time, narrowing the paths an agent can take before it starts. When an agent needs a geocoder, a company-data API, or a web search tool it wasn't provisioned with, someone has to sign up, fetch an API key, and wire in credentials before work can resume.

Machine-native payments solve half of this. MPP and x402 let an agent pay for a tool call over HTTP. But agents still need to know where to find services, which ones are high quality, and how to map them back to the original task. Mercator handles discovery, composition, and execution together.

<a id="powered-by-mach"></a>

## What is MACH, and how do I buy it?

MACH is a USD-denominated credit on Tempo for paying approved merchants, including Mercator. You can purchase it with Apple Pay at [mercator.sh/fund](https://mercator.sh/fund), without first acquiring a stablecoin balance. Your connected wallet uses MACH to pay for jobs against approved quotes.

Mercator also supports direct USDC.e payments on Tempo and supported pathUSD auto-swaps. See [costs and payment](https://mercator.sh/docs#costs-and-payment) for the available payment routes.

## Get started today

Mercator is available at [mercator.sh](https://mercator.sh).

Install the CLI:

```bash
curl -fsSL https://mercator.sh/install.sh | sh
```

Or connect your agent directly over MCP and complete browser authorization:

```bash
# Codex
codex mcp add mercator \
  --url https://mercator.sh/mcp/auth \
  --oauth-client-registration dcr

# Claude Code
claude mcp add --scope user --transport http mercator \
  https://mercator.sh/mcp/auth
```

After authorization, [fund your wallet](https://mercator.sh/fund) and tell your agent what you want to accomplish. Start your prompt with “Use Mercator” and describe the complete outcome:

```text
Use Mercator to find NVIDIA's latest 10-Q and 8-K via SEC submissions.
Return official links, dates, and one-sentence summaries.
```

Include a spending limit in your prompt if you want a tighter budget than your authorization allows. For more ideas, ask your agent for Mercator’s suggested queries or see [Run your first job](https://mercator.sh/docs#run-your-first-job).

Run a service that speaks MPP or x402? [Get it listed](https://mercator.sh/docs#mercator-for-service-owners).
