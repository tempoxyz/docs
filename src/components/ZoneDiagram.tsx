import accounts from '../../public/diagrams/zones/accounts.svg?raw'
import contracts from '../../public/diagrams/zones/contracts.svg?raw'
import crossZoneSend from '../../public/diagrams/zones/cross-zone-send.svg?raw'
import crossZoneSwap from '../../public/diagrams/zones/cross-zone-swap.svg?raw'
import deposit from '../../public/diagrams/zones/deposit.svg?raw'
import overview from '../../public/diagrams/zones/overview.svg?raw'
import policy from '../../public/diagrams/zones/policy.svg?raw'
import privacy from '../../public/diagrams/zones/privacy.svg?raw'
import protocolDeposit from '../../public/diagrams/zones/protocol-deposit.svg?raw'
import protocolWithdrawal from '../../public/diagrams/zones/protocol-withdrawal.svg?raw'
import settlement from '../../public/diagrams/zones/settlement.svg?raw'
import validation from '../../public/diagrams/zones/validation.svg?raw'
import withdrawal from '../../public/diagrams/zones/withdrawal.svg?raw'

const diagrams = {
  overview,
  contracts,
  policy,
  privacy,
  accounts,
  'protocol-deposit': protocolDeposit,
  'protocol-withdrawal': protocolWithdrawal,
  settlement,
  validation,
  deposit,
  withdrawal,
  'cross-zone-send': crossZoneSend,
  'cross-zone-swap': crossZoneSwap,
}

/** Render technical SVG diagrams inline, preserving theme tokens and selectable text. */
export function ZoneDiagram({
  name,
  alt,
  caption,
}: {
  name: keyof typeof diagrams
  alt: string
  caption?: string
}) {
  const label = alt.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
  const svg = diagrams[name].replace(
    '<svg',
    `<svg class="blog-diagram" role="img" aria-label="${label}"`,
  )

  return (
    <figure className="docs-zone-diagram">
      {/* Only checked-in SVG artwork is rendered; no remote or user-provided markup. */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local SVG source */}
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
