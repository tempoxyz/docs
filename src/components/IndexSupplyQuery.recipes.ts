import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const renderCellValueText = style({
  color: 'var(--color-gray9)',
  fontStyle: 'italic',
})
export const renderCellValueLink = style({
  color: 'var(--text-color-accent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const indexSupplyQueryHeading = style({
  fontSize: '14px',
  lineHeight: 1,
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.01em',
  color: 'var(--color-gray12)',
})
export const indexSupplyQueryLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const indexSupplyQueryLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const indexSupplyQueryLayout3 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  fontSize: '13px',
  color: 'var(--color-gray11)',
})
export const indexSupplyQueryLink = style({
  color: 'var(--color-gray9)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--color-gray11)',
      },
    },
  },
})
export const lucideExternalLink = style({
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
})
export const indexSupplyQueryLayout4 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--spacing)',
})
export const indexSupplyQueryLayout5 = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--color-gray3)',
  paddingInline: metrics.spacing['2'],
  paddingBlock: 'var(--spacing)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
})
export const indexSupplyQueryText = style({
  width: metrics.spacing['2'],
  height: metrics.spacing['2'],
  flexShrink: 0,
  borderRadius: 'calc(infinity * 1px)',
})
export const indexSupplyQueryText2 = style({
  backgroundColor: 'var(--color-blue9)',
})
export const indexSupplyQueryText3 = style({
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: 'var(--color-gray11)',
})
export const sqlEditor = style({
  width: '100%',
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--color-gray2)',
  fontFamily: 'var(--font-jetbrains-mono)',
  selectors: {
    '&:focus': {
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '50%',
    },
  },
})
export const sqlEditor2 = style({
  fontSize: '11px',
  lineHeight: 1.4,
})
export const sqlEditor3 = style({
  fontSize: '13px',
  lineHeight: 'var(--leading-normal)',
})
export const indexSupplyQueryLayout6 = style({
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-color-destructiveTint)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: '14px',
  lineHeight: 'var(--leading-normal)',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
  color: 'var(--text-color-destructive)',
})
export const indexSupplyQueryLayout7 = style({
  overflow: 'auto',
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
})
export const table = style({
  width: '100%',
  fontSize: '12px',
})
export const thead = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--color-gray2)',
})
export const th = style({
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  textAlign: 'left',
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--color-gray12)',
})
export const indexSupplyQueryLayout8 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['0_5'],
})
export const td = style({
  paddingBlock: metrics.spacing['4'],
  textAlign: 'center',
  color: 'var(--color-gray9)',
})
export const tr = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--color-gray4)',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray2)',
      },
    },
  },
})
export const td2 = style({
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontFamily: 'var(--font-jetbrains-mono)',
  color: 'var(--color-gray11)',
})
export const functionIndicator = style({ backgroundColor: 'var(--color-violet9)' })
