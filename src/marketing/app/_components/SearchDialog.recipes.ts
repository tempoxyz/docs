import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const searchIconIcon = style({
  flexShrink: 0,
})
export const pageIconIcon = style({
  marginTop: tokens.spacing['0_5'],
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground40Transparent,
})
export const resultRowLayout = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'flex-start',
  gap: tokens.spacing['3'],
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['2_5'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const resultRowLayout2 = style({
  backgroundColor: inherited.color.colorMixInOklabForeground6Transparent,
})
export const resultRowText = style({
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: tokens.spacing['0_5'],
})
export const resultRowText2 = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.xs,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const resultRowText3 = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const resultRowText4 = style({
  overflow: 'hidden',
  // Legacy box layout is required by the cross-browser line-clamp implementation.
  '--tempo-clamp-display': '-webkit-box',
  display: 'var(--tempo-clamp-display)',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const searchDialogLayout = style({
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['10'],
  textAlign: 'center',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,

  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const searchDialogLayout2 = style({
  paddingBlock: tokens.spacing['2'],
})
export const searchDialogLayout3 = style({
  position: 'fixed',
  inset: '0',
  zIndex: tokens.zIndex.dialog,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',

  backgroundColor: inherited.color.colorMixInOklabColorBlack60Transparent,
  paddingInline: tokens.spacing['4'],
  // design-exception: Preserve this responsive geometry across viewport sizes.
  paddingTop: '12vh !custom',
  '--tempo-style-backdrop-blur': 'blur(var(--blur-sm))',
  WebkitBackdropFilter:
    'var(--tempo-style-backdrop-blur,) var(--tempo-style-backdrop-brightness,) var(--tempo-style-backdrop-contrast,) var(--tempo-style-backdrop-grayscale,) var(--tempo-style-backdrop-hue-rotate,) var(--tempo-style-backdrop-invert,) var(--tempo-style-backdrop-opacity,) var(--tempo-style-backdrop-saturate,) var(--tempo-style-backdrop-sepia,)',
  backdropFilter:
    'var(--tempo-style-backdrop-blur,) var(--tempo-style-backdrop-brightness,) var(--tempo-style-backdrop-contrast,) var(--tempo-style-backdrop-grayscale,) var(--tempo-style-backdrop-hue-rotate,) var(--tempo-style-backdrop-invert,) var(--tempo-style-backdrop-opacity,) var(--tempo-style-backdrop-saturate,) var(--tempo-style-backdrop-sepia,)',
})
export const searchDialogLayout4 = style({
  display: 'flex',
  maxHeight: '70vh',
  width: '100%',
  maxWidth: '600px',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,

  backgroundColor: inherited.color.surfacePage,
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
})
export const searchDialogLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['3'],

  color: inherited.color.colorMixInOklabForeground60Transparent,
})
export const searchDialogInput = style({
  flex: '1 1 0%',
  backgroundColor: 'transparent !custom',
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
  '--tempo-style-outline-style': 'none',
  outlineStyle: 'none',
  selectors: {
    '&::placeholder': {
      color: inherited.color.colorMixInOklabForeground40Transparent,
    },
  },
})
export const kbd = style({
  borderRadius: tokens.radius.smRem,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['1_5'],
  paddingBlock: tokens.spacing['0_5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.caption,

  color: inherited.color.colorMixInOklabForeground40Transparent,
})
export const searchDialogLayout6 = style({
  flex: '1 1 0%',
  overflowY: 'auto',
})
