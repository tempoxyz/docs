'use client'
export function Container(
  props: React.PropsWithChildren<{
    headerLeft?: React.ReactNode
    headerRight?: React.ReactNode
    footer?: React.ReactNode
  }>,
) {
  const { children, headerLeft, headerRight, footer } = props

  // Note: styling of this container mimics Vocs styles.
  return (
    <div className="docs-demo divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface-card)]">
      {(headerLeft || headerRight) && (
        <header className="flex min-h-12 flex-wrap items-center justify-between gap-3 px-5 py-3">
          {headerLeft}
          {headerRight}
        </header>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <footer className="flex min-h-10 min-w-0 flex-wrap items-center gap-2 px-5 py-2 text-[13px] text-gray10">
          {footer}
        </footer>
      )}
    </div>
  )
}
