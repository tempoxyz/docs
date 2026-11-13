import { global } from 'zyzz/web'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  '[data-layout]:has(.docs-page-actions) [data-v-copy-for-ai]': {
    display: 'none',
  },
  // The header row sits above the H1, across the content column.
  'article[data-v-content] .docs-page-header-host': {
    display: 'block',
    marginBottom: tokens.spacing['6'],
  },
})

/** The breadcrumb on the left and the page actions on the right, wrapping on narrow screens. */
export const docsPageHeader = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
  minHeight: tokens.spacing['8'],
  fontFamily: tokens.fontFamily.ui,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.normal,
  lineHeight: tokens.lineHeight.control,
})

export const docsPageActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  marginInlineStart: 'auto !custom',
})
