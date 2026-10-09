import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const searchIconIcon = style({
  flexShrink: 0,
})
export const pageIconIcon = style({
  marginTop: metrics.spacing['0_5'],
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const resultRowLayout = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'flex-start',
  gap: metrics.spacing['3'],
  paddingInline: metrics.spacing['4'],
  paddingBlock: metrics.spacing['2_5'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const resultRowLayout2 = style({
  backgroundColor: 'color-mix(in oklab, var(--foreground) 6%, transparent)',
})
export const resultRowText = style({
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: metrics.spacing['0_5'],
})
export const resultRowText2 = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '12px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const resultRowText3 = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const resultRowText4 = style({
  overflow: 'hidden',
  // Legacy box layout is required by the cross-browser line-clamp implementation.
  '--tempo-clamp-display': '-webkit-box',
  display: 'var(--tempo-clamp-display)',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '13px',
  lineHeight: 1.4,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const searchDialogLayout = style({
  paddingInline: metrics.spacing['4'],
  paddingBlock: metrics.spacing['10'],
  textAlign: 'center',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const searchDialogLayout2 = style({
  paddingBlock: metrics.spacing['2'],
})
export const searchDialogLayout3 = style({
  position: 'fixed',
  inset: '0',
  zIndex: 200,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  backgroundColor: 'color-mix(in oklab, var(--color-black) 60%, transparent)',
  paddingInline: metrics.spacing['4'],
  paddingTop: '12vh',
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
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-page)',
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
})
export const searchDialogLayout5 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['3'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['4'],
  paddingBlock: metrics.spacing['3'],
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
})
export const searchDialogInput = style({
  flex: '1 1 0%',
  backgroundColor: 'transparent',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  letterSpacing: '0',
  color: 'var(--foreground)',
  '--tempo-style-outline-style': 'none',
  outlineStyle: 'none',
  selectors: {
    '&::placeholder': {
      color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
    },
  },
})
export const kbd = style({
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['1_5'],
  paddingBlock: metrics.spacing['0_5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '11px',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
})
export const searchDialogLayout6 = style({
  flex: '1 1 0%',
  overflowY: 'auto',
})
