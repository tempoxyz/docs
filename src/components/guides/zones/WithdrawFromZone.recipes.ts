import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const connectedZoneFlowButton = style({
  fontSize: '14px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.02em',
})
export const withdrawalModeSelectorLayout = style({
  marginInlineStart: '42px',
  borderRadius: metrics.radius.xl,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'color-mix(in oklab, var(--color-gray2) 40%, transparent)',
  padding: metrics.spacing['3'],
})
export const withdrawalModeSelectorLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  '@media (width >= 40rem)': {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: metrics.spacing['4'],
  },
})
export const withdrawalModeSelectorLayout3 = style({
  maxWidth: '34rem',
})
export const withdrawalModeSelectorDescription = style({
  fontSize: '12px',
  letterSpacing: '0.12em',
  color: 'var(--color-gray9)',
  textTransform: 'uppercase',
})
export const withdrawalModeSelectorDescription2 = style({
  marginTop: 'var(--spacing)',
  fontSize: '13px',
  lineHeight: 'var(--leading-relaxed)',
  letterSpacing: '-0.01em',
  color: 'var(--color-gray10)',
})
export const withdrawalModeSelectorLayout4 = style({
  display: 'flex',
  flexShrink: 0,
  alignSelf: 'flex-start',
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--background)',
  padding: 'var(--spacing)',
})
export const stepBodyLayout = style({
  marginInline: metrics.spacing['6'],
  paddingBottom: metrics.spacing['4'],
})
export const stepBodyLayout2 = style({
  marginTop: metrics.spacing['3'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: '2px',
  borderColor: 'var(--color-gray4)',
  paddingInlineStart: metrics.spacing['5'],
})
export const stepBodyLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  paddingBlock: metrics.spacing['0_5'],
})
export const detailLineLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: metrics.spacing['2'],
  rowGap: 'var(--spacing)',
  fontSize: '13px',
  letterSpacing: '-0.01em',
})
export const detailLineText = style({
  color: 'var(--color-gray9)',
})
export const detailLineText2 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  wordBreak: 'break-all',
  color: 'var(--color-gray12)',
})
export const withdrawalModeSelectorButtonState = style({
  borderRadius: metrics.radius.md,
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['1_5'],
  fontSize: '13px',
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '-0.01em',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const withdrawalModeSelectorButtonState2 = style({
  backgroundColor: 'var(--background-color-invert)',
  color: 'var(--text-color-invert)',
})
export const withdrawalModeSelectorButtonState3 = style({
  color: 'var(--color-gray10)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--color-gray12)',
      },
    },
  },
})
