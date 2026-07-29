---
title: "Introducing stable-bench-v1"
excerpt: "A reproducible benchmark for measuring whether coding agents can build stablecoin applications on Tempo."
date: 2026-07-21
category: technical
authors: "Parv Ahuja / Brendan Ryan"
---

*`stable-bench-v1` measures whether coding agents can build stablecoin applications on Tempo using public documentation and tools. It gives us a repeatable way to understand how agents use our developer surface and where it needs to improve.*

Since the start of 2026 we have observed a marked change in interaction patterns with Tempo’s developer documentation. While in the past, developers may have read through multiple guides or clicked through interactive examples to understand how Tempo works, increasingly our primary entrypoint is a developer directly prompting `claude`, `codex` or another coding agent to do research and development on their behalf -- sometimes never even opening the docs themselves!

On an average day in July, agents drive over 70% of our documentation traffic. While we eagerly adopted best practices like automatic markdown conversion and `llms.txt`, we previously lacked visibility into whether these changes improved the agent experience.

To address this, we built `stable-bench-v1`, an agent evaluation suite that measures:

- **Efficacy:** Can an agent produce a working integration?
- **Quality:** Does the integration use current Tempo primitives and follow best practices?
- **Efficiency:** How many turns and tokens does the agent use?

The benchmark simulates integration sessions and records concrete scores and trajectory logs, replacing subjective audits with results we can compare over time.

## Measuring working Tempo integrations

Most coding benchmarks run in a sandboxed environment and end on some deterministic output or completion of a test suite – two paradigms which are easy to test and have scaled well. With Tempo, we can go one step further allowing agents to actually interact with a live or sandboxed Tempo environment and write programs which have measurable side-effects.

`stable-bench-v1` packages each scenario as a versioned task with four parts:

- **Instruction:** A developer's request to the agent.
- **Environment:** The runtime, credentials, documentation, and tools the agent can use.
- **Oracle:** A minimal reference implementation that proves the task is solvable. Agents never see it.
- **Verifier:** An independent program that checks and grades an agent's submission.

The harness is built on [Harbor](https://harborframework.org), which runs the agent and verifier in isolated environments, either locally or in the cloud, and transfers only declared artifacts between them. In this setup, the agent cannot inspect the oracle, verifier, or grading code as a way of inferring what the “best” answer may look like.

![A diagram showing prompts and tools entering an isolated evaluation environment, which shares code artifacts and logs with a separate verification environment. The evaluation environment writes to Tempo; the verifier reads from Tempo and receives verification criteria separately.](/blog/stable-bench-isolated-harness.svg)

## A task from instruction to settlement

One task asks an agent to create a `TIP-20` stablecoin with a denylist transfer policy, a Tempo primitive that prevents specific addresses from interacting with an asset. The agent receives the same inputs as a developer: a short instruction and access to Tempo's SDKs and documentation pinned to a specific revision.

To successfully complete the task, the agent must:

1. Create and fund a Tempo account.
1. Create the transfer policy.
1. Deploy the `TIP-20` stablecoin against that policy.
1. Submit the required transactions.
1. Write an artifact containing the deployed addresses and transaction hashes.

The verifier reads the artifact, inspects it, and queries Tempo to gauge correctness. If the solution is correct, we assess integration quality with fixed criteria and LLMs as judges. We combine those three scores into a single composite score and compare it across agents alongside token and turn counts.

**An example agent instruction, mirroring a user prompt:**

```
Build a minimal TypeScript project that creates and funds an account, then uses
it to create a TIP-20 stablecoin and a Tempo transfer policy of type
`TEMPO_POLICY_TYPE` that covers `TEMPO_POLICY_ACCOUNT` (a blacklist policy must
restrict that account), and links the policy to the new token.

## Tempo Documentation

Tempo documentation is available at https://docs.tempo.xyz.

When `npm run eval` finishes, write `/app/out.json` matching this schema: {...}
```

## A reproducible documentation environment

Agents are live actors and make requests to the public internet in order to read documentation, download `npm` packages, and perform other research. This creates an interesting problem for documentation-focused evals – if our documentation changes every day how do we create reproducibility between evaluation runs? How can we measure if a change in documentation actually made Tempo better for the average `claude` user?

To address this, we shipped a novel extension to our eval environment which runs the entire tempo documentation site in a sidecar service and dynamically rewrites egress traffic for known urls into this container. By using this, we are able to control the specific version of documentation that the agent observes, while not having to introduce scaffolding to the harness which would potentially mislead the agent or create further divergence from our user’s environments.

## Early results

Early `stable-bench-v1` runs show how different agents interact with our documentation:

- Frontier models (GPT 5.6, Claude Fable, and Claude Opus) produce high-quality implementations that nearly saturate the benchmark, but their token usage and turn counts vary widely.
- Smaller models such as Claude Haiku often struggle to produce working, high-quality integrations. They hallucinate concepts and write manual shims over legacy libraries.
- The Tempo MCP server can improve performance when agents can use it -- especially on less agentic models.

![A scatter plot of Stable Bench score versus aggregate cost for eight models, comparing documentation-only and MCP-enabled runs.](/blog/stable-bench-score-vs-cost.svg)

We report public benchmark results for Claude and Codex because they account for most of our observed agent traffic. The complete run data and source charts are available in the [tempo-evals repository](https://github.com/tempoxyz/tempo-evals).

## What comes next

We are actively using `stable-bench-v1` to shape our understanding of our developer experience and best practices for documentation. Using this as a baseline we are excited to ship:

- Continuous benchmarks that catch documentation regressions as coding agents improve and we update our documentation.
- Auto-research loops that ingest `stable-bench-v1` traces and automatically improve Tempo documentation and MCP surfaces.
- Additional benchmarks that use open models and harnesses, such as Kimi and OpenCode.

## An invite for collaboration

`stable-bench-v1` is open source today, alongside a suite of other evals in the [tempo-evals](https://github.com/tempoxyz/tempo-evals) repository. We welcome contributions from the ML research community, collaborators working on developer documentation, and any other eval practitioners.

## References

- [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Harbor Framework](https://harborframework.com/)
- [Terminal-Bench](https://www.tbench.ai/)
