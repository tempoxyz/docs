'use client'

import { skipToContent } from './DocsSkipToContent.recipes'

/** Docs disable Vocs' base tag, so a fragment stays on the public /developers URL. */
export function SkipToContent({ className }: { className?: string | undefined }) {
  return (
    <a {...skipToContent({ className })} data-v-skip-to-content href="#vocs-content">
      Skip to content
    </a>
  )
}
