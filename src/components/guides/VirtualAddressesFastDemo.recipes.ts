import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const virtualAddressesFastDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const virtualAddressesFastDemoButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const virtualAddressesFastDemoLayout2 = style({
  marginInline: metrics.spacing['6'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
  paddingBottom: metrics.spacing['4'],
})
export const virtualAddressesFastDemoLayout3 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const virtualAddressesFastDemoLayout4 = style({
  marginTop: metrics.spacing['2'],
  display: 'grid',
  gap: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const virtualAddressesFastDemoLayout5 = style({
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0,1fr)',
  alignItems: 'flex-start',
  columnGap: metrics.spacing['4'],
})
export const virtualAddressesFastDemoText = style({
  color: 'var(--text-color-primary)',
})
export const code = style({
  minWidth: '0',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
  color: 'var(--text-color-primary)',
})
export const code2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  color: 'var(--text-color-primary)',
})
export const virtualAddressesFastDemoLayout6 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
})
export const virtualAddressesFastDemoLayout7 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing)',
})
export const label = style({
  fontSize: '11px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const virtualAddressesFastDemoInput = style({
  height: '34px',
  borderRadius: 'calc(infinity * 1px)',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  paddingInline: 'calc(var(--spacing) * 3.25)',
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
  color: 'var(--color-black)',
  selectors: {
    '&::placeholder': {
      color: 'var(--color-gray9)',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: 'var(--color-white)',
      },
  },
})
export const virtualAddressesFastDemoLayout8 = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: metrics.spacing['2'],
  fontSize: '11px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const virtualAddressesFastDemoLayout9 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: metrics.spacing['3'],
  rowGap: 'var(--spacing)',
})
export const virtualAddressesFastDemoLayout10 = style({
  fontSize: '12px',
  letterSpacing: '-0.01em',
  color: 'var(--text-color-destructive)',
})
export const virtualAddressesFastDemoText2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
})
export const virtualAddressesFastDemoLayout11 = style({
  marginTop: metrics.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 3) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 3) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const virtualAddressesFastDemoLayout12 = style({
  display: 'grid',
  gap: metrics.spacing['2'],
})
export const code3 = style({
  minWidth: '0',
  fontFamily: 'var(--font-jetbrains-mono)',
  wordBreak: 'break-all',
  color: 'var(--text-color-primary)',
})
export const virtualAddressesFastDemoLayout13 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(var(--spacing) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd: 'calc(var(--spacing) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const code4 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
  color: 'var(--text-color-primary)',
})
