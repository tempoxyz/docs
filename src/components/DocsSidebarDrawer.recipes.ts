import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const docsSidebarDrawerButton = style({
  display: 'flex',
  minHeight: tokens.spacing['9'],
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  borderRadius: tokens.radius.md,
  fontFamily: tokens.fontFamily.book,

  color: inherited.color.colorMixInOklabForeground70Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
      },
    },
    '&:focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '4px',
    },
  },
  '@media (width >= 1080px)': {
    display: 'none',
  },
})
export const docsSidebarDrawerLayout = style({
  position: 'fixed',
  inset: '0',
  zIndex: tokens.zIndex.drawer,
  selectors: { '&[aria-hidden="true"]': { pointerEvents: 'none' } },
  '@media (width >= 1080px)': {
    display: 'none',
  },
})
export const docsSidebarDrawerLayout3 = style({
  opacity: 1,
  selectors: { '[aria-hidden="true"] > &': { opacity: 0 } },
  position: 'absolute',
  inset: '0',

  backgroundColor: inherited.color.colorMixInOklabColorBlack40Transparent,
  transitionProperty: 'opacity',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '200ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const docsSidebarDrawerLayout6 = style({
  translate: '0',
  selectors: { '[aria-hidden="true"] > &': { translate: '-100% 0' } },
  position: 'absolute',
  top: '0',
  insetInlineStart: '0',
  display: 'flex',
  height: '100%',
  width: '82%',
  maxWidth: '320px',
  flexDirection: 'column',
  borderInlineEndStyle: 'solid',
  borderInlineEndWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.background,
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const docsSidebarDrawerLayout9 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['4'],
})
export const docsSidebarDrawerText = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const docsSidebarDrawerButton2 = style({
  display: 'grid',
  width: tokens.spacing['10'],
  height: tokens.spacing['10'],
  placeItems: 'center',
  borderRadius: tokens.radius.lg,

  color: inherited.color.colorMixInOklabForeground70Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground5Transparent,
        color: tokens.color.foreground,
      },
    },
    '&:focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '2px',
    },
  },
})
export const docsSidebarDrawerLayout10 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  overflowY: 'auto',
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['3'],
})
