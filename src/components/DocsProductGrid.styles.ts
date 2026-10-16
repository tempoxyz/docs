import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

/**
 * Boxed product cards for section overview pages, matching the docs home product grid: an icon
 * and linked title, a short description, then links. MDX authors the cards as
 * `.docs-product-group` blocks inside this grid.
 */
export const docsProductGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: tokens.spacing['5'],
  marginTop: tokens.spacing['7'],
  marginBottom: tokens.spacing['2'],
  selectors: {
    '& .docs-product-group': {
      minWidth: 0,
      // design-exception: Shares the docs card padding variable with the docs home product grid.
      padding: 'var(--tempo-card-padding) !custom',
      // design-exception: Shares the docs card radius variable with the docs home product grid.
      borderRadius: 'var(--tempo-card-radius) !custom',
      backgroundColor: tokens.color.panel,
    },
    '& .docs-product-group h3[data-v]': {
      margin: 0,
      padding: 0,
      border: 0,
      fontSize: tokens.fontSize.lead,
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: tokens.letterSpacing.tight,
      lineHeight: tokens.lineHeight.snug,
    },
    '& .docs-product-group h3[data-v] > a:not(.heading-anchor)': {
      color: tokens.color.foreground,
      fontWeight: 'inherit !custom',
      textDecoration: 'none',
    },
    '& .docs-product-group h3[data-v] > .heading-anchor': {
      display: 'none',
    },
    '& .docs-product-group p[data-v]': {
      minHeight: '3.2em',
      marginTop: tokens.spacing['3'],
      marginInlineEnd: 0,
      marginBottom: tokens.spacing['5'],
      marginInlineStart: 0,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
    },
    '& .docs-product-group ul[data-v]': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& .docs-product-group li[data-v]': {
      margin: 0,
      padding: 0,
      fontSize: tokens.fontSize.bodySmall,
      lineHeight: tokens.lineHeight.relaxed,
    },
    '& .docs-product-group li[data-v]::marker': {
      content: 'none',
    },
    '& .docs-product-group li[data-v] + li[data-v]': {
      marginTop: tokens.spacing['2_5'],
    },
    '& .docs-product-group li[data-v] a[data-v]': {
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.normal,
      textDecoration: 'none',
    },
    '& .docs-product-group :is(li[data-v] a[data-v], h3[data-v] > a:not(.heading-anchor)):hover': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
  '@media (width <= 1100px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (width <= 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: tokens.spacing['4'],
    marginTop: tokens.spacing['6'],
    selectors: {
      '& .docs-product-group p[data-v]': {
        minHeight: 0,
      },
    },
  },
})
