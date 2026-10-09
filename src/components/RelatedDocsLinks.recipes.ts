import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const relatedDocsLinksSection = style({
  marginTop: metrics.spacing['10'],
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
  paddingTop: metrics.spacing['8'],
})
export const relatedDocsLinksHeading = style({
  marginBottom: metrics.spacing['4'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '20px',
  fontWeight: metrics.fontWeight.medium,
  letterSpacing: '-0.01em',
  color: 'var(--foreground)',
})
export const relatedDocsLinksList = style({
  display: 'grid',
  listStyleType: 'none',
  gap: metrics.spacing['3'],
  padding: '0',
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const relatedDocsLinksItem = style({
  margin: '0',
})
export const link = style({
  '@media (hover: hover)': { ':hover': { backgroundColor: 'var(--surface-block)' } },
  display: 'block',
  height: '100%',
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  padding: metrics.spacing['4'],
  color: 'var(--foreground)',
  textDecorationLine: 'none',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const relatedDocsLinksText = style({
  display: 'block',
  fontSize: '15px',
  lineHeight: metrics.spacing['5'],
  fontWeight: metrics.fontWeight.medium,
})
export const relatedDocsLinksText2 = style({
  marginTop: metrics.spacing['1_5'],
  display: 'block',
  fontSize: '14px',
  lineHeight: metrics.spacing['5'],
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
})
