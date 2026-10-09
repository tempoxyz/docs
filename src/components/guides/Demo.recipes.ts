import { metrics } from '../../styles/metrics'
import { style } from '../../styles/recipes'
export const explorerLinkLayout = style({
  display: 'inline-flex',
})
export const explorerLinkLayout2 = style({
  marginTop: 'var(--spacing)',
})
export const explorerLinkLink = style({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing)',
  fontSize: '13px',
  letterSpacing: '-0.01em',
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
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
})
export const receiptHashLayout = style({
  marginTop: 'var(--spacing)',
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
  fontSize: '13px',
  letterSpacing: '-0.01em',
})
export const receiptHashText = style({
  color: 'var(--color-gray9)',
})
export const code = style({
  minWidth: '0',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
  color: 'var(--color-gray12)',
})
export const receiptHashButton = style({
  flexShrink: 0,
  color: 'var(--color-gray9)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--color-gray12)',
      },
    },
  },
})
export const containerLayout = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
})
export const containerHeading = style({
  fontSize: '14px',
  lineHeight: 1,
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.01em',
  color: 'var(--color-gray12)',
})
export const containerButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing)',
  fontSize: '12.5px',
  lineHeight: 1,
  letterSpacing: '-0.01em',
  color: 'var(--color-gray9)',
})
export const lucideRotateCcw = style({
  marginTop: '1px',
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  color: 'var(--color-gray9)',
})
export const containerLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 4) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 4) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const balancesFooterItemText = style({
  display: 'flex',
  gap: 'var(--spacing)',
})
export const balancesFooterItemText2 = style({
  color: 'var(--color-gray10)',
})
export const balancesFooterLayout = style({
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  paddingBlock: metrics.spacing['2'],
  lineHeight: 1,
})
export const balancesFooterLayout2 = style({
  display: 'grid',
  gridTemplateColumns: '7rem 1px minmax(0,1fr)',
  alignItems: 'center',
  columnGap: metrics.spacing['2'],
  rowGap: 'var(--spacing)',
})
export const balancesFooterLayout3 = style({
  minHeight: metrics.spacing['5'],
  width: '1px',
  alignSelf: 'stretch',
  backgroundColor: 'var(--color-gray4)',
})
export const balancesFooterLayout4 = style({
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  '@media (width >= 40rem)': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: metrics.spacing['3'],
    rowGap: metrics.spacing['2'],
  },
})
export const sourceFooterLayout = style({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
})
export const sourceFooterLayout2 = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: '6px',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  letterSpacing: 'var(--tracking-tight)',
  color: 'var(--text-color-primary)',
  '@media (width < 40rem)': {
    display: 'none',
  },
})
export const lucideCheck = style({
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  color: 'var(--color-gray10)',
})
export const sourceFooterLayout3 = style({
  fontSize: '12px',
  letterSpacing: 'var(--tracking-tight)',
  color: 'var(--text-color-accent)',
})
export const sourceFooterLink = style({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing)',
})
export const lucideExternalLink2 = style({
  width: '12px',
  height: '12px',
})
export const stepHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: metrics.spacing['4'],
  '@media (width < 40rem)': {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
})
export const stepLayout = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['3_5'],
})
export const stepLayout2 = style({
  display: 'flex',
  width: metrics.spacing['7'],
  height: metrics.spacing['7'],
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'calc(infinity * 1px)',
  textAlign: 'center',
  fontSize: '13px',
  color: 'var(--color-black)',
  '--tempo-style-numeric-spacing': 'tabular-nums',
  fontVariantNumeric:
    'var(--tempo-style-ordinal,) var(--tempo-style-slashed-zero,) var(--tempo-style-numeric-figure,) var(--tempo-style-numeric-spacing,) var(--tempo-style-numeric-fraction,)',
  opacity: '40%',
  selectors: {
    '&:is(:where(.group)[data-completed="true"] *)': {
      opacity: '100%',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: 'var(--color-white)',
      },
  },
})
export const stepLayout3 = style({
  backgroundColor: 'var(--color-green3)',
})
export const stepLayout4 = style({
  backgroundColor: 'var(--color-gray4)',
})
export const lucideCheck2 = style({
  color: 'var(--color-green9)',
})
export const stepLayout5 = style({
  fontSize: '14px',
  letterSpacing: '-0.01em',
  color: 'var(--color-black)',
  selectors: {
    '&:is(:where(.group)[data-active="false"] *)': {
      opacity: '40%',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: 'var(--color-white)',
      },
  },
})
export const stepLayout6 = style({
  opacity: '40%',
  selectors: {
    '&:is(:where(.group)[data-active="true"] *)': {
      opacity: '100%',
    },
    '&:is(:where(.group)[data-completed="true"] *)': {
      opacity: '100%',
    },
  },
})
export const stepLayout7 = style({
  height: metrics.spacing['2'],
})
export const stepLayout8 = style({
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
export const loginLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const lucidePictureInPicture2 = style({
  marginTop: '1px',
})
export const loginButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const loginLayout2 = style({
  maxWidth: '22rem',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-color-destructiveTint)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: '13px',
  lineHeight: 'var(--leading-normal)',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
  color: 'var(--text-color-destructive)',
})
export const lucideCheck3 = style({
  marginTop: '1px',
  color: 'var(--color-gray9)',
})
