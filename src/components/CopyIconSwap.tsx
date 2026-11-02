import type { ReactNode } from 'react'

/** G7: one copy-feedback pattern. Both icons stay mounted and cross-fade, so the
 * swap has an enter and an exit; the check takes content primary (styles/copyFeedback.ts). */
export function CopyIconSwap({
  copied,
  copyIcon,
  checkIcon,
}: {
  copied: boolean
  copyIcon: ReactNode
  checkIcon: ReactNode
}) {
  return (
    <span className="tempo-icon-swap" data-copied={copied ? '' : undefined} aria-hidden="true">
      <span data-icon="idle">{copyIcon}</span>
      <span data-icon="done">{checkIcon}</span>
    </span>
  )
}
