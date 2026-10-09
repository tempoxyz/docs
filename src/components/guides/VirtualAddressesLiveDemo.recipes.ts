import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const passkeyLoginLayout = style({
  display: 'flex',
  gap: 'var(--spacing)',
})
export const passkeyLoginButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const virtualAddressesLiveDemoLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const virtualAddressesLiveDemoLayout2 = style({
  marginInline: metrics.spacing['6'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
  paddingBottom: metrics.spacing['4'],
})
export const virtualAddressesLiveDemoLayout3 = style({
  marginTop: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing)',
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const virtualAddressesLiveDemoText = style({
  color: 'var(--text-color-primary)',
})
export const code = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
  color: 'var(--text-color-primary)',
})
export const virtualAddressesLiveDemoLayout4 = style({
  marginTop: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const virtualAddressesLiveDemoLayout5 = style({
  marginTop: metrics.spacing['2'],
  display: 'grid',
  gap: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const code2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  color: 'var(--text-color-primary)',
})
export const virtualAddressesLiveDemoLayout6 = style({
  marginTop: metrics.spacing['2'],
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
  '@media (width < 40rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const virtualAddressesLiveDemoLayout7 = style({
  gridColumn: '1 / -1',
})
export const virtualAddressesLiveDemoLayout8 = style({
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
export const virtualAddressesLiveDemoText2 = style({
  display: 'inline-flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: metrics.spacing['3'],
  rowGap: 'var(--spacing)',
})
export const virtualAddressesLiveDemoText3 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  color: 'var(--text-color-primary)',
})
export const virtualAddressesLiveDemoLayout9 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: metrics.spacing['2'],
  '@media (width < 40rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const virtualAddressesLiveDemoLayout10 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(var(--spacing) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd: 'calc(var(--spacing) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
