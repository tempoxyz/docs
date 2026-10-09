import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const visualMockLayout = style({
  '@media (width >= 64rem)': {
    // design-exception: Derive this layout value from the existing responsive CSS variables.
    marginInline: 'calc(var(--spacing) * -10) !custom',
  },
})
export const reveal = style({
  position: 'relative',
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 64rem)': {
    display: 'flex',
  },
})
export const reveal2 = style({
  '@media (width >= 64rem)': {
    alignItems: 'stretch',
  },
})
export const transactionsShowcaseLayout = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: tokens.color.shell,
  padding: tokens.spacing['7'],
  '@media (width >= 64rem)': {
    width: 'calc(1 / 2 * 100%)',
    padding: tokens.spacing['12'],
  },
})
export const transactionsShowcaseHeading = style({
  maxWidth: '520px',
  fontFamily: tokens.fontFamily.book,
  // design-exception: Preserve this responsive geometry across viewport sizes.
  fontSize: 'clamp(1.5rem, 5vw, 2.5rem) !custom',
  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const transactionsShowcaseLayout2 = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginInline: 'calc(var(--spacing) * -7) !custom',
  marginTop: tokens.spacing['8'],
  borderBlockStyle: 'solid',
  borderBlockWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  '@media (width >= 64rem)': {
    // design-exception: Derive this layout value from the existing responsive CSS variables.
    marginInline: 'calc(var(--spacing) * -12) !custom',
  },
})
export const transactionsShowcaseButton = style({
  display: 'flex',
  width: '100%',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: tokens.spacing['6'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['7'],
  paddingBlock: tokens.spacing['5'],
  textAlign: 'left',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: tokens.borderWidth.none,
    },
  },
  '@media (width >= 64rem)': {
    paddingInline: tokens.spacing['12'],
  },
})
export const transactionsShowcaseButton2 = style({
  color: tokens.color.foreground,
})
export const transactionsShowcaseButton3 = style({
  color: inherited.color.colorMixInOklabForeground55Transparent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground80Transparent,
      },
    },
  },
})
export const transactionsShowcaseText = style({
  display: 'block',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,
  lineHeight: tokens.lineHeight.heading,
  letterSpacing: tokens.letterSpacing.normal,
})
export const transactionsShowcaseText2 = style({
  marginTop: tokens.spacing['2'],
  display: 'block',
  maxWidth: '420px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,

  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground55Transparent,
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground65Transparent,
      },
    },
  },
})
export const transactionsShowcaseText3 = style({
  marginTop: tokens.spacing['1_5'],
  width: tokens.spacing['2'],
  height: tokens.spacing['2'],
  flexShrink: 0,
})
export const transactionsShowcaseText4 = style({
  backgroundColor: tokens.color.foreground,
})
export const transactionsShowcaseText5 = style({
  backgroundColor: inherited.color.colorMixInOklabForeground25Transparent,
})
export const transactionsShowcaseLayout3 = style({
  marginTop: tokens.spacing['10'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: tokens.spacing['2_5'],
  '@media (width >= 64rem)': {
    justifyContent: 'flex-start',
  },
})
export const transactionsShowcaseLayout4 = style({
  position: 'relative',
  display: 'flex',
  minHeight: '360px',
  alignItems: 'center',
  justifyContent: 'center',
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  padding: tokens.spacing['6'],
  paddingTop: tokens.spacing['18'],
  '@media (width >= 64rem)': {
    width: 'calc(1 / 2 * 100%)',
    borderTopStyle: 'solid',
    borderTopWidth: tokens.borderWidth.none,
    borderInlineStartStyle: 'solid',
    borderInlineStartWidth: tokens.borderWidth.hairline,
    padding: tokens.spacing['10'],
    paddingTop: tokens.spacing['18'],
  },
})
export const transactionsShowcaseLayout5 = style({
  position: 'absolute',
  top: tokens.spacing['6'],
  insetInlineEnd: tokens.spacing['6'],
  zIndex: tokens.zIndex.overlay,
  '@media (width >= 64rem)': {
    top: tokens.spacing['8'],
    insetInlineEnd: tokens.spacing['10'],
  },
})
export const transactionsShowcaseLayout6 = style({
  display: 'grid',
  width: '100%',
  maxWidth: '560px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
})
export const transactionsShowcaseLayout7 = style({
  paddingBottom: tokens.spacing['16'],
})
export const transactionsShowcaseStateState = style({
  padding: tokens.spacing['6'],
  '@media (width >= 64rem)': {
    minHeight: '0',
    padding: tokens.spacing['10'],
  },
})
