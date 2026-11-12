import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
/** "Section / Page" with a chevron: 14/20, the section secondary and the page primary medium. */
export const docsSidebarDrawerButton = style({
  display: 'flex',
  minWidth: 0,
  maxWidth: '100%',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  padding: tokens.spacing['0'],
  border: 0,
  borderRadius: tokens.radius.md,
  background: 'none',
  fontFamily: tokens.fontFamily.sansFallback,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  lineHeight: tokens.lineHeight.control,
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: tokens.borderWidth.emphasis,
      outlineOffset: '2px',
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

/** The page bar host inside Vocs' outline row: below Desktop the bar holds only "Section / Page". */
export const docsPageBarHost = style({
  minWidth: 0,
  maxWidth: '100%',
  '@media (width < 1080px)': {
    selectors: {
      // Vocs' "On this page" and "Return to top" buttons follow the prepended host.
      '& ~ *': {
        display: 'none',
      },
    },
  },
})
export const docsPageBarSection = style({
  flexShrink: 0,
  color: tokens.color.muted,
})
export const docsPageBarSeparator = style({
  flexShrink: 0,
  color: tokens.color.muted,
})
export const docsPageBarPage = style({
  minWidth: 0,
  overflow: 'hidden',
  color: tokens.color.foreground,
  fontWeight: tokens.fontWeight.medium,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
export const docsPageBarChevron = style({
  flexShrink: 0,
  color: tokens.color.muted,
})
/** The current tab's sections at the top of the drawer, above the section's sidebar. */
export const docsDrawerSections = style({
  display: 'grid',
  gap: tokens.spacing['0_5'],
  marginBottom: tokens.spacing['4'],
  paddingBottom: tokens.spacing['4'],
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: tokens.color.line,
})
export const docsDrawerSectionLink = style({
  display: 'flex',
  alignItems: 'center',
  height: tokens.spacing['8'],
  paddingInline: tokens.spacing['3'],
  borderRadius: tokens.radius.md,
  color: tokens.color.muted,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.containerSubtle,
    },
    '&[aria-current="page"]': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.container,
      fontWeight: tokens.fontWeight.medium,
    },
  },
})
