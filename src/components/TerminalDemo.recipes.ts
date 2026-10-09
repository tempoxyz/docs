import { style as instanceStyle } from 'zyzz'
import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const stepIconText = style({
  display: 'inline-block',
  width: '1ch',
  textAlign: 'center',
})
export const blankLineLayout = style({
  height: metrics.spacing['6'],
})
export const truncatedHexText = style({
  '@media (width >= 48rem)': {
    display: 'none',
  },
})
export const truncatedHexText2 = style({
  display: 'none',
  '@media (width >= 48rem)': {
    display: 'inline',
  },
})
export const photoOutputLayout = style({
  position: 'relative',
  display: 'block',
  overflow: 'hidden',
  borderRadius: '0.25rem',
})
export const photoOutputLayout2 = style({
  position: 'absolute',
  inset: '0',
})
export const img = style({
  position: 'absolute',
  inset: '0',
  height: '100%',
  width: '100%',
  objectFit: 'cover',
})
export const chargeStepsLayout = style({
  display: 'flex',
  flexDirection: 'column',
})
export const chargeStepsLink = style({
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const terminalDemoLayout = style({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: metrics.radius.xl,
})
export const terminalDemoLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
  paddingInline: metrics.spacing['4'],
  paddingBlock: metrics.spacing['3'],
})
export const terminalDemoText = style({
  borderRadius: 'calc(infinity * 1px)',
})
export const terminalDemoLayout3 = style({
  minHeight: '0',
  flex: '1 1 0%',
  overflowX: 'hidden',
  overflowY: 'auto',
  paddingInline: metrics.spacing['5'],
  paddingBottom: metrics.spacing['5'],
  fontSize: '13.5px',
  lineHeight: '1.35rem',
  overflowWrap: 'break-word',
  '@media (width >= 48rem)': {
    fontSize: '0.9rem',
    lineHeight: '1.5rem',
  },
})
export const terminalDemoLayout4 = style({
  height: metrics.spacing['2'],
})
export const terminalDemoButton = style({
  width: 'fit-content',
  cursor: 'pointer',
  textAlign: 'left',
})
export const terminalDemoButton2 = style({
  cursor: 'pointer',
  textAlign: 'left',
})
export const spinnerTextAppearance = instanceStyle({
  color: 'var(--term-blue9)',
})
export const stepIconTextAppearance = instanceStyle({
  color: 'var(--term-green9)',
})
export const photoOutputLayoutAppearance = instanceStyle({
  width: '200px',
  height: '200px',
  borderColor: 'var(--term-gray4)',
  borderWidth: '1px',
  borderStyle: 'solid',
})
export const photoOutputLayoutAppearance2 = instanceStyle({
  backgroundColor: 'var(--term-gray3)',
})
export const chargeStepsDescriptionAppearance = instanceStyle({
  color: 'var(--term-gray6)',
})
export const chargeStepsTextAppearance = instanceStyle({
  color: 'var(--term-gray5)',
})
export const chargeStepsLinkAppearance = instanceStyle({
  color: 'var(--term-blue9)',
})
export const chargeStepsDescriptionAppearance2 = instanceStyle({
  color: 'var(--term-gray6)',
})
export const chargeStepsTextAppearance2 = instanceStyle({
  color: 'var(--term-gray5)',
})
export const chargeStepsTextAppearance3 = instanceStyle({
  color: 'var(--term-amber9)',
})
export const chargeStepsDescriptionAppearance3 = instanceStyle({
  color: 'var(--term-gray6)',
})
export const chargeStepsTextAppearance4 = instanceStyle({
  color: 'var(--term-orange9)',
})
export const chargeStepsTextAppearance5 = instanceStyle({
  color: 'var(--term-gray6)',
})
export const chargeStepsDescriptionAppearance4 = instanceStyle({
  color: 'var(--term-gray6)',
})
export const chargeStepsTextAppearance6 = instanceStyle({
  color: 'var(--term-gray5)',
})
export const chargeStepsLinkAppearance2 = instanceStyle({
  color: 'var(--term-blue9)',
})
export const chargeStepsDescriptionAppearance5 = instanceStyle({
  color: 'var(--term-gray6)',
})
export const chargeStepsTextAppearance7 = instanceStyle({
  color: 'var(--term-orange9)',
})
export const chargeStepsTextAppearance8 = instanceStyle({
  color: 'var(--term-gray6)',
})
export const cssTriangleTextAppearance = instanceStyle({
  display: 'inline-block',
  width: 0,
  height: 0,
  borderTop: '0.3em solid transparent',
  borderBottom: '0.3em solid transparent',
  borderLeft: '0.45em solid currentColor',
  verticalAlign: 'middle',
})
export const terminalDemoLayoutAppearance = instanceStyle({
  fontFamily: 'var(--font-mono, "Geist Mono", monospace)',
  height: '100%',
  minHeight: 0,
  userSelect: 'text',
  WebkitUserSelect: 'text',
})
export const terminalDemoLayoutAppearance2 = instanceStyle({
  height: '100%',
  minHeight: 0,
  borderColor: 'var(--vocs-border-color-primary, var(--term-gray4))',
  borderWidth: '1px',
  borderStyle: 'solid',
  backgroundColor: 'var(--term-bg2)',
})
export const terminalDemoLayoutAppearance3 = instanceStyle({
  backgroundColor: 'var(--term-bg2)',
  borderBottom: '1px solid var(--term-gray4)',
})
export const terminalDemoTextAppearance = instanceStyle({
  width: '14px',
  height: '14px',
  backgroundColor: 'var(--term-gray4)',
})
export const terminalDemoTextAppearance2 = instanceStyle({
  width: '14px',
  height: '14px',
  backgroundColor: 'var(--term-gray4)',
})
export const terminalDemoTextAppearance3 = instanceStyle({
  width: '14px',
  height: '14px',
  backgroundColor: 'var(--term-gray4)',
})
export const terminalDemoTextAppearance4 = instanceStyle({
  flex: 1,
})
export const terminalDemoButtonAppearance = instanceStyle({
  background: 'transparent',
  border: 'none',
  color: 'var(--term-gray5)',
  padding: '2px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s',
})
export const terminalDemoLayoutAppearance4 = instanceStyle({
  backgroundColor: 'var(--term-bg2)',
})
export const terminalDemoButtonAppearance2 = instanceStyle({
  color: 'var(--term-pink9)',
})
export const terminalDemoDescriptionAppearance = instanceStyle({
  color: 'var(--term-gray5)',
})
export const terminalDemoButtonAppearance3 = instanceStyle({
  color: 'var(--term-gray6)',
})
export const photoOutputImgAppearance = instanceStyle((values: { value0: number }) => ({
  transition: 'opacity 0.5s',
  opacity: values.value0,
}))
