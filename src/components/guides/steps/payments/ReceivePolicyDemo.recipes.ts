import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const receivePolicyDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 5) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 5) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const receivePolicyDemoDescription = style({
  fontSize: '13px',
  color: 'var(--color-gray9)',
})
export const receivePolicyDemoDescription2 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  color: 'var(--color-gray9)',
})
export const receivePolicyDemoLayout2 = style({
  marginTop: metrics.spacing['3'],
  display: 'flex',
  flexWrap: 'wrap',
  gap: metrics.spacing['4'],
})
export const receivePolicyDemoDescription3 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
})
export const receivePolicyDemoDescription4 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  color: 'var(--text-color-destructive)',
})
export const code = style({
  display: 'block',
  wordBreak: 'break-all',
})
