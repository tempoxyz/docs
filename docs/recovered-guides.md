# Recovered payment and integration guides

This reconciliation accounts for every original guide draft from Docs PR #36 and tempo-web PR #483. It compares the archived body with current content, restores missing useful tasks, and records unsupported material separately. The source conversation is **Build Tempo ecosystem pages** (01a12d2d-fef6-7bc2-ac99-f64757946bad).

## Archive inventory

| Source | Original content files | Pinned revision |
| --- | --- | --- |
| [Docs PR #36](https://github.com/tempoxyz/docs/pull/36) | 210 MDX files: 208 article/profile bodies and two navigation indexes. | 6fd45c89ead49e05df826a648f500e3a9d82257f |
| [tempo-web PR #483](https://github.com/tempoxyz/tempo-web/pull/483) | 25 MDX article bodies and four editorial/support notes. | d5456a5f89e6e6b05e7f4028dafec9beffd10d30 |

There are **233 article/profile bodies, two indexes, and four notes: 239 source files**. The commonly used 235-page count includes the two indexes. PR titles and prospective glossary plans are not additional written articles.

The [pinned source inventory](recovered-guide-source-inventory.json) lists every original path and the seven other modified build, analytics, and protocol files excluded from the article count. All 239 archived file hashes were checked against the source hashes in the ledger.

## Reconciliation decisions

| Decision | Source files | Meaning |
| --- | ---: | --- |
| Restored | 13 | Added missing useful content: two operational tasks, seven provider distinctions, and four settlement/corridor explanations. |
| Covered | 51 | The useful intent is already explained by the specified current canonical content. |
| Consolidated | 88 | Retained a narrower useful task in current guides or maintained provider instructions; excluded obsolete code, duplicate positioning, and unsupported claims. |
| Withheld | 81 | The original premise lacks current support. General references are recorded separately and do not count as recovered coverage. |
| Navigation | 2 | Replaced archive indexes with the current Guides and Partners indexes. |
| Support note | 4 | Accounted for editorial templates, rollout plans, and press notes without presenting them as articles. |
| **Total** | **239** | **Every original path has exactly one decision.** |

The 152 restored, covered, or consolidated article intents are not 155 new pages. The 81 withheld premises comprise 48 country/regional send templates, 15 unsupported provider flows, 15 dated legal or unsupported vertical/asset/savings claims, two bank-marketing stubs, and one retired protocol comparison.

## Content restored in this pass

- [Create payment links](https://tempo.xyz/developers/docs/resources/guides/payment-links): trusted request records, shareable URLs and QR codes, payment attempts, ordinary and virtual-address delivery checks, and invoice state.
- [Handle stablecoin refunds](https://tempo.xyz/developers/docs/resources/guides/refunds): verified originals, safe return destinations, partial-amount reservations, concurrent requests, and uncertain submissions.
- [Compare payment rails](https://tempo.xyz/developers/docs/resources/guides/payment-rails#read-settlement-timing-and-netting-terms): RTGS versus net settlement and T+0/T+1/T+2 business-day notation.
- [Remittance operations](https://tempo.xyz/developers/docs/resources/guides/remittances): corridor definition and a sourced Philippine local-rail example that does not imply Tempo corridor availability.
- Existing [wallet](https://tempo.xyz/developers/docs/partners/wallets), [bridge](https://tempo.xyz/developers/docs/partners/bridges), and [data](https://tempo.xyz/developers/docs/partners/data-and-oracles) entries: current BitGo, Crossmint, DFNS, Para, Across, Chainlink CCIP, and Zerion implementation distinctions.

The pass also removes redundant native DEX approval instructions and demo calls, following the TIP-20 implicit-approval specification. It preserves swap/order operations, slippage controls, balance checks, transfer policies, spending limits, and old heading anchors.

## Reading the ledger

The [complete ledger](recovered-guide-mapping.csv) retains source paths, pinned source URLs, original SHA-256 hashes, current decisions, exact reader destinations, content evidence, excluded claims, and the reconciliation date. Fields beginning with previous_ preserve the older review history; they are not current publication proof.

Live destinations identify retained coverage. Reference destinations provide adjacent guidance for withheld premises. Coverage evidence identifies the source documents and current implementation basis. A provider's general documentation, a directory entry, or an HTTP 200 alone does not prove that the archive's complete integration tutorial works.

Country templates are withheld where the exact origin, customer eligibility, asset/network, provider, conversion, and local-delivery route is unverified. Dated licensing rules, guaranteed savings, free FX, bank-account equivalence, and unsupported asset listings are not republished. Organic underlying returns can use yield; boosted returns use rewards or Earn.

## Navigation and verification

The 28 recovered task guides remain under **Get Started → Resources → Guides**, with collapsed topic groups and visible category breadcrumbs. Existing website coverage is reused where it already serves the reader. The former 13 standalone partner overviews remain redirected to task sections. The website ecosystem work stays independent.

Run the source/decision checks:

~~~sh
python3 scripts/verify-recovered-guides.py
~~~

After a production build, check destinations and anchors against that output:

~~~sh
python3 scripts/verify-recovered-guides.py --build-dir .vercel/output/static
~~~

After deployment succeeds, compare public HTML, anchors, canonical URLs, and Markdown hashes with that same build:

~~~sh
python3 scripts/verify-recovered-guides.py --live --build-dir .vercel/output/static --output /tmp/recovered-guides-live.json
~~~

The optional --archive-dir argument verifies the original file hashes against locally materialized pinned source files, using the archive directories named in the inventory. Editorial review establishes the retained meaning; the verifier establishes inventory completeness and destination integrity. Provider-authenticated operations were source-checked, not executed. A merge or preview alone is not production proof.
