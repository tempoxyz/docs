import { heroAmbientPlusPattern } from '../../_components/heroPattern'
import PlusCanvas from '../../_components/PlusCanvas'

// PlusCanvas patterns contain functions, so this keeps the pattern wiring in
// one place for the blog's featured cards.
export default function FeaturedVisual({
  className,
  heroHtml,
}: {
  className?: string
  heroHtml?: string
}) {
  if (heroHtml) {
    return (
      <div
        className={`blog-prose blog-hero-image flex h-full items-center p-4 ${className ?? ''}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted build-time blog asset
        dangerouslySetInnerHTML={{ __html: heroHtml }}
      />
    )
  }
  return <PlusCanvas className={className} pattern={heroAmbientPlusPattern} />
}
