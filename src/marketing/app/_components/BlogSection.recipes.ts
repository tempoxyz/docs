import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: tokens.spacing['5'],
  textAlign: 'center',
})
export const blogSectionHeading = style({
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(2rem, 6vw, 3rem) !custom',
  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const blogSectionDescription = style({
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
export const blogSectionText = style({
  color: tokens.color.foreground,
})
export const reveal2 = style({
  marginTop: tokens.spacing['16'],
})
export const link = style({
  display: 'grid',
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
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
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const blogSectionLayout = style({
  position: 'relative',
  height: '200px',
  overflow: 'hidden',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 64rem)': {
    order: 2,
    height: 'auto',
    minHeight: '280px',
    borderBottomStyle: 'solid',
    borderBottomWidth: tokens.borderWidth.none,
    borderInlineStartStyle: 'solid',
    borderInlineStartWidth: tokens.borderWidth.hairline,
  },
})
export const blogSectionLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: tokens.spacing['4'],
  padding: tokens.spacing['6'],
  '@media (width >= 64rem)': {
    order: 1,
    padding: tokens.spacing['10'],
  },
})
export const blogSectionHeading2 = style({
  maxWidth: '480px',
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(1.5rem, 3.5vw, 2.125rem) !custom',

  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const blogSectionDescription2 = style({
  maxWidth: '480px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,

  lineHeight: tokens.lineHeight.normal,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const blogSectionDescription3 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  letterSpacing: tokens.letterSpacing.wider,

  color: inherited.color.colorMixInOklabForeground40Transparent,
  textTransform: 'uppercase',
})
export const blogSectionLayout3 = style({
  position: 'relative',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  marginTop: '-1px !custom',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const link2 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['5'],
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing['12'],
    paddingInline: tokens.spacing['8'],
  },
})
export const blogSectionText2 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const blogSectionText3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
export const blogSectionText4 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  letterSpacing: tokens.letterSpacing.wider,
  whiteSpace: 'nowrap',

  color: inherited.color.colorMixInOklabForeground40Transparent,
  textTransform: 'uppercase',
})
export const link3 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
