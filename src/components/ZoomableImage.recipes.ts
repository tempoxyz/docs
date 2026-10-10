import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const img = style({
  cursor: 'zoom-in',
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#F9F9F9 !custom',
  padding: tokens.spacing['2_5'],
  transitionProperty: 'opacity',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        opacity: '80%',
      },
    },
  },
})
export const zoomableImageLayout = style({
  position: 'fixed',
  inset: '0',
  zIndex: tokens.zIndex.toast,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  backgroundColor: inherited.color.colorMixInOklabColorBlack80Transparent,
  padding: tokens.spacing['8'],
})
export const zoomableImageLayout2 = style({
  position: 'relative',
  display: 'flex',
  height: '90vh',
  width: '90vw',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: tokens.radius.xl,
  '--corner-radius': tokens.radius.xl,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#F9F9F9 !custom',
  padding: tokens.spacing['8'],
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
})
export const zoomableImageButton = style({
  position: 'absolute',
  top: tokens.spacing['4'],
  insetInlineEnd: tokens.spacing['4'],
  zIndex: tokens.zIndex.raised,
  display: 'flex',
  height: tokens.spacing['10'],
  width: tokens.spacing['10'],
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: tokens.radius.full,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
  backgroundColor: tokens.color.gray3,
  color: tokens.color.gray12,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.gray4,
      },
    },
  },
})
export const img2 = style({
  maxHeight: '100%',
  maxWidth: '100%',
  cursor: 'zoom-out',
  borderRadius: tokens.radius.smRem,
  objectFit: 'contain',
})
