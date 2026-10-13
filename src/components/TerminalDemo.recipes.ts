import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { style as instanceStyle } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'
export const stepIconText = style({
  display: 'inline-block',
  width: '1ch',
  textAlign: 'center',
})
export const blankLineLayout = style({
  height: tokens.spacing['6'],
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
  borderRadius: tokens.radius.smRem,
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
  borderRadius: tokens.radius.xl,
})
export const terminalDemoLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['3'],
})
export const terminalDemoText = style({
  borderRadius: tokens.radius.full,
})
export const terminalDemoLayout3 = style({
  minHeight: '0',
  flex: '1 1 0%',
  overflowX: 'hidden',
  overflowY: 'auto',
  paddingInline: tokens.spacing['5'],
  paddingBottom: tokens.spacing['5'],

  fontSize: tokens.fontSize.compact,

  lineHeight: tokens.lineHeight.dense,
  overflowWrap: 'break-word',
  '@media (width >= 48rem)': {
    fontSize: tokens.fontSize.sm,

    lineHeight: tokens.lineHeight.body,
  },
})
export const terminalDemoLayout4 = style({
  height: tokens.spacing['2'],
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
  color: inherited.color.termBlue9,
})
export const stepIconTextAppearance = instanceStyle({
  color: inherited.color.termGreen9,
})
export const photoOutputLayoutAppearance = instanceStyle({
  width: '200px',
  height: '200px',

  borderColor: inherited.color.termGray4,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
})
export const photoOutputLayoutAppearance2 = instanceStyle({
  backgroundColor: inherited.color.termGray3,
})
export const chargeStepsDescriptionAppearance = instanceStyle({
  color: inherited.color.termGray6,
})
export const chargeStepsTextAppearance = instanceStyle({
  color: inherited.color.termGray5,
})
export const chargeStepsLinkAppearance = instanceStyle({
  color: inherited.color.termBlue9,
})
export const chargeStepsDescriptionAppearance2 = instanceStyle({
  color: inherited.color.termGray6,
})
export const chargeStepsTextAppearance2 = instanceStyle({
  color: inherited.color.termGray5,
})
export const chargeStepsTextAppearance3 = instanceStyle({
  color: inherited.color.termAmber9,
})
export const chargeStepsDescriptionAppearance3 = instanceStyle({
  color: inherited.color.termGray6,
})
export const chargeStepsTextAppearance4 = instanceStyle({
  color: inherited.color.termOrange9,
})
export const chargeStepsTextAppearance5 = instanceStyle({
  color: inherited.color.termGray6,
})
export const chargeStepsDescriptionAppearance4 = instanceStyle({
  color: inherited.color.termGray6,
})
export const chargeStepsTextAppearance6 = instanceStyle({
  color: inherited.color.termGray5,
})
export const chargeStepsLinkAppearance2 = instanceStyle({
  color: inherited.color.termBlue9,
})
export const chargeStepsDescriptionAppearance5 = instanceStyle({
  color: inherited.color.termGray6,
})
export const chargeStepsTextAppearance7 = instanceStyle({
  color: inherited.color.termOrange9,
})
export const chargeStepsTextAppearance8 = instanceStyle({
  color: inherited.color.termGray6,
})
export const cssTriangleTextAppearance = instanceStyle({
  display: 'inline-block',
  width: 0,
  height: 0,
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  borderTop: '0.3em solid transparent !custom',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  borderBottom: '0.3em solid transparent !custom',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  borderInlineStart: '0.45em solid currentColor !custom',
  verticalAlign: 'middle',
})
export const terminalDemoLayoutAppearance = instanceStyle({
  fontFamily: inherited.fontFamily.fontMonoGeistMonoMonospace,
  height: '100%',
  minHeight: 0,
  userSelect: 'text',
  WebkitUserSelect: 'text',
})
export const terminalDemoLayoutAppearance2 = instanceStyle({
  height: '100%',
  minHeight: 0,

  borderColor: inherited.color.vocsBorderColorPrimaryVarTermGray4,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',

  backgroundColor: inherited.color.termBg2,
})
export const terminalDemoLayoutAppearance3 = instanceStyle({
  backgroundColor: inherited.color.termBg2,
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: inherited.color.termGray4,
})
export const terminalDemoTextAppearance = instanceStyle({
  width: '14px',
  height: '14px',

  backgroundColor: inherited.color.termGray4,
})
export const terminalDemoTextAppearance2 = instanceStyle({
  width: '14px',
  height: '14px',

  backgroundColor: inherited.color.termGray4,
})
export const terminalDemoTextAppearance3 = instanceStyle({
  width: '14px',
  height: '14px',

  backgroundColor: inherited.color.termGray4,
})
export const terminalDemoTextAppearance4 = instanceStyle({
  flex: 1,
})
export const terminalDemoButtonAppearance = instanceStyle({
  backgroundColor: 'transparent !custom',
  border: 'none',

  color: inherited.color.termGray5,
  padding: tokens.spacing['0_5'],
  borderRadius: tokens.radius.sm,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s',
  ':is(:hover, :focus-visible)': { color: inherited.color.termGray10 },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
export const terminalDemoLayoutAppearance4 = instanceStyle({
  backgroundColor: inherited.color.termBg2,
})
export const terminalDemoButtonAppearance2 = instanceStyle({
  color: inherited.color.termPink9,
})
export const terminalDemoDescriptionAppearance = instanceStyle({
  color: inherited.color.termGray5,
})
export const terminalDemoButtonAppearance3 = instanceStyle({
  color: inherited.color.termGray6,
})
export const photoOutputImgAppearance = instanceStyle((values: { value0: number }) => ({
  transition: 'opacity 0.5s',
  opacity: values.value0,
}))
