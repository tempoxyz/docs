// biome-ignore-all lint/a11y/noSvgWithoutTitle: Mega-menu glyphs are decorative and paired with visible menu labels.

import type { ReactNode } from 'react'

// Shared stroke style for the mega-menu glyphs. 24px viewbox to match
// ArrowUpRight; rendered at 18px inside the menu's icon tiles.
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function PoliciesIcon() {
  return (
    <Glyph>
      <path d="M12 3 19 6v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 11.5l2 2 4-4" />
    </Glyph>
  )
}

export function TransactionsIcon() {
  return (
    <Glyph>
      <path d="M7 8h10M14 5l3 3-3 3" />
      <path d="M17 16H7M10 13l-3 3 3 3" />
    </Glyph>
  )
}

export function AgenticIcon() {
  return (
    <Glyph>
      <path d="M12 3.5l1.6 6.9 6.9 1.6-6.9 1.6-1.6 6.9-1.6-6.9L3.5 12l6.9-1.6z" />
    </Glyph>
  )
}

export function TokensIcon() {
  return (
    <Glyph>
      <circle cx="9.5" cy="12" r="4.5" />
      <circle cx="14.5" cy="12" r="4.5" />
    </Glyph>
  )
}

export function DocsIcon() {
  return (
    <Glyph>
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Glyph>
  )
}

export function QuickstartIcon() {
  return (
    <Glyph>
      <path d="M13 3 6 13h5l-1 8 8-11h-6l1-7z" />
    </Glyph>
  )
}

export function WalletIcon() {
  return (
    <Glyph>
      <rect x="4" y="6.5" width="16" height="12" rx="2.5" />
      <path d="M4 9.5h12a2 2 0 0 1 2 2" />
      <circle cx="16.5" cy="12.5" r="1" />
    </Glyph>
  )
}

export function FaucetIcon() {
  return (
    <Glyph>
      <path d="M12 3.5c3.5 4.3 5.3 7.2 5.3 10a5.3 5.3 0 0 1-10.6 0c0-2.8 1.8-5.7 5.3-10Z" />
      <path d="M10 16.5c1.5 1 3.5.5 4.4-1" />
    </Glyph>
  )
}

export function ApiIcon() {
  return (
    <Glyph>
      <path d="M9 5c-2 0-2 2-2 3.4 0 1.4-.4 2.6-2 2.6 1.6 0 2 1.2 2 2.6C7 17 7 19 9 19" />
      <path d="M15 5c2 0 2 2 2 3.4 0 1.4.4 2.6 2 2.6-1.6 0-2 1.2-2 2.6C17 17 17 19 15 19" />
    </Glyph>
  )
}

export function ExplorerIcon() {
  return (
    <Glyph>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m15 15 4 4" />
      <path d="M8.5 11h5M11 8.5v5" />
    </Glyph>
  )
}

export function SdkIcon() {
  return (
    <Glyph>
      <path d="M12 3 20 7v10l-8 4-8-4V7z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </Glyph>
  )
}

export function McpIcon() {
  return (
    <Glyph>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 7V4M15 7V4M9 20v-3M15 20v-3M7 9H4M7 15H4M20 9h-3M20 15h-3" />
    </Glyph>
  )
}

export function TerminalIcon() {
  return (
    <Glyph>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10l2.5 2.5L8 15M13 15h3" />
    </Glyph>
  )
}
