import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const settlementStreamLayout = style({
  position: 'relative',
  width: '100%',
})
export const settlementStreamDescription = style({
  position: 'absolute',
  insetInlineEnd: '0',
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.micro,

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabForeground40Transparent,
})
export const settlementStreamText = style({
  display: 'block',
  width: tokens.spacing['1_5'],
  height: tokens.spacing['1_5'],
  flexShrink: 0,
  borderRadius: tokens.radius.full,
})
export const settlementStreamText2 = style({
  backgroundColor: inherited.color.indicatorGreen,
})
export const settlementStreamText3 = style({
  backgroundColor: inherited.color.colorMixInOklabForeground25Transparent,
})
export const settlementStreamLayout2 = style({
  position: 'absolute',
  insetInline: '0',
  overflow: 'hidden',
})
export const settlementStreamLayout3 = style({
  position: 'absolute',
  top: '0',
  insetInlineEnd: '0',
  transitionTimingFunction: 'var(--ease-out)',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const settlementStreamLayout4 = style({
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '300ms',
})
export const settlementStreamLink = style({
  display: 'block',
  '--tempo-style-outline-style': 'none',
  outlineStyle: 'none',
})
export const settlementStreamLayout5 = style({
  display: 'flex',
  width: tokens.spacing['16'],
  height: tokens.spacing['16'],
  alignItems: 'center',
  justifyContent: 'center',
  borderColor: tokens.color.lineStrong,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.card,
      },
    },
    '&:is(:where(.group):focus-visible *)': {
      backgroundColor: tokens.color.card,
    },
  },
})
export const settlementStreamLayout6 = style({
  backgroundColor: inherited.color.surfacePanel,
})
export const settlementStreamText4 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.lead,
  lineHeight: tokens.lineHeight.none,

  color: inherited.color.indicatorGreen,
})
export const settlementStreamDescription2 = style({
  marginTop: tokens.spacing['1_5'],
  textAlign: 'center',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.micro,

  letterSpacing: inherited.letterSpacing.trackingWide,

  color: inherited.color.colorMixInOklabForeground25Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground45Transparent,
      },
    },
    '&:is(:where(.group):focus-visible *)': {
      color: inherited.color.colorMixInOklabForeground45Transparent,
    },
  },
})
export const settlementStreamDescription3 = style({
  position: 'absolute',
  insetInlineEnd: '0',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.tiny,

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabForeground35Transparent,
})
export const settlementStreamLayout7 = style({
  pointerEvents: 'none',
  position: 'absolute',
  insetBlock: '0',
  insetInlineStart: '0',
  width: tokens.spacing['16'],
  '--tempo-style-gradient-position': 'to right in oklab',
  backgroundImage: 'linear-gradient(var(--tempo-style-gradient-stops))',
  '--tempo-style-gradient-from': 'var(--surface-shell)',
  '--tempo-style-gradient-stops':
    'var(--tempo-style-gradient-via-stops, var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position))',
  '--tempo-style-gradient-to': 'transparent',
})
export const settlementStreamLayout8 = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
})
export const settlementStreamText5 = style({
  height: tokens.spacing['2'],
  width: '1px',

  backgroundColor: inherited.color.colorMixInOklabForeground25Transparent,
})
export const settlementStreamText6 = style({
  height: '1px',
  flex: '1 1 0%',

  backgroundColor: inherited.color.colorMixInOklabForeground25Transparent,
})
export const settlementStreamDescription4 = style({
  position: 'absolute',
  textAlign: 'center',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.micro,

  lineHeight: inherited.lineHeight.leadingTight,

  color: inherited.color.colorMixInOklabForeground35Transparent,
})
export const settlementStreamText7 = style({
  display: 'block',

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabForeground30Transparent,
})
export const settlementStreamText8 = style({
  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const settlementStreamLayoutAppearance = instanceStyle(
  (values: { value0: `${number}px` }) => ({ height: values.value0 }),
)
export const settlementStreamDescriptionAppearance = instanceStyle(
  (values: { value0: `${number}px` }) => ({ top: values.value0 }),
)
export const settlementStreamLayoutAppearance2 = instanceStyle(
  (values: { value0: `${number}px`; value1: `${number}px` }) => ({
    top: values.value0,
    height: values.value1,
  }),
)
export const settlementStreamLayoutAppearance3 = instanceStyle((values: { value0: string }) => ({
  '--tempo-transform': values.value0,
  transform: 'var(--tempo-transform)',
}))
export const settlementStreamDescriptionAppearance2 = instanceStyle(
  (values: { value0: `${number}px` }) => ({ top: values.value0 }),
)
export const settlementStreamLayoutAppearance4 = instanceStyle(
  (values: { value0: `${number}px`; value1: `${number}px`; value2: `${number}px` }) => ({
    insetInlineEnd: values.value0,
    width: values.value1,
    top: values.value2,
  }),
)
export const settlementStreamDescriptionAppearance3 = instanceStyle(
  (values: { value0: `${number}px`; value1: `${number}px`; value2: `${number}px` }) => ({
    insetInlineEnd: values.value0,
    width: values.value1,
    top: values.value2,
  }),
)
