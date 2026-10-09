import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { style as instanceStyle } from '../../../styles/scoped'
import { vars as tokens } from '../../../styles/theme'
export const heroSection = style({
  position: 'relative',
  isolation: 'isolate',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingTop: tokens.spacing['18'],
  paddingBottom: tokens.spacing['12'],
  '@media (width >= 64rem)': {
    paddingTop: tokens.spacing['28'],
    paddingBottom: tokens.spacing['16'],
  },
})
export const heroLayout = style({
  pointerEvents: 'none',
  position: 'absolute',
  inset: '0',
  zIndex: tokens.zIndex.decoration,
  '--tempo-style-gradient-position': 'to bottom in oklab',
  backgroundImage: 'linear-gradient(var(--tempo-style-gradient-stops))',
  '--tempo-style-gradient-from': 'var(--surface-shell)',
  '--tempo-style-gradient-stops':
    'var(--tempo-style-gradient-via-stops, var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position))',
  '--tempo-style-gradient-from-position': '0%',
  '--tempo-style-gradient-via': 'color-mix(in oklab, var(--surface-shell) 95%, transparent)',
  '--tempo-style-gradient-via-stops':
    'var(--tempo-style-gradient-position), var(--tempo-style-gradient-from) var(--tempo-style-gradient-from-position), var(--tempo-style-gradient-via) var(--tempo-style-gradient-via-position), var(--tempo-style-gradient-to) var(--tempo-style-gradient-to-position)',
  '--tempo-style-gradient-via-position': '50%',
  '--tempo-style-gradient-to': 'transparent',
  '--tempo-style-gradient-to-position': '100%',
})
export const reveal = style({
  marginInline: 'auto !custom',
  display: 'flex',
  width: '100%',
  maxWidth: '860px',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
})
export const heroTitle = style({
  maxWidth: '820px',
  fontFamily: tokens.fontFamily.book,

  fontSize: tokens.fontSize.display,

  lineHeight: tokens.lineHeight.none,
  letterSpacing: tokens.letterSpacing.heading,
  color: tokens.color.foreground,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  '@media (width >= 40rem)': {
    fontSize: tokens.fontSize.displayLarge,
  },
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.hero,
  },
})
export const heroDescription = style({
  marginTop: tokens.spacing['5'],
  maxWidth: '640px',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.normal,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.muted,
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.lead,
  },
})
export const nav = style({
  marginTop: tokens.spacing['9'],
  display: 'flex',
  width: '100%',
  maxWidth: '420px',
  flexDirection: 'column',
  gap: tokens.spacing['2_5'],
  '@media (width >= 40rem)': {
    maxWidth: 'none',
    flexDirection: 'row',
    justifyContent: 'center',
  },
})
export const heroButton = style({
  height: tokens.spacing['12'],
  width: '100%',
  paddingInline: tokens.spacing['6'],
  '@media (width >= 40rem)': {
    width: 'auto',
  },
})
export const heroLayout2 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: tokens.spacing['2_5'],
  '@media (width >= 40rem)': {
    display: 'contents',
  },
})
export const nav2 = style({
  marginInline: 'auto !custom',
  marginTop: tokens.spacing['16'],
  width: '100%',
  maxWidth: 'var(--container-5xl)',
  scrollMarginTop: tokens.spacing['12'],
  '@media (width >= 64rem)': {
    marginTop: tokens.spacing['20'],
  },
})
export const heroList = style({
  display: 'grid',

  gap: tokens.spacing['0'],
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.line,
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const heroItem = style({
  backgroundColor: tokens.color.shell,
})
export const link = style({
  display: 'flex',
  height: '100%',
  minHeight: '150px',
  flexDirection: 'column',
  padding: tokens.spacing['5'],
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
})
export const heroText = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: tokens.spacing['4'],
})
export const heroText2 = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  flexShrink: 0,
})
export const arrowUpRight = style({
  width: tokens.spacing['5'],
  height: tokens.spacing['5'],
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground30Transparent,
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
export const heroText3 = style({
  marginTop: tokens.spacing['7'],
  display: 'block',
})
export const heroText4 = style({
  display: 'block',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.lead,

  lineHeight: tokens.lineHeight.display,
  letterSpacing: tokens.letterSpacing.normal,
  textWrap: 'wrap',
  color: tokens.color.foreground,
  '@media (width >= 40rem)': {
    fontSize: tokens.fontSize.subheading,
  },
  '@media (width >= 64rem)': {
    fontSize: tokens.fontSize.subheading,
  },
  '@media (width >= 80rem)': {
    fontSize: tokens.fontSize.titleSmall,
  },
})
export const heroText5 = style({
  marginTop: tokens.spacing['3'],
  overflow: 'hidden',
  display: 'block',
  // design-exception: WebKit line clamping requires this legacy orientation property.
  WebkitBoxOrient: 'vertical !custom',
  WebkitLineClamp: 2,
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.muted,
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
export const heroTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundImage': values.value0,
  backgroundImage: 'var(--tempo-backgroundImage)',
  backgroundSize: '5px 5px',
}))
