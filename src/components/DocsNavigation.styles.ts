import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// Nav v2 (system-v2): a 56 top bar with a bottom hairline, a 48 section row from Desktop up,
// 32-high controls with radius 8, 14/20 UI text, and one current state: the container chip.

export const docsSiteHeader = style({
  position: 'fixed',
  zIndex: tokens.zIndex.header,
  top: 0,
  insetInlineEnd: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) / 2))',
  insetInlineStart: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) / 2))',
  color: tokens.color.foreground,
  backgroundColor: inherited.color.colorSurfaceShell,
  fontFamily: tokens.fontFamily.sansFallback,
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

/** Home · Docs · Reference · Resources: plain links from Desktop up. */
export const docsAreaNav = style({
  display: 'none',
  '@media (width >= 1080px)': {
    display: 'block',
  },
  selectors: {
    '& ul': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
})

export const docsAreaLink = style({
  display: 'flex',
  alignItems: 'center',
  height: tokens.spacing['8'],
  paddingInline: tokens.spacing['3'],
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  color: tokens.color.muted,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  lineHeight: tokens.lineHeight.control,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.containerSubtle,
      transitionDuration: 'var(--tempo-enter)',
    },
    '&[aria-current="page"]': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.container,
      fontWeight: tokens.fontWeight.medium,
    },
  },
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
  fontFamily: tokens.fontFamily.sansFallback,
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
    fontFamily: tokens.fontFamily.sansFallback,
    fontSize: tokens.fontSize.xs,
    lineHeight: tokens.lineHeight.caption,
  },
})

/** Get API key ("Console" when signed in): the one primary button, inverse fill. Tablet and up. */
export const docsHeaderGetKey = style({
  display: 'none',
  alignItems: 'center',
  height: tokens.spacing['8'],
  paddingInline: tokens.spacing['3'],
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: inherited.color.backgroundColorInvert,
  color: inherited.color.textColorInvert,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  lineHeight: tokens.lineHeight.control,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transitionProperty: 'opacity',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  '@media (width >= 768px)': {
    display: 'flex',
  },
  '@media (hover: hover)': {
    selectors: {
      '&:hover': {
        opacity: 0.9,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
})

export const docsHeaderIconButton = style({
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
})

export const docsHeaderMenuButton = style({
  '@media (width >= 1080px)': {
    display: 'none',
  },
})

/** The section tabs: a 48 row under the top bar from Desktop up, with a bottom hairline. */
export const docsSectionNav = style({
  display: 'none',
  alignItems: 'center',
  color: tokens.color.foreground,
  backgroundColor: inherited.color.colorSurfaceShell,
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: tokens.color.line,
  selectors: {
    '& :is(a, button):focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.foreground,
      outlineOffset: '-2px',
    },
  },
  '@media (width >= 1080px)': {
    display: 'flex',
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& *': {
        transition: 'none',
      },
    },
  },
})

export const docsSectionNavScroll = style({
  flex: 1,
  minWidth: 0,
  height: 'var(--tempo-docs-section-nav-height)',
  overflowX: 'auto',
  // The first tab's label starts on the 24 gutter: 12 row inset + 12 tab padding.
  paddingInline: tokens.spacing['3'],
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '& ul': {
      display: 'flex',
      width: 'max-content',
      minWidth: '100%',
      height: '100%',
      alignItems: 'center',
      gap: tokens.spacing['1'],
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& a': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      height: tokens.spacing['8'],
      paddingInline: tokens.spacing['3'],
      borderRadius: tokens.radius.md,
      '--corner-radius': tokens.radius.md,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      lineHeight: tokens.lineHeight.control,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& a:hover': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.containerSubtle,
      transitionDuration: 'var(--tempo-enter)',
    },
    '& a[aria-current="page"]': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.container,
      fontWeight: tokens.fontWeight.medium,
    },
  },
})

export const docsSectionIcon = style({
  flexShrink: 0,
})

/** The menu below Desktop: a full-screen sheet with the same tabs and sections as the top bar. */
export const docsHeaderMobileDialog = style({
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100dvh',
  maxWidth: 'none',
  maxHeight: 'none',
  margin: 0,
  padding: 0,
  border: 0,
  color: tokens.color.foreground,
  backgroundColor: inherited.color.colorSurfacePage,
  fontFamily: tokens.fontFamily.sansFallback,
  // The menu fades in on open and out on close; display and overlay switch
  // discretely at the end so the exit is visible.
  opacity: 0,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  transitionBehavior: 'allow-discrete',
  selectors: {
    '&:not([open])': {
      display: 'none',
    },
    '&[open]': {
      display: 'flex',
      flexDirection: 'column',
      opacity: 1,
      transitionDuration: 'var(--tempo-enter)',
    },
    '&::backdrop': {
      backgroundColor: tokens.color.scrim,
    },
  },
  '@starting-style': {
    selectors: {
      '&[open]': {
        opacity: 0,
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})

export const docsHeaderMobileTop = style({
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 'var(--tempo-docs-primary-nav-height)',
  paddingInline: tokens.spacing['4'],
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: tokens.color.line,
  '@media (width >= 768px)': {
    paddingInline: tokens.spacing['6'],
  },
})

// Item labels sit on the gutter: 4 body inset + 12 item padding (16), or 12 + 12 (24) from Tablet.
export const docsHeaderMobileBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['6'],
  overflow: 'auto',
  overscrollBehavior: 'contain',
  paddingTop: tokens.spacing['4'],
  paddingBottom: tokens.spacing['8'],
  paddingInline: tokens.spacing['1'],
  '@media (width >= 768px)': {
    paddingInline: tokens.spacing['3'],
  },
})

export const docsHeaderMobileSearch = style({
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
  fontFamily: tokens.fontFamily.sansFallback,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.control,
  cursor: 'pointer',
  selectors: {
    '& svg': {
      color: tokens.color.muted,
    },
  },
})

export const docsHeaderMobileSections = style({
  display: 'grid',
  gap: tokens.spacing['6'],
})

export const docsHeaderMobileAreaGroup = style({
  display: 'grid',
  gap: tokens.spacing['0_5'],
})

export const docsHeaderMobileAreaLabel = style({
  marginBlock: tokens.spacing['0'],
  marginBottom: tokens.spacing['1'],
  paddingInline: tokens.spacing['3'],
  color: tokens.color.foreground,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  lineHeight: tokens.lineHeight.control,
})

export const docsHeaderMobileLink = style({
  display: 'flex',
  alignItems: 'center',
  height: tokens.spacing['8'],
  paddingInline: tokens.spacing['3'],
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
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

/** The full-width Get API key at the foot of the menu. */
export const docsHeaderMobileGetKey = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: tokens.spacing['8'],
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: inherited.color.backgroundColorInvert,
  color: inherited.color.textColorInvert,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  lineHeight: tokens.lineHeight.control,
  textDecoration: 'none',
})

export const docsHeaderMobileTheme = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingInlineStart: tokens.spacing['3'],
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
