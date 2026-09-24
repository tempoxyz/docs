---
title: "Inside Tempo Zones"
description: "Explore the architecture behind Tempo Zones: private balances, batch validation, public liquidity, and tradeoffs that make privacy practical for stablecoin wallets."
excerpt: "Explore the architecture behind Tempo Zones: private balances, batch validation, public liquidity, and tradeoffs that make privacy practical for stablecoin wallets."
date: 2026-09-17
category: technical
heroImage: /blog/inside-tempo-zones/overview.svg
heroImageAlt: "Tempo Zones connect private wallet activity to the Tempo ecosystem."
---

*The hero and architecture diagrams show the intended design, including work in progress. As of September 23, 2026, Nitro attestation generation and a T13 verifier are implemented in source, but approved production enclave measurements remain unset. Forced exits remain unfinished. See the [current implementation status](/docs/protocol/zones/proving).*

At Tempo, we believe businesses should be able to use stablecoin wallets without making their customers’ finances public. For instance, a payroll company should be able to pay its contractors without exposing individual customer balances or their payment history.

That’s why we [introduced Tempo Zones](https://tempo.xyz/blog/privacy-on-tempo/) earlier this year. Since then, we’ve worked closely with our customers on design and implementation, starting with private balances and [earn](https://tempo.xyz/solutions/earn/) positions for non-custodial wallets.

It has been important to us and our customers that privacy comes with no additional complexity. It should just work with all of the existing tools and products they’re used to, and it should ensure their users can stay connected to the ecosystem of assets, ramps, and applications that Tempo has to offer.

In this post, we want to go over some of the architecture decisions and tradeoffs that we’ve made in this first version of Tempo Zones, and let you know what’s coming next.

## The architecture

A [Tempo Zone](/docs/protocol/zones/architecture) is a private ledger designed for non-custodial wallets. It runs a version of Tempo’s execution environment that connects to the public ledger of Tempo Mainnet. All assets on a Zone are backed by balances held in a settlement contract on Tempo Mainnet.

A deposit locks funds in the settlement contract and mints the corresponding tokens privately on the Zone. Withdrawals burn funds on the Zone before releasing them on Mainnet. The settlement design includes an execution proof of that transition; sequencer signatures authenticate the batch, and a configured prover adds a Nitro attestation. Enforcement depends on the deployed verifier and its approved enclave measurements.

Each Zone has an operator that orders transactions, maintains the private ledger, and submits settlement batches when funds need to be withdrawn.

The execution validator checks groups of transactions, deposits, and withdrawals called “batches” against Tempo’s protocol rules. An enforcing proof system must bind that result to settlement without revealing the individual transactions.

![Private Zone ledger backed by assets in a settlement contract on Tempo Mainnet.](/blog/inside-tempo-zones/architecture.svg)

*Mainnet holds the backing assets and settlement commitments, while the Zone keeps the account ledger private.*

Getting interoperability right has been a very high priority for us. For example, if a user has a private stablecoin balance on a Zone and wants to deposit their funds privately into [Tempo Earn](https://tempo.xyz/blog/introducing-tempo-earn/), they need to be able to get the best rates available to them on popular earn vaults such as Morpho.

Users expect that “Earn Deposit” transaction to happen immediately. Sub-second batch validation is our latency target, so transactions which require a withdrawal or a deposit can feel as fast as a regular Tempo transaction.

### How proofs work

Proofs verify that the Tempo protocol was executed correctly: for instance, every transaction must be signed by the user’s private key and all EVM rules have been followed.

We’ve built a [prover](/docs/protocol/zones/proving) that checks execution by replaying each batch. It can run inside an AWS Nitro trusted execution environment, or TEE. Its Nitro attestation identifies the code it ran and binds that code to the batch result.

The enclave service returns the validated batch result and a signed attestation without publishing the private transactions. A sequencer configured to use it waits for that attestation before submitting the batch.

Tempo’s T13 source includes a native verifier that authenticates this attestation and binds it to the batch. Its production enclave measurements are not yet configured at the reviewed commit, so it rejects proofs. The Solidity reference verifier remains a stub that accepts proof inputs without checking them. The active network runtime and verifier configuration determine a deployed Zone’s guarantees.

![A trusted execution environment attests to batch execution for verification on Mainnet.](/blog/inside-tempo-zones/proofs.svg)

*Attested verification flow: the verifier must authenticate the batch result against approved enclave measurements before accepting settlement.*

## The privacy landscape

On public blockchains today, all addresses, transactions, and balances are public by default. Some of our customers have tried to rely on pseudonymous addresses, which do not directly identify their owners but can be linked to them through transaction history and other information.

Although it is possible to obfuscate customer data this way, or create layers of indirection by creating multiple accounts to try to mask important private data, we think this is ultimately quite dangerous. Especially with AI becoming so efficient at analyzing blockchain data, we think this is no longer a viable option for privacy on blockchains.

![Privacy matrix: pseudonymity reveals links and amounts, anonymity hides links, confidentiality hides amounts, and full privacy hides both.](/blog/inside-tempo-zones/pseudonymity.svg)

Two alternatives to pseudonymity today are to:

- Hide balances and transfer amounts (confidentiality), or

- Hide the links between accounts (anonymity).

Confidential tokens encrypt balances and transfer amounts at the token level while leaving the accounts involved visible. This hides how much each account holds and sends, but still reveals which accounts transact with each other and how often.

These transfers require cryptographic proofs that the sender has enough funds and that balances are updated correctly, without revealing the amounts. Wallet providers must support this proof generation and transfer flow, adding integration work for the systems our customers already use.

Another approach is to pool activity together, making it harder to connect transactions to individual users. These systems sometimes use zero-knowledge proofs to verify transfers without revealing who is sending or receiving funds. However, their effectiveness depends partly on having enough other activity to blend into (known as the anonymity set).

Building a large, active set requires users and providers to adopt the same standard, which has been difficult to do in practice.

Opening the pool to everyone can provide more anonymity, but businesses need ways to exclude prohibited activity, including funds associated with sanctioned addresses.

Our customers want balances and payment relationships to be private from the public. They also need to set rules for their business and work with their existing wallet and payment providers.

![Public deposits and withdrawals surround a private internal Zone ledger.](/blog/inside-tempo-zones/privacy.svg)

*With Zones, Mainnet records the Zone’s deposits and withdrawals. The internal account ledger stays private, although public amounts and timing can still allow observers to infer connections.*

For our customers, privacy also needs to meet several practical requirements:

- **Privacy with existing wallets and vendors.** Today, most privacy solutions require special wallet support, added client-side cryptography (e.g., on the user’s device), or new custom APIs.

- **Access to public liquidity.** Isolated private ledgers cut users off from ramps, asset vaults, DEXes, and more, which are hard requirements in real deployments.

- **Compliance and controls**. Many privacy solutions make it more difficult (or impossible) for a business to meet its compliance and regulatory requirements.

- **Latency and reliability.** Usually introducing a privacy solution has come with long waits for proof generation or restrictions to specific devices.

- **Non-custodial guarantees.** For customers using non-custodial wallets, they need to ensure that any privacy solution doesn’t get in the way of the rights of the user to always be able to exit their funds safely and reliably.

## How we approach those tradeoffs

### Privacy with existing wallets and vendors

For our customers, keeping financial activity private from the public still needs to leave their finance and support teams able to do their jobs. They need to reconcile payments, understand balances, and help a user when something goes wrong.

For the early Zones we operate, Tempo API gives authorized teams and wallet providers access to balances, transaction history, and status without publishing that information onchain. Users can [read their own accounts](/docs/protocol/zones/rpc#method-access-control), while the operator has visibility across the Zone.

Wallet providers like Privy have integrated with Tempo API so that existing wallets can optionally move their funds onto a Zone using the same wallet ID, address, and APIs that already work on Tempo Mainnet.

This way, a business can simply opt in to using Tempo Zones without needing to create a separate wallet for each user or even changing any of its existing wallet APIs.

![Authorized teams read private balances through Tempo API while users sign transactions.](/blog/inside-tempo-zones/wallet-access.svg)

*Tempo API handles authorized balance reads, while spending requires a signed transaction.*

### Access to public liquidity

#### Encrypted deposits and withdrawals

To maintain privacy on the way into a Zone (i.e., deposits) the recipient’s private address and memo are [encrypted with the operator’s published key](/docs/protocol/zones/bridging#encrypted-deposits). Tempo Mainnet records the asset and amount. After the deposit is accepted, the Zone decrypts the deposit and credits the account privately.

For withdrawals, we require a signed instruction to reduce the private balance and release assets on Mainnet. We include a [commitment to the sender’s address and private transaction hash](/docs/protocol/zones/bridging#verifiable-withdrawals) so a counterparty can verify who paid them when those details are shared. This is useful for an offramp, for example, to be able to verify that the funds came from one of their known customers while preserving that customer’s privacy.

![Encrypted account details preserve privacy when depositing to or withdrawing from a Zone.](/blog/inside-tempo-zones/deposits-withdrawals.svg)

*Amounts are public on entry and exit, but Mainnet does not name the account receiving or sending funds.*

#### Atomic Zone transactions

For a customer offering earn, access to public liquidity means their users should be able to deposit into the same vaults they would use on Mainnet, directly from a private balance. To make this work, a withdrawal can include a [callback](/docs/protocol/zones/bridging#composable-withdrawals), which is an instruction to call an approved Mainnet contract once the funds are released.

For example, an Earn deposit can withdraw stablecoins from the Zone, deposit them into a vault, and deposit the resulting vault shares back into the Zone’s settlement contract, with the recipient encrypted. These steps execute atomically on Mainnet, meaning they either all succeed or revert together. The same mechanism can include a DEX swap if the vault needs a different asset, without asking the user to sign each step separately.

![An atomic transaction withdraws stablecoins, deposits into an earn vault, and returns shares to the Zone.](/blog/inside-tempo-zones/atomic-transactions.svg)

The Zone then processes the return deposit and credits the shares to the user’s private account. The vault interaction and its amounts are still public, but the record of which user owns those shares stays private. This way, our customers can offer access to existing liquidity and earn vaults without having to build a separate private version of each product.

### Compliance and controls

To meet their compliance requirements, our customers need to ensure that neither their business wallets nor the wallets of their users interact with sanctioned or known malicious actors or tokens.

So, similar to [address-level receive policies](/docs/protocol/tip403/receive-policies) which let individual wallets screen inbound transfers, we’ve made it possible to screen deposits at an organizational level with Zones.

The operator can call the screening services a business already uses, such as Chainalysis or TRM, before accepting a deposit. During screening, the funds remain locked on Tempo Mainnet. The Zone credits accepted deposits to the user’s private balance and refunds rejected deposits through the defined refund path to the specified return address.

![Deposit screening either credits the private account or refunds the specified return address.](/blog/inside-tempo-zones/screening.svg)

*A screened deposit either credits the private account or follows the refund path.*

Customers can also set rules for the activity that happens inside and at the edges of their business’s Zone using [TIP-403 policies](/docs/protocol/tip403/overview). For example, a Zone can support only a specific set of [TIP-20 tokens](/docs/protocol/tip20/overview) and restrict which wallets can send and receive those assets.

Zone execution enforces these rules, and the stateless validator checks them during replay. Enforcing that validation onchain requires an active attestation verifier with approved enclave measurements.

Of course, being able to set those rules should not give the operator custody of users’ funds. The token issuer’s restrictions still apply, but a Zone operator should not be able to trap a user’s money simply by refusing to process a withdrawal. That’s why we’re building a way for users to exit without the operator’s permission.

### Latency and reliability

A private payment still needs to be verified without making its details public. One option is to generate a proof on the user’s device. This can keep the underlying data private even from the service provider, but it also puts the computation on that device. And while the technology is improving, unfortunately the time it takes and the devices it can run today are still not good enough for high quality user experiences on any user device.

For our customers, there is a reasonable alternative since people using a fintech or neobank already trust that business with their financial data. Zones let the business, or an operator it delegates to, take on proof generation within that pre-existing trust boundary.

The user signs a transaction and submits it through an API, whether they’re using an Apple Watch, an iPhone, an Android phone, an embedded device, or if they’re on a website. Their device does no computational proving work and instead, that work gets done behind high-availability APIs, with monitoring and recovery handled centrally.

![User devices sign transactions while the Zone operator handles proof generation.](/blog/inside-tempo-zones/proving.svg)

Trusted Execution Environments (TEEs) are the approach we’re pursuing for sub-second validation. An attested system relies on the secure enclave’s hardware manufacturer and its attestation infrastructure. For enterprise payments, we think that is a reasonable tradeoff for fast proving and consistent performance across devices.

We’ve designed Zones so the proving approach can evolve. As the technology matures, we’re open to experimenting with zero-knowledge proofs such as SNARKs and STARKs, or other approaches to private computation such as multi-party computation (MPC) or fully-homomorphic encryption (FHE).

Our choice of TEEs reflects what we think works best for our customers today, while leaving room to adopt better approaches as they become practical.

### Non-custodial guarantees

For Tempo Zones, it is a hard requirement that all user funds must be able to exit the zone unilaterally, regardless of operator co-operation. So, any wallet with funds in a Zone needs a way to request a withdrawal without asking the operator to accept the transaction.

To achieve this, we’re building a forced-exit path that lets a user sign a withdrawal and submit it directly to Tempo Mainnet to force an exit. Before the Zone can prove that it has progressed past the request, it must process it. Otherwise, the Zone ceases to function (i.e., it is a built-in part of a valid batch proof).

Once implemented and enforced by settlement, this would prevent Zone operators from ignoring an exit request while continuing to advance the private ledger under their compliance rules.

![A signed Mainnet withdrawal request must be processed before the Zone can advance past it.](/blog/inside-tempo-zones/forced-exits.svg)

*Planned forced-exit flow: Mainnet records the signed request, and the Zone must process it before advancing past it in the queue.*

## What’s next

We’re actively working with customers to bring stablecoins into their businesses and make their users’ balances and activity private with Zones. If you’re building something that needs this, we’d love to work with you. [Get in touch](https://tempo.xyz/contact/) and tell us what you’re working on.

We’ve found that privacy works best when we work closely with infrastructure partners to bring it into the custodial and non-custodial wallet products our customers use. If you’re an infrastructure provider interested in supporting our customers or offering privacy to your own, [get in touch](https://tempo.xyz/contact/). We’d love to explore how Tempo Zones can work with your products.

If you’re a developer looking to go deeper, explore our [Tempo Zones integration guides](/docs/guide/private-zones) or read the code in the [Tempo GitHub repository](https://github.com/tempoxyz/tempo).

## Frequently asked questions

**When can we start using Zones?**

Zones are live, and we’re working with customers to integrate them into their businesses. [Get in touch](https://tempo.xyz/contact/) and tell us what you’re building.

**What does it cost to run a Zone?**

Contact us to discuss pricing for your use case. Let us know whether you’re interested in a fully hosted Zone or running one on your own infrastructure.

**Can we make existing customer balances private, or only new deposits?**

Existing wallets can move assets from Mainnet into a Zone through a deposit. Subsequent activity inside the Zone is private, but moving funds into a Zone does not hide their previous public transaction history.

**Do our users need to know they’re using a Zone?**

Your application can handle Zone interactions through familiar wallet APIs, so users don’t need to learn a new wallet interface. You decide how to introduce privacy and whether users need to opt in.

**Who can see activity inside a Zone?**

Balances and transaction history are private from the public, but the operator and authorized providers can access the information they need to serve users. That access does not give them permission to spend users’ funds.

**Who runs the Zone? Can we run our own?**

Tempo provides fully hosted Zones, but the software is open source and we can help you run one on your own infrastructure. Running your own Zone involves additional integration work with wallet providers and other services, which we’re working to make easier.

**What happens if the operator goes offline?**

We’re building a failover mechanism so users can still withdraw their funds if a Zone operator goes offline or stops operating entirely.

**How secure are TEEs?**

TEEs isolate sensitive computation and provide cryptographic evidence of the code that ran, with security that depends on the underlying hardware and software. [1Password](https://support.1password.com/confidential-computing-security/), [Fireblocks](https://developers.fireblocks.com/docs/aws-nitro-api-co-signer), and [Privy](https://docs.privy.io/guide/security/architecture/) already use AWS Nitro Enclaves in deployed products, while Apple uses its own secure hardware architecture for [Private Cloud Compute](https://security.apple.com/blog/private-cloud-compute/).

**Can we choose where our Zone runs and where its data is stored?**

Share your hosting location or data residency requirements with us early so we can assess which deployment options meet them.

**Can we start with a hosted Zone and run it ourselves later?**

You can run the open-source Zone software on your own infrastructure, but moving an existing Zone also requires planning for its data and provider integrations. Talk to us early to plan that transition.
