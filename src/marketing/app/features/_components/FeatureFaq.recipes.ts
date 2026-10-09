import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const featureFaqSection = style({
  marginTop: tokens.spacing['36'],
  scrollMarginTop: tokens.spacing['12'],
})
export const reveal = style({
  position: 'relative',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const featureFaqLayout = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 64rem)': {
    gridTemplateColumns: '0.78fr 1.22fr',
  },
})
export const featureFaqLayout2 = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['14'],
  '@media (width >= 64rem)': {
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: tokens.borderWidth.hairline,
    borderBottomStyle: 'solid',
    borderBottomWidth: tokens.borderWidth.none,
    paddingInline: tokens.spacing['12'],
    paddingBlock: tokens.spacing['20'],
  },
})
export const featureFaqHeading = style({
  maxWidth: '520px',
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
export const featureFaqDescription = style({
  marginTop: tokens.spacing['5'],
  maxWidth: '500px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.normal,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const featureFaqLayout3 = style({
  backgroundColor: tokens.color.shell,
})
export const featureFaqLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflow: 'hidden',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  transitionProperty: 'height,background-color',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '300ms',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: tokens.borderWidth.none,
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['10'],
  },
})
export const featureFaqLayout5 = style({
  height: '236px',
  backgroundColor: tokens.color.block,
  '@media (width >= 48rem)': {
    height: '220px',
  },
})
export const featureFaqLayout6 = style({
  height: '116px',
})
export const featureFaqButton = style({
  display: 'flex',
  width: '100%',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: tokens.spacing['6'],
  textAlign: 'left',
})
export const featureFaqText = style({
  maxWidth: '720px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,
  lineHeight: tokens.lineHeight.heading,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.title,
  },
})
export const featureFaqText2 = style({
  marginTop: tokens.spacing['1'],
  display: 'grid',
  width: tokens.spacing['6'],
  height: tokens.spacing['6'],
  flexShrink: 0,
  placeItems: 'center',
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.none,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const featureFaqText3 = style({
  backgroundColor: tokens.color.foreground,
  color: tokens.color.background,
})
export const featureFaqText4 = style({
  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const featureFaqLayout7 = style({
  display: 'grid',
  maxWidth: '720px',
  transitionProperty: 'grid-template-rows,opacity,margin-top',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '300ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const featureFaqLayout8 = style({
  marginTop: tokens.spacing['5'],
  gridTemplateRows: '1fr',
  opacity: '100%',
})
export const featureFaqLayout9 = style({
  marginTop: tokens.spacing['0'],
  gridTemplateRows: '0fr',
  opacity: '0%',
})
export const featureFaqLayout10 = style({
  overflow: 'hidden',
})
export const featureFaqDescription2 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,

  lineHeight: tokens.lineHeight.normal,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const featureFaqLink = style({
  color: inherited.color.colorMixInOklabForeground75Transparent,
  textDecorationLine: 'underline',

  textDecorationColor: inherited.color.colorMixInOklabForeground25Transparent,
  textUnderlineOffset: '4px',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
        textDecorationColor: tokens.color.foreground,
      },
    },
  },
})
