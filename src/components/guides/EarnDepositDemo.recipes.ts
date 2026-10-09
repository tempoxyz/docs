import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const earnDepositDemoText = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.medium,
})
export const earnDepositDemoText2 = style({
  fontSize: '13px',
  color: 'var(--color-gray10)',
})
export const earnDepositDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 6) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 6) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const earnDepositDemoLink = style({
  color: 'var(--text-color-accent)',
  textDecorationLine: 'underline',
})
export const earnDepositDemoLayout2 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['2'],
  fontSize: '13px',
})
export const earnDepositDemoLayout3 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const label = style({
  display: 'block',
  fontSize: '13px',
  fontWeight: metrics.fontWeight.medium,
})
export const earnDepositDemoInput = style({
  ':focus-visible': { '--tempo-style-ring-color': 'var(--accent-blue)' },
  minHeight: metrics.spacing['10'],
  width: '100%',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line-strong)',
  backgroundColor: 'var(--surface-card)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: '14px',
  selectors: {
    '&:focus-visible': {
      '--tempo-style-ring-shadow':
        'var(--tempo-style-ring-inset,) 0 0 0 calc(2px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
      boxShadow:
        'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
  },
})
export const earnDepositDemoDescription = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  color: 'var(--color-gray10)',
})
export const earnDepositDemoDescription2 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
})
export const earnDepositDemoLayout4 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 3) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 3) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: '13px',
})
export const earnDepositDemoLayout5 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: '13px',
})
export const earnDepositDemoDescription3 = style({
  color: 'var(--color-gray10)',
})
export const earnDepositDemoDescription4 = style({
  fontSize: '13px',
  color: 'var(--text-color-destructive)',
})
export const earnDepositDemoButton = style({
  fontSize: '13px',
  textDecorationLine: 'underline',
  selectors: {
    '&:disabled': {
      opacity: '50%',
    },
  },
})
export const earnDepositDemoLink2 = style({
  textDecorationLine: 'underline',
})
export const receiptLinkLink = style({
  marginTop: metrics.spacing['2'],
  display: 'block',
  fontSize: '13px',
  color: 'var(--text-color-accent)',
  textDecorationLine: 'underline',
})
