import feeTokenFallback from '../../public/diagrams/t13/fee-token-fallback.svg?raw'
import prover from '../../public/diagrams/t13/prover.svg?raw'
import proverRollout from '../../public/diagrams/t13/prover-rollout.svg?raw'
import { docsZoneDiagram } from '../styles/surfaces.styles'

// Compiled from src/diagrams/**/*.mmd by Ondine. Run `pnpm diagrams` after editing a source.
const diagrams = {
  'fee-token-fallback': feeTokenFallback,
  prover,
  'prover-rollout': proverRollout,
}

/** Render a precompiled Mermaid diagram inline so it follows the site theme. */
export function OndineDiagram({
  name,
  alt,
  caption,
}: {
  name: keyof typeof diagrams
  alt: string
  caption?: string
}) {
  const label = alt.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
  const svg = diagrams[name].replace(/role="[^"]*"/, `role="img" aria-label="${label}"`)

  return (
    <figure className={`docs-zone-diagram ${docsZoneDiagram().className}`}>
      {/* Only checked-in SVG artwork is rendered; no remote or user-provided markup. */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local SVG source */}
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
