import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const passkeyAccountDemoText = style({
  fontSize: '14px',
  color: 'var(--color-gray12)',
})
export const passkeyAccountDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const passkeyAccountDemoLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 3) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 3) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const passkeyAccountDemoDescription = style({
  fontSize: '14px',
  color: 'var(--color-gray10)',
})
export const code = style({
  display: 'block',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '14px',
  wordBreak: 'break-all',
  color: 'var(--color-gray12)',
})
export const passkeyAccountDemoLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: metrics.spacing['2'],
})
export const passkeyAccountDemoDescription2 = style({
  fontSize: '13px',
  color: 'var(--color-gray10)',
})
export const passkeyAccountDemoLink = style({
  display: 'inline-flex',
  borderRadius: metrics.radius.lg,
  backgroundColor: 'var(--color-black)',
  paddingInline: metrics.spacing['4'],
  paddingBlock: metrics.spacing['3'],
  fontSize: '14px',
  color: 'var(--color-white)',
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        backgroundColor: 'var(--color-white)',
        color: 'var(--color-black)',
      },
  },
})
export const passkeyAccountDemoDescription3 = style({
  fontSize: '13px',
  color: 'var(--text-color-destructive)',
})
