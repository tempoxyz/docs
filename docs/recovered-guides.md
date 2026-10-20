# Recovered payment and integration guides

The source conversation is **Build Tempo ecosystem pages** (`01a12d2d-fef6-7bc2-ac99-f64757946bad`). The initial recovery adapts the reviewed educational content from [website PR #158](https://github.com/tempoxyz/tempo.xyz/pull/158) and the three provider-selection guides from [website PR #155](https://github.com/tempoxyz/tempo.xyz/pull/155) into native documentation. The follow-up also adapts the 13 partner profiles from [website PR #150](https://github.com/tempoxyz/tempo.xyz/pull/150) into provider-specific Docs guides. This lets the documentation ship independently of the website ecosystem work.

## Scope and navigation

- 26 substantive educational and provider-selection pages, plus their index.
- 13 partner-specific integration guides, plus their index at `/docs/resources/partners`.
- Three existing implementation guides absorb recovered fee-sponsorship, transfer-memo, and mint/burn operating details.
- Get Started → Resources → Guides is collapsed by default. Its topic groups are also collapsed. No primary navigation section is added.
- Get Started → Resources → Partner guides is also collapsed by default, with collapsed provider categories. Existing Partners and educational guide indexes link to it.
- Every published page remains in the normal search, sitemap, and generated Markdown/AI inventory. The submenu changes visual prominence, not crawler access.
- No marketing website pages, ecosystem cards, or historical redirects are changed.

## Source coverage

The previous recovery reviewed 235 historical MDX drafts: 210 from [Docs PR #36](https://github.com/tempoxyz/docs/pull/36) and 25 from [tempo-web PR #483](https://github.com/tempoxyz/tempo-web/pull/483). It consolidated repeated intent and withheld unsupported premises. [The complete ledger](recovered-guide-mapping.csv) retains all 235 decisions plus four supporting notes and adds the applicable documentation destination. An empty destination retains the recorded source decision; it does not imply that a withheld integration is supported.

This change uses the reviewed recovery rather than importing the raw archive. It preserves source-specific availability, onchain/fiat delivery boundaries, hypothetical example labels, and explicit regulatory dates. The provider-selection pages use official provider instructions or maintained Docs partner categories, without linking to unpublished ecosystem profiles.

## Documentation destinations

| Recovered topic | Destination |
| --- | --- |
| 402-payment-required | [/docs/resources/guides/402-payment-required](/docs/resources/guides/402-payment-required) |
| batch-payments | [/docs/resources/guides/batch-payments](/docs/resources/guides/batch-payments) |
| blockchain-payments | [/docs/resources/guides/blockchain-payments](/docs/resources/guides/blockchain-payments) |
| cross-border-payments-latin-america | [/docs/resources/guides/cross-border-payments-latin-america](/docs/resources/guides/cross-border-payments-latin-america) |
| cross-border-payments | [/docs/resources/guides/cross-border-payments](/docs/resources/guides/cross-border-payments) |
| fbo-accounts | [/docs/resources/guides/fbo-accounts](/docs/resources/guides/fbo-accounts) |
| genius-act | [/docs/resources/guides/genius-act](/docs/resources/guides/genius-act) |
| global-payouts | [/docs/resources/guides/global-payouts](/docs/resources/guides/global-payouts) |
| how-to-accept-stablecoin-payments | [/docs/resources/guides/how-to-accept-stablecoin-payments](/docs/resources/guides/how-to-accept-stablecoin-payments) |
| microtransactions | [/docs/resources/guides/microtransactions](/docs/resources/guides/microtransactions) |
| nostro-vostro-accounts | [/docs/resources/guides/nostro-vostro-accounts](/docs/resources/guides/nostro-vostro-accounts) |
| payment-rails | [/docs/resources/guides/payment-rails](/docs/resources/guides/payment-rails) |
| payment-reconciliation | [/docs/resources/guides/payment-reconciliation](/docs/resources/guides/payment-reconciliation) |
| prefunding | [/docs/resources/guides/prefunding](/docs/resources/guides/prefunding) |
| stablecoin-payment-infrastructure-enterprise-scale | [/docs/resources/guides/stablecoin-payment-infrastructure-enterprise-scale](/docs/resources/guides/stablecoin-payment-infrastructure-enterprise-scale) |
| stablecoin-payroll-for-global-teams | [/docs/resources/guides/stablecoin-payroll-for-global-teams](/docs/resources/guides/stablecoin-payroll-for-global-teams) |
| stablecoin-settlement | [/docs/resources/guides/stablecoin-settlement](/docs/resources/guides/stablecoin-settlement) |
| stablecoins-for-business | [/docs/resources/guides/stablecoins-for-business](/docs/resources/guides/stablecoins-for-business) |
| compliance-controls | [/docs/resources/guides/compliance-controls](/docs/resources/guides/compliance-controls) |
| corporate-treasury | [/docs/resources/guides/corporate-treasury](/docs/resources/guides/corporate-treasury) |
| remittances | [/docs/resources/guides/remittances](/docs/resources/guides/remittances) |
| stablecoin-fees | [/docs/resources/guides/stablecoin-fees](/docs/resources/guides/stablecoin-fees) |
| subscriptions-on-tempo | [/docs/resources/guides/subscriptions-on-tempo](/docs/resources/guides/subscriptions-on-tempo) |
| embedded-wallets | [/docs/resources/guides/embedded-wallets](/docs/resources/guides/embedded-wallets) |
| funding-and-payouts | [/docs/resources/guides/funding-and-payouts](/docs/resources/guides/funding-and-payouts) |
| payment-screening | [/docs/resources/guides/payment-screening](/docs/resources/guides/payment-screening) |
| fee-sponsorship | [/docs/guide/payments/sponsor-user-fees](/docs/guide/payments/sponsor-user-fees) |
| transfer-memos | [/docs/guide/payments/transfer-memos](/docs/guide/payments/transfer-memos) |
| mint-and-burn | [/docs/guide/issuance/mint-stablecoins](/docs/guide/issuance/mint-stablecoins) |

## Partner profile recovery

The partner guides retain the original profiles' capability, prerequisite, operating-consideration, FAQ, and primary-source content, refreshed against current provider instructions. They use native MDX rather than the marketing website's generated components. General provider coverage does not imply support for every SDK, asset, or endpoint.

| Original profile | Documentation destination |
| --- | --- |
| Privy | `/docs/resources/partners/privy` |
| Dynamic | `/docs/resources/partners/dynamic` |
| Turnkey | `/docs/resources/partners/turnkey` |
| Fireblocks | `/docs/resources/partners/fireblocks` |
| Bridge | `/docs/resources/partners/bridge` |
| Alchemy | `/docs/resources/partners/alchemy` |
| QuickNode | `/docs/resources/partners/quicknode` |
| Allium | `/docs/resources/partners/allium` |
| Goldsky | `/docs/resources/partners/goldsky` |
| TRM | `/docs/resources/partners/trm` |
| Chainalysis | `/docs/resources/partners/chainalysis` |
| Elliptic | `/docs/resources/partners/elliptic` |
| Blockaid | `/docs/resources/partners/blockaid` |

The website draft and its directory cards are unchanged. No unpublished ecosystem route is required to read or use these Docs guides.

## Verification

Validation results are recorded in the pull request. Publication requires a successful deployment and verification at the canonical `/developers` mount. Local output and a preview are not production proof.

## Editorial and claim review

The October 19, 2026 follow-up review checks the 26 recovered guides, their index, and the implementation content incorporated during recovery against Tempo's writing guidance and current primary sources. It distinguishes token permissions from regulatory authorization, issuer redemption access from minting functions, and onchain delivery from provider or bank completion.

The corrections clarify access-key allowances and scopes, Fee AMM conversion, payroll eligibility, deposit-insurance conditions, screening coverage, and sandbox limitations. Search titles and opening answers identify each guide's subject and task; relevant FAQs address operating decisions. Existing routes, heading anchors, and the collapsed navigation remain in place. This editorial review does not establish legal approval of a particular customer arrangement.
