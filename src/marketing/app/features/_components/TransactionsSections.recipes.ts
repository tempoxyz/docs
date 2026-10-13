import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { style as instanceStyle } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'
export const accessKeysSectionSection = style({
  marginTop: tokens.spacing['36'],
  scrollMarginTop: tokens.spacing['12'],
})
export const reveal = style({
  position: 'relative',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const accessKeysSectionLayout = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const accessKeysSectionLayout2 = style({
  position: 'relative',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 64rem)': {
    minHeight: '0',
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: tokens.borderWidth.none,
  },
})
export const accessKeysSectionLayout3 = style({
  position: 'absolute',
  insetInlineEnd: tokens.spacing['5'],
  bottom: tokens.spacing['5'],
  zIndex: tokens.zIndex.overlay,
  '@media (width >= 64rem)': {
    insetInlineEnd: tokens.spacing['8'],
    bottom: tokens.spacing['8'],
  },
})
export const accessKeysSectionLayout4 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media (width >= 64rem)': {
    position: 'absolute',
    inset: '0',
    minHeight: '0',
  },
})
export const accessKeysSectionLayout5 = style({
  display: 'grid',
  '@media (width >= 64rem)': {
    height: '100%',
    minHeight: '0',
  },
})
export const accessKeysSectionLayout6 = style({
  gridArea: '1/1',
})
export const accessKeysSectionLayout7 = style({
  display: 'none',
})
export const accessKeysSectionLayout8 = style({
  display: 'flex',
  minHeight: '520px',
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
export const accessKeysSectionLayout9 = style({
  width: '100%',
  maxWidth: '600px',
})
export const accessKeysSectionLayout10 = style({
  backgroundColor: tokens.color.shell,
})
export const accessKeysSectionLayout11 = style({
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['14'],
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['12'],
    paddingBlock: tokens.spacing['20'],
  },
})
export const accessKeysSectionHeading = style({
  maxWidth: '560px',
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(2rem, 6vw, 3rem) !custom',

  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.heading,
  textWrap: 'balance',
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const accessKeysSectionDescription = style({
  marginTop: tokens.spacing['5'],
  maxWidth: '540px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.normal,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const accessKeysSectionLayout12 = style({
  marginTop: tokens.spacing['8'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
})
export const accessKeysSectionLayout13 = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const link = style({
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
        backgroundColor: tokens.color.block,
      },
    },
  },
  '@media (width >= 40rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
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
    paddingInline: tokens.spacing['12'],
  },
})
export const accessKeysSectionHeading2 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.lead,
  lineHeight: tokens.lineHeight.heading,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const accessKeysSectionDescription2 = style({
  marginTop: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,

  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground45Transparent,
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground55Transparent,
      },
    },
  },
})
export const primitiveGroupSectionSection2 = style({
  scrollMarginTop: tokens.spacing['12'],
})
export const primitiveGroupSectionSection = style({
  marginTop: tokens.spacing['36'],
})
export const reveal2 = style({
  position: 'relative',
  borderBlockStyle: 'solid',
  borderBlockWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const primitiveGroupSectionLayout = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['14'],
  textAlign: 'center',
  '@media (width >= 64rem)': {
    paddingBlock: tokens.spacing['20'],
  },
})
export const primitiveGroupSectionHeading = style({
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(2rem, 6vw, 3rem) !custom',

  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.heading,
  textWrap: 'balance',
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const primitiveGroupSectionDescription = style({
  marginTop: tokens.spacing['5'],
  maxWidth: '560px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.normal,
  letterSpacing: tokens.letterSpacing.normal,
  textWrap: 'balance',

  color: inherited.color.colorMixInOklabForeground50Transparent,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.lead,
  },
})
export const primitiveGroupSectionLayout2 = style({
  marginTop: tokens.spacing['8'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing['2_5'],
})
export const primitiveGroupSectionLayout3 = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const primitiveGroupSectionList = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 64rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: tokens.borderWidth.none,
  },
})
export const primitiveGroupSectionItem = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: tokens.borderWidth.none,
    },
  },
})
export const link2 = style({
  display: 'flex',
  height: '100%',
  width: '100%',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  padding: tokens.spacing['7'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (width >= 64rem)': {
    padding: tokens.spacing['8'],
  },
})
export const link3 = style({
  backgroundColor: tokens.color.block,
  color: tokens.color.foreground,
})
export const link4 = style({
  color: inherited.color.colorMixInOklabForeground55Transparent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.block,

        color: inherited.color.colorMixInOklabForeground80Transparent,
      },
    },
  },
})
export const primitiveGroupSectionText = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
export const primitiveGroupSectionText2 = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  flexShrink: 0,
})
export const primitiveGroupSectionText3 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,
  lineHeight: tokens.lineHeight.heading,
  letterSpacing: tokens.letterSpacing.normal,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.title,
  },
})
export const primitiveGroupSectionText4 = style({
  maxWidth: '480px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground45Transparent,
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground55Transparent,
      },
    },
  },
})
export const primitiveGroupSectionLayout4 = style({
  position: 'relative',
  '@media (width >= 64rem)': {
    minHeight: '520px',
  },
})
export const primitiveGroupSectionLayout5 = style({
  display: 'flex',
  minHeight: '460px',
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
export const primitiveGroupSectionLayout6 = style({
  width: '100%',
  maxWidth: '560px',
})
export const primitiveGroupSectionTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundImage': values.value0,
  backgroundImage: 'var(--tempo-backgroundImage)',
  backgroundSize: '5px 5px',
}))
