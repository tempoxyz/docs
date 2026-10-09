import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const connectedZoneFlowButton = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
})
export const connectedZoneFlowDescription = style({
  fontSize: tokens.fontSize.compact,

  lineHeight: inherited.lineHeight.leadingRelaxed,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray10,
})
export const depositModeSelectorLayout = style({
  marginInlineStart: tokens.spacing['10'],
  borderRadius: tokens.radius.xl,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,

  backgroundColor: inherited.color.colorMixInOklabColorGray240Transparent,
  padding: tokens.spacing['3'],
})
export const depositModeSelectorLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  '@media (width >= 40rem)': {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacing['4'],
  },
})
export const depositModeSelectorLayout3 = style({
  maxWidth: '34rem',
})
export const depositModeSelectorDescription = style({
  fontSize: tokens.fontSize.xs,
  letterSpacing: tokens.letterSpacing.label,
  color: tokens.color.gray9,
  textTransform: 'uppercase',
})
export const depositModeSelectorDescription2 = style({
  marginTop: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,

  lineHeight: inherited.lineHeight.leadingRelaxed,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray10,
})
export const depositModeSelectorLayout4 = style({
  display: 'flex',
  flexShrink: 0,
  alignSelf: 'flex-start',
  borderRadius: tokens.radius.lg,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  backgroundColor: tokens.color.background,

  padding: tokens.spacing['1'],
})
export const stepBodyLayout = style({
  marginInline: tokens.spacing['6'],
  paddingBottom: tokens.spacing['4'],
})
export const stepBodyLayout2 = style({
  marginTop: tokens.spacing['3'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.emphasis,
  borderColor: tokens.color.gray4,
  paddingInlineStart: tokens.spacing['5'],
})
export const stepBodyLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  paddingBlock: tokens.spacing['0_5'],
})
export const detailLineLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: tokens.spacing['2'],

  rowGap: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
})
export const detailLineText = style({
  color: tokens.color.gray9,
})
export const detailLineText2 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',
  color: tokens.color.gray12,
})
export const depositModeSelectorButtonState = style({
  borderRadius: tokens.radius.md,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['1_5'],
  fontSize: tokens.fontSize.compact,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.tight,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const depositModeSelectorButtonState2 = style({
  backgroundColor: inherited.color.backgroundColorInvert,

  color: inherited.color.textColorInvert,
})
export const depositModeSelectorButtonState3 = style({
  color: tokens.color.gray10,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.gray12,
      },
    },
  },
})
