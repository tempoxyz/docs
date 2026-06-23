---
title: "Introducing MPP Credits: fund your agent with a card"
excerpt: "MPP Credits are a new way for developers and agents to pay for MPP services using a credit or debit card, with merchants settling in stablecoins on Tempo."
date: 2026-06-17
category: technical
---

**MPP Credits are a new way for developers and agents to pay for MPP services using a credit or debit card. Buy credits from the Agent payments page in Tempo Wallet and let your agent spend on MPP-enabled services, with merchants settling in stablecoins on Tempo.** [Fund your agent →](https://wallet.tempo.xyz/agent)

The Machine Payments Protocol (MPP) is an open standard for machine payments, co-authored by Stripe and Tempo. Agents use it to pay for the things they need as they work, whether that's LLM inference, compute, data, or other API services.

Until now, funding an agent's wallet meant moving stablecoins onto Tempo first, which adds a step most developers don't want and many can't easily complete. Now, with MPP Credits, you can directly fund your agent with a card.

## What MPP Credits are

MPP Credits work like the API credits you already buy from developer platforms. You add a card, purchase credits, and your agent spends them at MPP services. The differences are under the hood: credits live in your Tempo Wallet, they work across every Tempo-proxied MPP service rather than a single provider, and merchants receive settlement in USDC.e on Tempo within seconds.

A few things to know:

- Credits are redeemable only at MPP services. See the full list at [mpp.dev/services](https://mpp.dev/services).
- Credits are prepaid and non-refundable. They can't be withdrawn, swapped for other tokens, or converted back to fiat. Treat them like API credits, not like a wallet balance.
- Credits are issued by Coinflow, a licensed payment service provider. Coinflow handles card processing and settles instantly with merchants in stablecoins.

## Why credits

Card onramps into crypto have historically lost a large share of users at the first payment step due to low authorization rates.

MPP Credits support credit and debit cards globally, plus Apple Pay and Google Pay, and saved cards for instant top-ups. Your agent runs out of funds mid-task, you approve a top-up, and it keeps working.

MPP was designed to support any payment method, including stablecoins and cards. Credits are the first card-based path into the protocol.

## How it works

1. Your agent calls an MPP-enabled API and receives a `402 Payment Required` response.
2. If the wallet has insufficient funds, run `tempo wallet fund`. For credit-enabled services, you're directed to a standard checkout at [wallet.tempo.xyz](https://wallet.tempo.xyz).
3. Enter your card once and save it, so future top-ups happen instantly.
4. Your agent spends credits at MPP services programmatically.

Check your balance and where it's accepted with `tempo wallet whoami --credits`.

## Get started

MPP Credits are accepted at Tempo-proxied MPP services, including LLM inference, compute, and data APIs. Browse the directory at [mpp.dev/services](https://mpp.dev/services).

Buy your first credits from [wallet.tempo.xyz/agent](https://wallet.tempo.xyz/agent), or point your agent at the Tempo CLI and let it walk you through funding when it hits its first 402.

Read the MPP spec and browse services at [mpp.dev](https://mpp.dev).
