export function Container(
  props: React.PropsWithChildren<{
    headerLeft?: React.ReactNode
    headerRight?: React.ReactNode
    footer?: React.ReactNode
  }>,
) {
  const { children, headerLeft, headerRight, footer } = props
  return (
    <div className="border-gray4 border divide-gray4 divide-y">
      {(headerLeft || headerRight) && (
        <header className="px-2.5 py-2 flex items-center justify-between">
          {headerLeft}
          {headerRight}
        </header>
      )}
      {children}
      {footer && (
        <footer className="px-2.5 h-8 items-center flex">{footer}</footer>
      )}
    </div>
  )
}
