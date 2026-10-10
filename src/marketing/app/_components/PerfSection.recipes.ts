import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const tpsSparkIcon = style({
  height: tokens.spacing['40'],
  width: '100%',
})
export const laneSparkLayout = style({
  position: 'relative',
  height: tokens.spacing['40'],
  overflow: 'hidden',
})
export const laneSparkLayout2 = style({
  position: 'absolute',
  insetInline: '0',
  top: '0',
  height: '58%',
})
export const laneSparkLayout3 = style({
  position: 'absolute',
  inset: '0',
  backgroundColor: tokens.color.background,
})
export const laneSparkDescription = style({
  position: 'absolute',
  top: tokens.spacing['2'],
  insetInlineStart: tokens.spacing['3'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.micro,

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const laneSparkIcon = style({
  position: 'absolute',
  insetInline: '0',
  bottom: '0',
  height: 'calc(3 / 5 * 100%)',
  width: '100%',
})
export const laneSparkLayout4 = style({
  position: 'absolute',
  insetInline: '0',
  top: '58%',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  '--tempo-style-border-style': 'dashed',
  borderStyle: 'dashed',
  borderColor: tokens.color.lineStrong,
})
export const laneSparkLayout5 = style({
  position: 'absolute',
  insetInline: '0',
  bottom: '0',
  height: '42%',

  backgroundColor: inherited.color.colorMixInOklabIndicatorGreen5Transparent,
})
export const laneSparkDescription2 = style({
  position: 'absolute',
  top: tokens.spacing['2'],
  insetInlineStart: tokens.spacing['3'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.micro,

  letterSpacing: inherited.letterSpacing.trackingWider,

  color: inherited.color.colorMixInOklabIndicatorGreen80Transparent,
})
export const laneSparkIcon2 = style({
  position: 'absolute',
  inset: '0',
  height: '100%',
  width: '100%',
})
export const path = style({
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})
export const uptimeSparkLayout = style({
  display: 'flex',
  height: tokens.spacing['20'],
  alignItems: 'stretch',
  gap: tokens.spacing['0_5'],
})
export const uptimeSparkLayout2 = style({
  flex: '1 1 0%',
  borderRadius: tokens.radius.hairline,

  backgroundColor: inherited.color.colorMixInOklabIndicatorGreen65Transparent,
})
export const link = style({
  display: 'flex',
  height: '100%',
  minHeight: '310px',
  flexDirection: 'column',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['6'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: tokens.borderWidth.none,
    },
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.card,
      },
    },
  },
  '@media (width >= 40rem)': {
    minHeight: '360px',
  },
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['8'],
  },
})
export const statCardLayout = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
})
export const statCardDescription = style({
  fontFamily: tokens.fontFamily.book,

  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.heading,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.subheading,
  },
})
export const statCardDescription2 = style({
  marginTop: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.title,
  letterSpacing: tokens.letterSpacing.tight,

  color: inherited.color.colorMixInOklabForeground55Transparent,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.heading,
  },
})
export const arrowUpRight = style({
  marginTop: tokens.spacing['1'],
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground25Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
      },
    },
  },
})
export const statCardLayout2 = style({
  display: 'flex',
  flex: '1 1 0%',
  alignItems: 'center',
  paddingBlock: tokens.spacing['8'],
})
export const statCardDescription3 = style({
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(3rem, 7vw, 5.25rem) !custom',
  lineHeight: tokens.lineHeight.none,
  letterSpacing: tokens.letterSpacing.display,

  color: inherited.color.colorMixInOklabForeground55Transparent,
})
export const statCardLayout3 = style({
  marginBlock: 'auto !custom',
  paddingBlock: tokens.spacing['8'],
  selectors: {
    '&:empty': {
      display: 'none',
    },
  },
})
export const statCardDescription4 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const perfSectionSection = style({
  position: 'relative',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: tokens.spacing['5'],
  textAlign: 'center',
})
export const perfSectionHeading = style({
  maxWidth: '700px',
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(2rem, 6vw, 3rem) !custom',
  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const perfSectionButton = style({
  marginTop: tokens.spacing['9'],
})
export const reveal2 = style({
  marginTop: tokens.spacing['14'],
})
export const perfSectionLayout = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 40rem)': {
    gridAutoRows: 'minmax(0, 1fr)',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
  },
})
export const perfSectionStateState = style({
  '@media (width >= 40rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
  },
  '@media (width >= 64rem)': {
    gridColumn: 'span 2 / span 2',
  },
})
export const perfSectionStateState2 = style({
  '@media (width >= 40rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
  },
  '@media (width >= 64rem)': {
    gridColumn: 'span 3 / span 3',
  },
})

export const throughputCard = style({
  '@media (width >= 64rem)': { gridColumn: 'span 4 / span 4' },
})
export const uptimeCard = style({ '@media (width >= 64rem)': { gridColumn: 'span 3 / span 3' } })
