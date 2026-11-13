import { global } from 'zyzz/web'
import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// The top bar: one 56 row with a bottom hairline. The lockup, the products as plain links
// (from 1200px; below, they move into the menu drawer), search and Get API key.

export const docsSiteHeader = style({
  position: 'fixed',
  zIndex: tokens.zIndex.header,
  top: 0,
  insetInlineEnd: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) / 2))',
  insetInlineStart: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) / 2))',
  color: tokens.color.foreground,
  backgroundColor: inherited.color.colorSurfaceShell,
  fontFamily: tokens.fontFamily.ui,
  selectors: {
    '& :is(a, button, summary):focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.foreground,
      outlineOffset: '2px',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& *': {
        transition: 'none',
      },
    },
  },
})

/** The top bar: full width, no pill. Brand and tabs on the left, search and the one CTA on the right. */
export const docsHeaderNav = style({
  position: 'relative',
  zIndex: tokens.zIndex.header,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
  height: 'var(--tempo-docs-primary-nav-height)',
  paddingInline: tokens.spacing['4'],
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: tokens.color.line,
  '@media (width >= 768px)': {
    paddingInline: tokens.spacing['6'],
  },
})

export const docsHeaderLeft = style({
  display: 'flex',
  alignSelf: 'stretch',
  alignItems: 'center',
  gap: tokens.spacing['8'],
  minWidth: 0,
})

/** TEMPO DEVELOPERS: the wordmark in content/primary, DEVELOPERS in content/secondary. */
export const docsHeaderLogo = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  height: tokens.spacing['8'],
  color: tokens.color.foreground,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
})

// The outlined lockup at the Figma size (Tempo Alphabet 18).
export const docsHeaderWordmark = style({
  flexShrink: 0,
  height: '15px',
  width: '186px',
})

export const docsHeaderDevelopers = style({
  fill: tokens.color.muted,
})

/** The products, then Resources: plain links in one row from 1200px, where they fit beside search. */
export const docsProductNav = style({
  display: 'none',
  alignSelf: 'stretch',
  '@media (width >= 1200px)': {
    display: 'block',
  },
  selectors: {
    '& ul': {
      display: 'flex',
      height: '100%',
      alignItems: 'stretch',
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& li': {
      display: 'flex',
    },
  },
})

// Product links read like DS Tabs: secondary text, the current one primary and medium with a
// 2px indicator on the bar's bottom hairline. They stay links, since DS Tabs switch views.
export const docsProductLink = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1'],
  paddingInline: tokens.spacing['2_5'],
  border: 0,
  background: 'none',
  color: tokens.color.muted,
  fontFamily: tokens.fontFamily.ui,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  lineHeight: tokens.lineHeight.control,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      insetInline: tokens.spacing['2_5'],
      // design-exception: The indicator sits on the bar's 1px bottom hairline.
      bottom: '-1px !custom',
      height: '2px',
      backgroundColor: 'transparent !custom',
    },
    '&:hover': {
      color: tokens.color.foreground,
      transitionDuration: 'var(--tempo-enter)',
    },
    '&:is([aria-current="page"], [data-active])': {
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.medium,
    },
    '&:is([aria-current="page"], [data-active])::after': {
      backgroundColor: tokens.color.foreground,
    },
    '&[data-popup-open]': {
      color: tokens.color.foreground,
    },
  },
})

export const docsProductChevron = style({
  flexShrink: 0,
  color: tokens.color.tertiary,
})

export const docsHeaderActions = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: tokens.spacing['2'],
})

/** Search: a 32 icon button below Display widths, a 240 field with its shortcut from 1376px. */
export const docsHeaderSearchField = style({
  display: 'grid',
  width: tokens.spacing['8'],
  height: tokens.spacing['8'],
  placeItems: 'center',
  padding: tokens.spacing['0'],
  border: 0,
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  background: 'none',
  color: tokens.color.muted,
  fontFamily: tokens.fontFamily.ui,
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.containerSubtle,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
  '@media (width >= 1376px)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: tokens.spacing['2'],
    width: '240px',
    paddingInline: tokens.spacing['3'],
    backgroundColor: tokens.color.container,
    fontSize: tokens.fontSize.sm,
    lineHeight: tokens.lineHeight.control,
    selectors: {
      '&:hover': {
        backgroundColor: tokens.color.containerStrong,
      },
    },
  },
})

export const docsHeaderSearchLabel = style({
  display: 'none',
  '@media (width >= 1376px)': {
    display: 'inline',
    flex: 1,
    color: tokens.color.tertiary,
    textAlign: 'start',
  },
})

export const docsHeaderKbd = style({
  display: 'none',
  '@media (width >= 1376px)': {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: tokens.spacing['1'],
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.container,
    color: tokens.color.tertiary,
    fontFamily: tokens.fontFamily.ui,
    fontSize: tokens.fontSize.xs,
    lineHeight: tokens.lineHeight.caption,
  },
})

/** Get API key ("Console" when signed in), the one primary button: a DS Button from Tablet up. */
export const docsHeaderGetKey = style({
  display: 'none',
  '@media (width >= 768px)': {
    display: 'contents',
  },
})

/** The menu button opens the drawer below 1200px, where the products leave the bar. */
export const docsHeaderMenuButton = style({
  display: 'contents',
  '@media (width >= 1200px)': {
    display: 'none',
  },
})

// The DS drawer's layers have no z-index, so the fixed top bar would cover them; while the
// drawer is mounted the bar drops back into the page's stacking order.
global({
  'body:has(.docs-menu-drawer) .docs-site-header': {
    zIndex: 'auto',
  },
})

/** The menu drawer: products, Resources, then the current section's pages. */
export const docsMenuDrawerPopup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['4'],
  width: 'min(360px, 100vw)',
  // design-exception: The drawer's own 32px padding is tighter here, so labels sit on the 16px gutter.
  padding: '16px 12px 24px !custom',
  fontFamily: tokens.fontFamily.ui,
})

export const docsMenuDrawerTitle = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: tokens.spacing['8'],
  margin: 0,
  paddingInline: tokens.spacing['2'],
})

export const docsMenuDrawerSearch = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  width: '100%',
  height: tokens.spacing['8'],
  paddingInline: tokens.spacing['3'],
  border: 0,
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: tokens.color.container,
  color: tokens.color.tertiary,
  fontFamily: tokens.fontFamily.ui,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  cursor: 'pointer',
})

export const docsMenuDrawerDivider = style({
  margin: 0,
  border: 0,
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: tokens.color.line,
})

export const docsMenuDrawerFooter = style({
  display: 'grid',
  gap: tokens.spacing['3'],
  marginTop: 'auto !custom',
  paddingInline: tokens.spacing['1'],
})

export const docsMenuDrawerTheme = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingInlineStart: tokens.spacing['2'],
  color: tokens.color.muted,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  selectors: {
    '& select': {
      height: tokens.spacing['8'],
      paddingInline: tokens.spacing['2'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.md,
      backgroundColor: inherited.color.colorSurfaceShell,
      color: tokens.color.foreground,
      font: 'inherit',
    },
  },
})
