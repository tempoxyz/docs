import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const renderValueText = style({
  color: 'var(--color-gray9)',
  fontStyle: 'italic',
})
export const tidxQueryHeading = style({
  fontSize: '14px',
  lineHeight: 1,
  fontWeight: metrics.fontWeight.normal,
  color: 'var(--color-gray12)',
})
export const tidxQueryButton = style({
  borderRadius: metrics.radius.md,
  backgroundColor: 'var(--background-color-accent)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['1_5'],
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  color: 'var(--color-white)',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '50%',
    },
  },
})
export const tidxQueryLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const tidxQueryLayout2 = style({
  display: 'grid',
  gap: metrics.spacing['3'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const label = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(var(--spacing) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd: 'calc(var(--spacing) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const tidxQueryText = style({
  color: 'var(--color-gray11)',
})
export const select = style({
  width: '100%',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
  backgroundColor: 'var(--color-gray1)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  color: 'var(--color-gray12)',
})
export const tidxQueryDescription = style({
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  color: 'var(--color-gray11)',
})
export const label2 = style({
  display: 'block',
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(var(--spacing) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd: 'calc(var(--spacing) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const tidxQueryInput = style({
  width: '100%',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
  backgroundColor: 'var(--color-gray1)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontFamily: 'var(--font-jetbrains-mono)',
  color: 'var(--color-gray12)',
})
export const tidxQueryLayout3 = style({
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-red6)',
  backgroundColor: 'var(--color-red2)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  color: 'var(--color-red11)',
})
export const tidxQueryLayout4 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 3) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 3) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const tidxQueryLayout5 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: metrics.spacing['2'],
  fontSize: metrics.fontSize.xs,
  lineHeight: 'var(--text-xs--line-height)',
  color: 'var(--color-gray11)',
})
export const tidxQueryLayout6 = style({
  overflowX: 'auto',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
})
export const table = style({
  minWidth: '100%',
  textAlign: 'left',
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const thead = style({
  backgroundColor: 'var(--color-gray2)',
  color: 'var(--color-gray11)',
})
export const th = style({
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontWeight: metrics.fontWeight.medium,
})
export const tr = style({
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--color-gray5)',
})
export const td = style({
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontFamily: 'var(--font-jetbrains-mono)',
})
