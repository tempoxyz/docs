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
    <div className="divide-y divide-gray4 rounded border border-gray4">
      {(headerLeft || headerRight) && (
        <header className="flex h-[44px] items-center justify-between px-4">
          {headerLeft}
          {headerRight}
        </header>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <footer className="flex min-h-8 items-center px-2.5 text-[13px] text-gray10">
          {footer}
        </footer>
      )}
    </div>
  )
}
