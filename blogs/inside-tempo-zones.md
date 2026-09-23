---
title: "Inside Tempo Zones"
excerpt: "How Tempo Zones keep transactions private while connecting to public infrastructure on Tempo Mainnet."
date: 2026-09-23
category: technical
authors: "Varun"
---

## Introduction

People expect payments they make and receive to be private. A payroll company, for example, should be able to pay contractors without disclosing the amount publicly. This is challenging on blockchains since activity is public by default and tied to pseudonymous addresses. If an address is connected back to a person or entity, their entire history becomes publicly known.

Tempo Zones address this problem with private execution environments that connect to Tempo Mainnet. Users can move funds into Zones to keep their transactions private, while still taking advantage of public infrastructure on Mainnet like bridges, vaults and exchanges. Transactions inside a Zone are visible to their participants and the Zone operator, but are private from the public.

![Three private Tempo Zones connect to Tempo Mainnet.](/blog/zones-overview.png)

## High level architecture

People often have trusted counterparties to financial transactions. For example, when receiving payroll people expect the business to be aware of how much they’re getting paid. Zones build on this trust boundary, giving users strong privacy guarantees and relying on the counterparty to run infrastructure to keep the transactions private.

Each Zone is a private execution environment run by an operator, which might be the payroll company in the example above. The operator runs sequencers, produces blocks and keeps all transaction data in their zone confidential. The operator has visibility into all balances and transactions and controls transaction ordering and inclusion into blocks. Users are only able to view their own balances.

The operator orders and executes transactions but cannot alter them or spend funds the user did not authorize. Operators must prove to mainnet that they executed transactions according to the rules of the protocol by producing a TEE proof, described in the prover section below. Mainnet accepts withdrawals from a Zone only after verifying this proof.

Funds are transferred into a Zone using a portal contract on Tempo Mainnet. A deposit to this contract locks tokens in the portal and credits an account on the Zone. Withdrawals do the opposite, burning Zone tokens and releasing deposits.

![Alice deposits and locks OUSD in a Mainnet portal, and the Zone sequencer credits her private Zone address.](/blog/zones-portal.png)

Privacy guarantees differ at each stage of a payment. On deposits, the destination address inside the Zone and the memo are encrypted while the sender, token amount, and destination Zone remain public. Within the Zone, transaction addresses, amounts, and timing are visible to the operator and participants, but not to the public. On withdrawals, a commitment hides the sender’s Zone address while the token amount and recipient remain public.

## Making a private payment

Suppose Alice wants to pay Bob privately with OUSD but has funds on Tempo Mainnet:

1. Alice signs a transaction to send OUSD to the Zone’s portal contract and encrypts the destination address with the operator’s published encryption key so that it is not publicly readable.

2. The sequencer follows Mainnet and recognizes the deposit, verifies the chain state, decrypts the destination address and credits Alice’s address on the Zone.

3. Alice checks her balance through the Zone’s RPC endpoint, providing a signature to prove ownership of her account.

4. Alice then signs a transaction to transfer the funds to Bob’s address in the Zone.

5. The sequencer includes the transaction in the next block and transfers the tokens to Bob.

![Alice deposits OUSD through a Zone portal and privately transfers funds to Bob within the Zone.](/blog/zones-private-payment.png)

## Interacting with mainnet while preserving privacy

Zones let users access exchanges, bridges, and offramps on Tempo Mainnet while keeping their transactions private. For example, Bob can deposit his OUSD privately from a Zone to a vault on Mainnet to earn rewards:

1. Bob submits a private Zone transaction instructing the sequencer to deposit his OUSD into a vault on Tempo Mainnet.

2. The sequencer executes the transaction and sends a message to the Zone portal on Tempo, using a blinded commitment instead of Bob’s address.

3. The portal deposits the funds into the vault through a router contract and receives vault tokens mapped to the blinded commitment.

4. The Zone operator now reads the new state from the portal, decodes the blinded commitment and credits Bob with the vault shares in the Zone.

![Bob accesses a Mainnet vault from a Zone through a portal and router while using a blinded commitment.](/blog/zones-mainnet-vault.png)

Bob can also selectively disclose his identity to a Mainnet recipient such as an offramp that needs to verify his identity before allowing him to move funds into a bank account.

## Verifying Zone transactions

Each Zone must demonstrate that its ledger was updated according to the protocol’s rules. This ensures that operators cannot misappropriate user funds, which always remain under the control of the user. The proving system works as follows:

1. The Zone operator prepares a witness with the new transactions, starting state and cryptographic proof needed to validate and replay transactions.

2. The Zone’s prover replays the witness inside a trusted execution environment, checking transaction authorization and execution rules.

3. The prover then produces an attestation binding the batch result to the Zone and the approved prover code that ran in the TEE.

4. Mainnet verifies the attestation before accepting the state update and withdrawals from the Zone.

Proving establishes that a batch follows the protocol’s execution rules, subject to the enclave’s security guarantees. Zone provers run inside AWS Nitro Enclaves, which are TEE’s that isolate execution and provide an attestation that lets Mainnet authenticate the prover’s execution. This gives Zones a practical, high-performance way to prove execution to the rest of the world. This proving architecture allows Zones to support different proving systems over time, including SNARK and STARK based proofs.

## Forced withdrawals

Forced withdrawals allow users to submit withdrawal requests directly on Mainnet. This acts as a failsafe if an operator decides to ignore withdrawal requests from an address. Each request encrypts the Zone address, recipient, and authorization signatures while the token amounts remain public, as with regular withdrawals. Tempo Mainnet requires that the operator import and process the request before the Zone can advance its state.

## Developer experience

Zones are designed for compatibility with the existing developer ecosystem. Developers can use familiar RPC endpoints, adding authentication signatures to access private data. Wallet providers such as [Privy](https://www.privy.io/) support Zones natively, so developers can get started with the wallets, APIs, and interfaces they already use.

## Enterprise controls for Zones

Enterprises can configure their Zones to support specific customers, assets, and workflows, aligned with their compliance requirements. For example, a payroll provider might limit participation to its customers and contractors, while enabling only the stablecoins it uses for payments. Businesses may want to screen incoming deposits and apply address restrictions at these boundaries.

Operators can modify the Zone configuration to only support specific assets and access permissions. They can also use TIP-403 policies to enforce transfer rules and import existing compliance logic from Mainnet. Operators can also configure a closed-loop Zone that supports a limited set of wallets, such as omnibus accounts, and restricts access to external contracts.

## Conclusion

Zones let businesses and users transact on Tempo with strong confidentiality and privacy guarantees. The Zones codebase is [open source](https://github.com/tempoxyz/zones/) and can be reviewed today.

We’re working closely with our first customer to bring privacy to real-world payouts and will announce our first Zone soon, allowing users to privately deposit funds and earn rewards from Mainnet vaults. Over the next few weeks, we plan to integrate the prover, forced withdrawals and general transfers between accounts. Contact our team for early access to Zones.
