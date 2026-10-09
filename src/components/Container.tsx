import { vars as tokens } from '../styles/theme'

;('use client')

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
  borderRadius: tokens.radius.lg,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.card,
  selectors: {
    '& > :not(:last-child)': {
      borderBottomWidth: tokens.borderWidth.hairline,
      borderBottomStyle: 'solid',
      borderBottomColor: tokens.color.line,
    },
  },
})
const header = style({
  display: 'flex',
  minHeight: '48px',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],

  paddingBlock: tokens.spacing['3'],
  paddingInline: tokens.spacing['5'],
})
const content = style({ padding: tokens.spacing['5'] })
const footerStyle = style({
  display: 'flex',
  minHeight: '40px',
  minWidth: 0,
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2'],

  paddingBlock: tokens.spacing['2'],
  paddingInline: tokens.spacing['5'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
