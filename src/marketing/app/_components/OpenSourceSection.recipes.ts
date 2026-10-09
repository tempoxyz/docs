import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { style as instanceStyle } from '../../../styles/scoped'
import { vars as tokens } from '../../../styles/theme'
export const rethBadgeLayout = style({
  position: 'absolute',
  top: '0',
  insetInlineStart: '0',
  display: 'none',
  '--tempo-style-translate-x': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  '@media (width >= 96rem)': {
    display: 'block',
  },
})
export const rethBadgeLayout2 = style({
  position: 'relative',
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,

  borderColor: inherited.color.colorMixInOklabLine30Transparent,

  backgroundColor: inherited.color.surfacePage,
  padding: tokens.spacing['2_5'],
})
export const rethBadgeLayout3 = style({
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  padding: tokens.spacing['2_5'],
})
export const openSourceSectionSection = style({
  position: 'relative',
  paddingBottom: tokens.spacing['6'],
})
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: tokens.spacing['5'],
  textAlign: 'center',
})
export const openSourceSectionHeading = style({
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(2rem, 6vw, 3rem) !custom',
  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const openSourceSectionDescription = style({
  marginTop: tokens.spacing['6'],
  maxWidth: '560px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.subheading,
  },
})
export const openSourceSectionLayout = style({
  position: 'relative',
  marginTop: tokens.spacing['16'],
})
export const openSourceSectionList = style({
  display: 'grid',
  gridAutoRows: 'minmax(0, 1fr)',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',

  gap: tokens.spacing['0'],
  borderBlockStyle: 'solid',
  borderBlockWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.line,
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (width >= 80rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const openSourceSectionItem = style({
  height: '100%',
})
export const openSourceSectionLink = style({
  display: 'flex',
  height: '100%',
  minHeight: '220px',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: tokens.color.shell,
  padding: tokens.spacing['6'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.block,
      },
    },
  },
  '@media (width >= 64rem)': {
    padding: tokens.spacing['8'],
  },
})
export const openSourceSectionText = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['4'],
})
export const openSourceSectionText2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
export const openSourceSectionText3 = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
  flexShrink: 0,
})
export const openSourceSectionText4 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.lead,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const arrowUpRight = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground35Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground80Transparent,
      },
    },
  },
})
export const openSourceSectionText5 = style({
  marginTop: tokens.spacing['8'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,

  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground65Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground85Transparent,
      },
    },
  },
})
export const openSourceSectionLink2 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing['2'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.block,
      },
    },
  },
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['8'],
  },
})
export const arrowUpRight2 = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground45Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground80Transparent,
      },
    },
  },
})
export const rethBadgeStateState = style({
  transitionProperty: 'opacity,scale',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '350ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const rethBadgeStateState2 = style({
  '--tempo-style-scale-x': '100%',
  '--tempo-style-scale-y': '100%',
  '--tempo-style-scale-z': '100%',
  scale: 'var(--tempo-style-scale-x) var(--tempo-style-scale-y)',
  opacity: '100%',
})
export const rethBadgeStateState3 = style({
  '--tempo-style-scale-x': '40%',
  '--tempo-style-scale-y': '40%',
  '--tempo-style-scale-z': '40%',
  scale: 'var(--tempo-style-scale-x) var(--tempo-style-scale-y)',
  opacity: '0%',
})
export const openSourceSectionTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundColor': values.value0,

  backgroundColor: inherited.color.tempoBackgroundColor,
}))
