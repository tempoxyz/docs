import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const resultViewLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 3) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 3) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const article = style({
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray5)',
  padding: metrics.spacing['3'],
})
export const resultViewLayout2 = style({
  marginBottom: metrics.spacing['2'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: metrics.spacing['3'],
  rowGap: 'var(--spacing)',
  fontSize: '12px',
  color: 'var(--color-gray10)',
})
export const resultViewLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing)',
  color: 'var(--text-color-accent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const lucideExternalLink = style({
  height: metrics.spacing['3'],
  width: metrics.spacing['3'],
})
export const resultViewDescription = style({
  overflow: 'hidden',
  // Legacy box layout is required by the cross-browser line-clamp implementation.
  '--tempo-clamp-display': '-webkit-box',
  display: 'var(--tempo-clamp-display)',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 6,
  fontSize: '13px',
  lineHeight: metrics.spacing['5'],
  whiteSpace: 'pre-wrap',
  color: 'var(--color-gray12)',
})
export const resultViewLayout3 = style({
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
  paddingBlock: metrics.spacing['3'],
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
})
export const td2 = style({
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontFamily: 'var(--font-jetbrains-mono)',
  color: 'var(--color-gray11)',
})
export const pre = style({
  maxHeight: '360px',
  overflow: 'auto',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['3'],
  fontSize: '13px',
  lineHeight: metrics.spacing['5'],
  whiteSpace: 'pre-wrap',
  color: 'var(--color-gray12)',
})
export const form = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 5) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 5) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const tempoMcpExplorerLayout = style({
  display: 'grid',
  gap: metrics.spacing['4'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) auto',
  },
})
export const label = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const tempoMcpExplorerText = style({
  marginBottom: metrics.spacing['2'],
  display: 'block',
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
export const tempoMcpExplorerLayout2 = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  gap: metrics.spacing['2'],
})
export const tempoMcpExplorerButton = style({
  display: 'inline-flex',
  height: metrics.spacing['10'],
  width: metrics.spacing['10'],
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
  color: 'var(--color-gray10)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray3)',
        color: 'var(--color-gray12)',
      },
    },
  },
})
export const lucideRotateCcw = style({
  height: metrics.spacing['4'],
  width: metrics.spacing['4'],
})
export const tempoMcpExplorerButton2 = style({
  display: 'inline-flex',
  height: metrics.spacing['10'],
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  borderRadius: metrics.radius.md,
  backgroundColor: 'var(--background-color-accent)',
  paddingInline: metrics.spacing['3'],
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
export const lucidePlay = style({
  height: metrics.spacing['3_5'],
  width: metrics.spacing['3_5'],
})
export const label2 = style({
  display: 'block',
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const tempoMcpExplorerLayout3 = style({
  display: 'grid',
  gap: metrics.spacing['3'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const tempoMcpExplorerInput = style({
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
export const tempoMcpExplorerLayout4 = style({
  display: 'grid',
  gap: metrics.spacing['5'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'minmax(0,0.85fr) minmax(0,1.15fr)',
  },
})
export const tempoMcpExplorerLayout5 = style({
  paddingInline: 'var(--spacing)',
  paddingBottom: 'var(--spacing)',
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  color: 'var(--color-gray11)',
})
export const pre2 = style({
  maxHeight: '360px',
  overflow: 'auto',
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['3'],
  fontSize: '12px',
  lineHeight: metrics.spacing['5'],
  color: 'var(--color-gray12)',
})
export const tempoMcpExplorerLayout6 = style({
  display: 'flex',
  minHeight: metrics.spacing['5'],
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['3'],
  paddingInline: 'var(--spacing)',
  paddingBottom: 'var(--spacing)',
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
})
export const tempoMcpExplorerText2 = style({
  color: 'var(--color-gray11)',
})
export const tempoMcpExplorerLayout7 = style({
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
export const tempoMcpExplorerLayout8 = style({
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray6)',
  backgroundColor: 'var(--color-gray2)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: metrics.fontSize.sm,
  lineHeight: 'var(--text-sm--line-height)',
  color: 'var(--color-gray11)',
})
