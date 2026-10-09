import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const adminKeyDemoText = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.medium,
})
export const adminKeyDemoText2 = style({
  fontSize: '13px',
  color: 'var(--color-gray10)',
})
export const adminKeyDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 5) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 5) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const adminKeyDemoLink = style({
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
export const adminKeyDemoLayout2 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  color: 'var(--color-gray10)',
})
export const adminKeyDemoLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: metrics.spacing['4'],
  rowGap: 'var(--spacing)',
})
export const adminKeyDemoLayout4 = style({
  marginTop: metrics.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(var(--spacing) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd: 'calc(var(--spacing) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: '13px',
})
export const adminKeyDemoLayout5 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  wordBreak: 'break-all',
})
export const adminKeyDemoLayout6 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: metrics.spacing['3'],
})
export const adminKeyDemoLayout7 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
})
export const adminKeyDemoDescription = style({
  fontSize: '13px',
  color: 'var(--text-color-destructive)',
})
export const adminKeyDemoButton = style({
  fontSize: '13px',
  color: 'var(--color-gray10)',
  textDecorationLine: 'underline',
  textUnderlineOffset: '4px',
  selectors: {
    '&:disabled': {
      opacity: '50%',
    },
  },
})
