import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const storyPointsListList = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const storyPointsListList2 = style({
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const storyPointsListText = style({
  marginTop: tokens.spacing['0_5'],
  width: tokens.spacing['5'],
  height: tokens.spacing['5'],
  flexShrink: 0,
})
export const storyPointsListHeading = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.lead,
  lineHeight: tokens.lineHeight.heading,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const storyPointsListDescription = style({
  marginTop: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,

  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,
})
export const storyPointsListDescription2 = style({
  color: inherited.color.colorMixInOklabForeground55Transparent,
})
export const storyPointsListDescription3 = style({
  color: inherited.color.colorMixInOklabForeground45Transparent,
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground55Transparent,
      },
    },
  },
})
export const storyPointsListItem = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: tokens.borderWidth.none,
    },
  },
  '@media (width >= 40rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: tokens.borderWidth.none,
    selectors: {
      '&:last-child': {
        borderInlineEndStyle: 'solid',
        borderInlineEndWidth: tokens.borderWidth.none,
      },
    },
  },
  '@media (width >= 64rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.none,
    borderBottomStyle: 'solid',
    borderBottomWidth: tokens.borderWidth.hairline,
    selectors: {
      '&:last-child': {
        borderBottomStyle: 'solid',
        borderBottomWidth: tokens.borderWidth.none,
      },
    },
  },
})
export const storyPointsListButton = style({
  display: 'flex',
  height: '100%',
  width: '100%',
  alignItems: 'flex-start',
  gap: tokens.spacing['4'],
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['6'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['12'],
  },
})
export const storyPointsListButton2 = style({
  backgroundColor: tokens.color.block,
})
export const storyPointsListButton3 = style({
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.block,
      },
    },
  },
})
export const storyPointsListLayout = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: tokens.spacing['4'],
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['6'],
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['12'],
  },
})
export const storySectionSection2 = style({
  scrollMarginTop: tokens.spacing['12'],
})
export const storySectionSection = style({
  marginTop: tokens.spacing['36'],
})
export const reveal = style({
  position: 'relative',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const storySectionLayout = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const storySectionLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  textAlign: 'left',
  '@media (width >= 64rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: tokens.borderWidth.none,
  },
})
export const storySectionLayout3 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['14'],
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['12'],
    paddingBlock: tokens.spacing['20'],
  },
})
export const storySectionHeading = style({
  maxWidth: '620px',
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(1.5rem, 5vw, 2.5rem) !custom',

  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.heading,
  textWrap: 'balance',
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const storySectionDescription = style({
  marginTop: tokens.spacing['6'],
  maxWidth: '620px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.normal,
  letterSpacing: tokens.letterSpacing.normal,
  textWrap: 'balance',

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const storySectionLayout4 = style({
  marginTop: tokens.spacing['9'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
})
export const storySectionLayout5 = style({
  position: 'relative',
  '@media (width >= 64rem)': {
    minHeight: '620px',
  },
})
export const storySectionLayout6 = style({
  position: 'absolute',
  insetInlineEnd: tokens.spacing['5'],
  bottom: tokens.spacing['5'],
  zIndex: tokens.zIndex.overlay,
  '@media (width >= 64rem)': {
    insetInlineEnd: tokens.spacing['8'],
    bottom: tokens.spacing['8'],
  },
})
export const storySectionLayout7 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media (width >= 64rem)': {
    position: 'absolute',
    inset: '0',
    minHeight: '0',
  },
})
export const storySectionLayout8 = style({
  display: 'grid',
  '@media (width >= 64rem)': {
    height: '100%',
    minHeight: '0',
  },
})
export const storySectionLayout9 = style({
  gridArea: '1/1',
})
export const storySectionLayout10 = style({
  display: 'none',
})
export const storySectionLayout11 = style({
  display: 'flex',
  minHeight: '420px',
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.spacing['6'],
  paddingBottom: tokens.spacing['20'],
  '@media (width >= 64rem)': {
    height: '100%',
    minHeight: '0',
    padding: tokens.spacing['10'],
    paddingBottom: tokens.spacing['24'],
  },
})
export const storySectionLayout12 = style({
  width: '100%',
  maxWidth: '560px',
})
export const storyPointsListStateState = style({
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const storyPointsListStateState2 = style({
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const storyPointsListTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundImage': values.value0,
  backgroundImage: 'var(--tempo-backgroundImage)',
  backgroundSize: '5px 5px',
}))
