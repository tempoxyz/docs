import { style } from 'zyzz'
import { global } from 'zyzz/web'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  '[data-layout]:has(.docs-page-actions) [data-v-copy-for-ai]': {
    display: 'none',
  },
})

export const docsPageActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '12px 22px',
  paddingBlock: '4px 22px',
  marginBottom: '34px',
  fontFamily: 'var(--font-pilat-book), sans-serif',
  fontSize: '13px',
  lineHeight: 1.5,
  selectors: {
    '& :is(a, button)': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 0',
      color: 'color-mix(in srgb, var(--foreground) 65%, transparent)',
      textDecoration: 'none',
      cursor: 'pointer',
    },
    '& :is(a, button):hover': {
      color: 'var(--foreground)',
    },
  },
  '@media (width < 600px)': {
    gap: '8px 18px',
    marginBottom: '24px',
  },
})

export const docsPageActionsError = style({
  width: '100%',
  color: 'var(--vocs-text-color-muted)',
})
