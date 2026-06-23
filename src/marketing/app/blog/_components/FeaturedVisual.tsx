import { heroAmbientPlusPattern } from '../../_components/heroPattern'
import PlusCanvas from '../../_components/PlusCanvas'

// PlusCanvas patterns contain functions, so this keeps the pattern wiring in
// one place for the blog's featured cards.
export default function FeaturedVisual({ className }: { className?: string }) {
  return <PlusCanvas className={className} pattern={heroAmbientPlusPattern} />
}
