import feeTokenFallback from '../../public/diagrams/t13/fee-token-fallback.svg?raw'
import prover from '../../public/diagrams/t13/prover.svg?raw'
import proverRollout from '../../public/diagrams/t13/prover-rollout.svg?raw'
import { docsZoneDiagram } from '../styles/surfaces.styles'

// Compiled from src/diagrams/**/*.mmd by Ondine. Run `pnpm diagrams` after editing a source.
// Colors come from the --ondine-* rules in globals.ts; node classes (:::zone, :::portal,
// :::accent, :::muted) and the subgraph IDs zone and tempo select the Tempo diagram palette.
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
  const hatch = `ondine-hatch-${name}`
  const svg = diagrams[name]
    .replace(/role="[^"]*"/, `role="img" aria-label="${label}"`)
    // Hatched fill for private Zone regions, as in the tempo.xyz Zone diagrams.
    .replace(
      /(<svg[^>]*>)/,
      `$1<defs><pattern id="${hatch}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" class="ondine-hatch-bg"/><path d="M0 0V8" class="ondine-hatch-line"/></pattern></defs>`,
    )
    .replace(
      /(<g class="ondine-cluster" data-id="zone"><rect [^>]*?)fill="var\(--_a\)"/,
      `$1fill="url(#${hatch})"`,
    )

  return (
    <figure className={`docs-zone-diagram ${docsZoneDiagram().className}`}>
      {/* Only checked-in SVG artwork is rendered; no remote or user-provided markup. */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local SVG source */}
      <div className="ondine-canvas" dangerouslySetInnerHTML={{ __html: svg }} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
