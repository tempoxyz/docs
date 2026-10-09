import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const embedPasskeysLayout = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
})
export const signInButtonsLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const signInButtonsLayout2 = style({
  display: 'flex',
  gap: 'var(--spacing)',
})
export const signInButtonsLayout3 = style({
  maxWidth: '22rem',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-color-destructiveTint)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: '13px',
  lineHeight: 'var(--leading-normal)',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
  color: 'var(--text-color-destructive)',
})
