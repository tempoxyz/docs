'use client'

import { docsDemo } from '../styles/surfaces.styles'
import { style } from '../styles/theme'

export function Container(
  props: React.PropsWithChildren<{
    headerLeft?: React.ReactNode
    headerRight?: React.ReactNode
    footer?: React.ReactNode
  }>,
) {
  const { children, headerLeft, headerRight, footer } = props
  return (
    <div {...container({ className: `docs-demo ${docsDemo().className}` })}>
      {(headerLeft || headerRight) && (
        <header {...header()}>
          {headerLeft}
          {headerRight}
        </header>
      )}
      <div {...content()}>{children}</div>
      {footer && <footer {...footerStyle()}>{footer}</footer>}
    </div>
  )
}

const container = style({
  borderRadius: '8px',
  border: '1px solid var(--line)',
  backgroundColor: 'card',
  selectors: { '& > :not(:last-child)': { borderBottom: '1px solid var(--line)' } },
})
const header = style({
  display: 'flex',
  minHeight: '48px',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 20px',
})
const content = style({ padding: '20px' })
const footerStyle = style({
  display: 'flex',
  minHeight: '40px',
  minWidth: 0,
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 20px',
  fontSize: '13px',
  color: 'var(--color-gray10) !custom',
})
