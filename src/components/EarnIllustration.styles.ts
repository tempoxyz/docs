import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

const artwork = {
  '& svg': {
    display: 'block',
    width: '100%',
    height: 'auto',

    fontFamily: inherited.fontFamily.tempoFontBodySansSerif,
  },
  '& svg text': {
    WebkitUserSelect: 'text',
    userSelect: 'text',
  },
} as const

export const earnIllustration = style({
  marginBlock: tokens.spacing['8'],
  marginInline: 'auto !custom',
  selectors: {
    ...artwork,
    '& figcaption': {
      marginTop: tokens.spacing['3'],
      color: tokens.color.muted,

      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.normal,
      textAlign: 'center',
    },
  },
})

export const earnIllustrationWide = style({
  // design-exception: Shows the 720-unit Linework scene at its authored label size.
  maxWidth: '720px !custom',
})

export const earnIllustrationPanel = style({
  // design-exception: Shows the 400-unit Interface panel near its authored text size.
  maxWidth: '360px !custom',
})

export const earnStrategyCards = style({
  containerType: 'inline-size',
  marginBlock: tokens.spacing['6'],
})

export const earnStrategyCardsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: tokens.spacing['4'],
  margin: 0,
  padding: 0,
  listStyle: 'none',
  '@container (width <= 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
})

export const earnStrategyCard = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  margin: 0,
  overflow: 'hidden',
  // design-exception: Matches the docs card radius set by DocsCards.styles.ts.
  borderRadius: 'var(--tempo-card-radius) !custom',
  backgroundColor: tokens.color.panel,
  selectors: artwork,
})

export const earnStrategyCardCopy = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['1_5'],
  paddingInline: tokens.spacing['6'],
  paddingBlockEnd: tokens.spacing['6'],
})

export const earnStrategyCardTitle = style({
  color: tokens.color.foreground,

  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.snug,
})

export const earnStrategyCardDescription = style({
  color: tokens.color.muted,

  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.normal,
})
