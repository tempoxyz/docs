import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const earnVaultDemoText = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.medium,
})
export const earnVaultDemoText2 = style({
  fontSize: '13px',
  color: 'var(--color-gray10)',
})
export const earnVaultDemoLayout = style({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['2'],
})
export const earnVaultDemoLink = style({
  color: 'var(--text-color-accent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const earnVaultDemoLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 6) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 6) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const earnVaultDemoLayout3 = style({
  marginTop: metrics.spacing['3'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: metrics.spacing['3'],
})
export const earnVaultDemoDescription = style({
  marginTop: metrics.spacing['3'],
  fontSize: '13px',
  color: 'var(--text-color-destructive)',
})
export const earnVaultDemoLayout4 = style({
  marginTop: metrics.spacing['3'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const label = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  borderWidth: '0',
})
export const select = style({
  width: '100%',
})
export const earnVaultDemoLayout5 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const dl = style({
  display: 'grid',
  minWidth: '0',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  columnGap: metrics.spacing['6'],
  rowGap: metrics.spacing['4'],
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
  paddingTop: metrics.spacing['4'],
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const earnVaultDemoText3 = style({
  marginTop: 'var(--spacing)',
  display: 'block',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
  color: 'var(--color-gray10)',
})
export const earnVaultDemoText4 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
})
export const earnVaultDemoLayout6 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['3'],
})
export const earnVaultDemoDescription2 = style({
  marginTop: metrics.spacing['3'],
  fontSize: '13px',
  color: 'var(--color-gray10)',
})
export const fieldLayout = style({
  minWidth: '0',
})
export const dt = style({
  fontSize: '12px',
  color: 'var(--color-gray10)',
})
export const dd = style({
  marginTop: 'var(--spacing)',
  fontSize: '14px',
  color: 'var(--text-color-primary)',
})
export const earnVaultDemoStateState = style({
  ':focus-visible': { '--tempo-style-ring-color': 'var(--accent-blue)' },
  minHeight: metrics.spacing['10'],
  maxWidth: '100%',
  minWidth: '0',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line-strong)',
  backgroundColor: 'var(--surface-card)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: '14px',
  color: 'var(--text-color-primary)',
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
