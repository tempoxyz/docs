import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const main = style({
  minHeight: '100vh',
  width: '100%',

  backgroundColor: inherited.color.surfacePage,
})
export const featurePageLayout = style({
  marginInline: 'auto !custom',
  width: '100%',
  maxWidth: 'var(--container-7xl)',
  borderInlineStyle: 'solid',
  borderInlineWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.shell,
})
export const featurePageSection = style({
  position: 'relative',
  isolation: 'isolate',
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['28'],
  '@media (width >= 64rem)': {
    paddingBlock: tokens.spacing['36'],
  },
})
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})
export const featurePageTitle = style({
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(2.5rem, 7vw, 3.5rem) !custom',

  lineHeight: tokens.lineHeight.none,
  letterSpacing: tokens.letterSpacing.heading,
  textWrap: 'balance',
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const featurePageDescription = style({
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
export const featurePageLayout2 = style({
  marginTop: tokens.spacing['9'],
  display: 'flex',
  width: '100%',
  maxWidth: '420px',
  flexDirection: 'column',
  gap: tokens.spacing['2_5'],
  '@media (width >= 40rem)': {
    maxWidth: 'none',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export const featurePageButton = style({
  height: tokens.spacing['12'],
  width: '100%',
  paddingInline: tokens.spacing['6'],
  '@media (width >= 40rem)': {
    width: 'auto',
  },
})
export const featurePageLayout3 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: tokens.spacing['2_5'],
  '@media (width >= 40rem)': {
    display: 'contents',
  },
})
export const featurePageButton2 = style({
  height: tokens.spacing['12'],
  width: '100%',
  paddingInline: tokens.spacing['4'],
  '@media (width >= 40rem)': {
    width: 'auto',
    paddingInline: tokens.spacing['6'],
  },
})
export const featurePageLayout4 = style({
  scrollMarginTop: tokens.spacing['12'],
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const featurePageLayout5 = style({
  display: 'grid',
  gap: tokens.spacing['6'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['10'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    alignItems: 'flex-start',
    gap: tokens.spacing['12'],
    paddingInline: tokens.spacing['8'],
  },
})
export const featurePageLayout6 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
})
export const featurePageHeading = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.title,
  },
})
export const featurePageDescription2 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,
  textWrap: 'pretty',

  color: inherited.color.colorMixInOklabForeground50Transparent,
  '@media (width >= 64rem)': {
    maxWidth: '360px',
  },
})
