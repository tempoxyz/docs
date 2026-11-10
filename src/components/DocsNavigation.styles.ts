import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

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
      outlineOffset: '4px',
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

/**
 * The global nav row. From Desktop up it sits in a rounded pill, like the tempo.xyz nav:
 * brand and areas on the left, search and account actions on the right.
 */
export const docsHeaderNav = style({
  position: 'relative',
  zIndex: tokens.zIndex.header,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
  height: 'var(--tempo-docs-primary-nav-height)',
  paddingInline: tokens.spacing['5'],
  '@media (width < 380px)': {
    paddingInline: tokens.spacing['3_5'],
  },
  '@media (width >= 1080px)': {
    gap: tokens.spacing['4'],
    height: 'calc(var(--tempo-docs-primary-nav-height) - 16px)',
    marginBlock: tokens.spacing['2'],
    marginInline: tokens.spacing['4'],
    paddingInline: tokens.spacing['3'],
    borderRadius: tokens.radius.xl,
    '--corner-radius': tokens.radius.xl,
    backgroundColor: tokens.color.container,
  },
})

export const docsHeaderLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3'],
  minWidth: 0,
})

export const docsHeaderBrand = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: tokens.spacing['1'],
  minWidth: 0,
  whiteSpace: 'nowrap',
})

export const docsHeaderLogo = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
  height: '40px',
  paddingInlineStart: tokens.spacing['1'],
  color: 'inherit !custom',
  textDecoration: 'none',
})

export const docsHeaderDocsLabel = style({
  paddingInlineStart: tokens.spacing['2_5'],
  borderInlineStartWidth: tokens.borderWidth.hairline,
  borderInlineStartStyle: 'solid',
  borderInlineStartColor: inherited.color.colorMixInSrgbCurrentColor16Transparent,
  color: tokens.color.foreground,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.none,
  // Between 1080px and 1280px the six areas need the room; the logo still names the site.
  '@media (width >= 1080px) and (width < 1280px)': {
    display: 'none',
  },
})

/** The chevron beside the logo that opens the Tempo product switcher. */
export const docsHeaderSwitcher = style({
  display: 'none',
  flexShrink: 0,
  '@media (width >= 1080px)': {
    display: 'block',
  },
  selectors: {
    '& .docs-area-link': {
      paddingInline: tokens.spacing['1_5'],
    },
  },
})

export const docsAreaNav = style({
  display: 'none',
  '@media (width >= 1080px)': {
    display: 'block',
  },
  selectors: {
    '& ul': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['0_5'],
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
})

export const docsAreaLink = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1'],
  height: '34px',
  paddingBlock: tokens.spacing['0'],
  paddingInline: tokens.spacing['2_5'],
  border: 0,
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  background: 'none',
  color: inherited.color.colorMixInSrgbColorForeground65Transparent,
  fontFamily: tokens.fontFamily.sansFallback,
  fontSize: tokens.fontSize.sm,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  '@media (width >= 1080px) and (width < 1280px)': {
    paddingInline: tokens.spacing['1_5'],
  },
  selectors: {
    '&:is(:hover, [aria-expanded="true"])': {
      color: tokens.color.foreground,
      transitionDuration: 'var(--tempo-enter)',
    },
    '&:is([aria-current="page"], [aria-current="true"])': {
      color: tokens.color.foreground,
      backgroundColor: tokens.color.containerStrong,
    },
    '& svg': {
      opacity: 0.5,
      transitionProperty: 'transform, translate, scale, rotate',
      transitionDuration: 'var(--tempo-exit)',
    },
    '&[aria-expanded="true"] svg': {
      rotate: '180deg',
    },
  },
})

export const docsAreaMenuPanel = style({
  position: 'absolute',
  top: 'calc(100% + 12px)',
  insetInlineStart: 0,
  display: 'grid',
  gap: tokens.spacing['0_5'],
  width: '340px',
  padding: tokens.spacing['2'],
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: inherited.color.colorMixInSrgbColorForeground12Transparent,
  borderRadius: tokens.radius.xl,
  '--corner-radius': tokens.radius.xl,
  backgroundColor: inherited.color.colorSurfaceShell,
  // design-exception: Matches the shadow of the other header panels.
  boxShadow: '0 8px 24px #0000000d !custom',
  zIndex: tokens.zIndex.sectionNav,
  selectors: {
    '&[hidden]': {
      display: 'none',
    },
    '&[data-align="end"]': {
      insetInlineStart: 'auto',
      insetInlineEnd: 0,
    },
  },
})

export const docsAreaMenuItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2_5'],
  paddingInline: tokens.spacing['3'],
  borderRadius: tokens.radius.lg,
  color: tokens.color.foreground,
  textDecoration: 'none',
  selectors: {
    '&:is(:hover, [aria-current="page"])': {
      backgroundColor: inherited.color.colorSurfaceBlock,
    },
    '&:focus-visible': {
      // design-exception: Inset ring so the focus outline isn't clipped by the panel edge.
      outline: '2px solid currentColor !custom',
      outlineOffset: '-2px',
    },
    '& svg': {
      flexShrink: 0,
      marginTop: tokens.spacing['0_5'],
    },
  },
})

export const docsAreaMenuItemLabel = style({
  display: 'grid',
  flex: 1,
  gap: tokens.spacing['0_5'],
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.snug,
})

export const docsAreaMenuItemDescription = style({
  color: inherited.color.colorMixInSrgbColorForeground60Transparent,
  fontSize: tokens.fontSize.compact,
})

/** Search: an icon below Display widths, a field with its shortcut from 1376px. */
export const docsHeaderSearchField = style({
  display: 'grid',
  width: '36px',
  height: '36px',
  placeItems: 'center',
  border: 0,
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  background: 'none',
  color: 'inherit !custom',
  fontFamily: tokens.fontFamily.sansFallback,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: inherited.color.colorMixInSrgbCurrentColor5Transparent,
    },
  },
  '@media (width >= 1376px)': {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: tokens.spacing['2'],
    width: '208px',
    height: '34px',
    paddingInline: tokens.spacing['3'],
    backgroundColor: inherited.color.colorSurfaceShell,
    color: inherited.color.colorMixInSrgbColorForeground65Transparent,
    fontSize: tokens.fontSize.sm,
    selectors: {
      '&:hover': {
        backgroundColor: inherited.color.colorSurfaceShell,
        color: tokens.color.foreground,
      },
    },
  },
})

export const docsHeaderSearchLabel = style({
  display: 'none',
  '@media (width >= 1376px)': {
    display: 'inline',
    flex: 1,
    textAlign: 'start',
  },
})

export const docsHeaderKbd = style({
  display: 'none',
  '@media (width >= 1376px)': {
    display: 'inline-flex',
    paddingInline: tokens.spacing['1_5'],
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.container,
    color: inherited.color.colorMixInSrgbColorForeground65Transparent,
    fontFamily: tokens.fontFamily.code,
    fontSize: tokens.fontSize.caption,
    lineHeight: tokens.lineHeight.caption,
  },
})

export const docsHeaderLoginText = style({
  display: 'none',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  height: '34px',
  paddingInline: tokens.spacing['2_5'],
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  color: tokens.color.foreground,
  fontSize: tokens.fontSize.sm,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      backgroundColor: tokens.color.containerStrong,
    },
  },
  '@media (width >= 1080px)': {
    display: 'flex',
  },
})

/** Get API key: the one filled button in the global nav. */
export const docsHeaderGetKey = style({
  display: 'none',
  alignItems: 'center',
  height: '34px',
  paddingInline: tokens.spacing['3_5'],
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  backgroundColor: inherited.color.backgroundColorInvert,
  color: inherited.color.textColorInvert,
  fontSize: tokens.fontSize.sm,
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

export const docsHeaderMobileSearch = style({
  display: 'flex',
  minWidth: 0,
  height: '39px',
  alignItems: 'center',
  gap: tokens.spacing['2_5'],
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: 'transparent !custom',
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: inherited.color.surfaceInput,

  color: inherited.color.colorMixInSrgbColorForeground65Transparent,
  paddingInline: tokens.spacing['3_5'],
  fontSize: tokens.fontSize.sm,
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      // design-exception: Component artwork uses this optical mix; keep its existing contrast.
      borderColor: 'color-mix(in srgb, currentColor 25%, transparent) !custom',
      color: tokens.color.foreground,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
  width: '100%',
  marginBottom: tokens.spacing['7'],
})

export const docsHeaderActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: tokens.spacing['1'],
  '@media (width >= 1080px)': {
    gap: tokens.spacing['2'],
  },
})

export const docsHeaderWebsite = style({
  display: 'none',
  alignItems: 'center',
  gap: tokens.spacing['1'],
  fontSize: tokens.fontSize.xs,

  color: inherited.color.colorMixInSrgbColorForeground60Transparent,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: tokens.color.foreground,
    },
  },
  '@media (width >= 1280px)': {
    display: 'flex',
  },
})

export const docsHeaderAgentMenu = style({
  position: 'relative',
  display: 'none',
  '@media (width >= 1080px)': {
    display: 'block',
  },
})

// TDS Platform Button, secondary, small scale, with the G8 radius.
export const docsHeaderAgentTrigger = style({
  display: 'flex',
  height: '32px',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  border: 0,
  // G8: header controls were 12px; smoothed lg reads a little rounder.
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  paddingInlineStart: tokens.spacing['4'],
  paddingInlineEnd: tokens.spacing['3'],
  color: inherited.color.vocsTextColorPrimary,
  background: 'none',
  fontSize: tokens.fontSize.sm,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&[aria-expanded="true"]': {
      backgroundColor: tokens.color.containerStrong,
      transitionDuration: 'var(--tempo-enter)',
    },
    '&:disabled': {
      cursor: 'default',
    },
  },
  '@media (hover: hover)': {
    selectors: {
      '&:hover': {
        backgroundColor: tokens.color.containerStrong,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
})

export const docsHeaderAgentPanel = style({
  position: 'absolute',
  insetInlineEnd: 0,
  top: 'calc(100% + 16px)',
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: inherited.color.colorMixInSrgbCurrentColor12Transparent,
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  backgroundColor: inherited.color.colorSurfacePage,
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow: '0 8px 24px #0000000d !custom',
  overflow: 'hidden',
  // G5: the panel fades and settles in, and fades out before it unmounts.
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-enter)',
  transitionTimingFunction: 'var(--tempo-ease)',
  '@starting-style': {
    opacity: 0,
    transform: 'translateY(-4px)',
  },
  selectors: {
    '&[data-state="closed"]': {
      opacity: 0,
      transform: 'translateY(-4px)',
      transitionDuration: 'var(--tempo-exit)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'opacity',
    transform: 'none',
  },
})

export const docsHeaderMobileActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['0_5'],
  selectors: {
    '& .docs-header-destinations': {
      marginInlineEnd: tokens.spacing['2'],
    },
  },
  '@media (width >= 1080px)': {
    display: 'none',
  },
})

export const docsHeaderIconButton = style({
  display: 'grid',
  width: '36px',
  height: '36px',
  placeItems: 'center',
  // G8: header controls were 12px; smoothed lg reads a little rounder.
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  color: 'inherit !custom',
  cursor: 'pointer',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      backgroundColor: inherited.color.colorMixInSrgbCurrentColor5Transparent,
      transitionDuration: 'var(--tempo-enter)',
    },
  },
})

export const docsHeaderMenuButton = style({
  '@media (width >= 1080px)': {
    display: 'none',
  },
})

export const docsSectionNav = style({
  selectors: {
    '& :is(a, button):focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.foreground,
      outlineOffset: '4px',
    },
  },
  display: 'flex',
  alignItems: 'center',
  color: tokens.color.foreground,
  backgroundColor: inherited.color.colorSurfaceShell,
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: inherited.color.colorMixInSrgbCurrentColor10Transparent,
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& *': {
        transition: 'none',
      },
    },
  },
})

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
  // G5: the menu fades in on open and out on close; display and overlay switch
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
      // design-exception: Preserve this surface's layered artwork or focus treatment.
      background: '#0006 !custom',
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
  paddingInline: tokens.spacing['5'],
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: inherited.color.colorMixInSrgbCurrentColor10Transparent,
  '@media (width < 380px)': {
    paddingInline: tokens.spacing['3_5'],
  },
})

export const docsHeaderMobileBody = style({
  overflow: 'auto',
  overscrollBehavior: 'contain',

  paddingTop: tokens.spacing['5'],
  paddingInlineEnd: tokens.spacing['6'],
  paddingBottom: tokens.spacing['8'],
  paddingInlineStart: tokens.spacing['6'],
})

export const docsHeaderMobileLabel = style({
  marginBottom: tokens.spacing['4'],

  color: inherited.color.colorMixInSrgbColorForeground55Transparent,
  fontSize: tokens.fontSize.xs,
})

export const docsHeaderMobileSidebar = style({
  display: 'flex',
  flexDirection: 'column',
})

export const docsHeaderMobileSections = style({
  marginTop: tokens.spacing['6'],
  paddingTop: tokens.spacing['6'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.colorMixInSrgbCurrentColor10Transparent,
  selectors: {
    '& a': {
      display: 'flex',
      justifyContent: 'space-between',

      paddingBlock: tokens.spacing['2'],
      fontSize: tokens.fontSize.sm,
      color: 'inherit !custom',
      textDecoration: 'none',
    },
    '& a span': {
      opacity: 0.4,
    },
  },
})

export const docsHeaderMobileResources = style({
  marginTop: tokens.spacing['6'],
  paddingTop: tokens.spacing['6'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.colorMixInSrgbCurrentColor10Transparent,
  selectors: {
    '& > .docs-resource-links': {
      gap: tokens.spacing['0'],
    },
    '& > .docs-resource-links a': {
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['0'],
    },
    '& > .docs-resource-links a:hover': {
      backgroundColor: 'transparent !custom',
    },
    '& > .docs-resource-links svg:last-child': {
      opacity: 0.4,
    },
  },
})

export const docsHeaderMobileAgents = style({
  marginTop: tokens.spacing['6'],
  paddingTop: tokens.spacing['6'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.colorMixInSrgbCurrentColor10Transparent,
  selectors: {
    '& summary': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBlock: tokens.spacing['2'],
      color: tokens.color.foreground,
      fontSize: tokens.fontSize.sm,
      listStyle: 'none',
      cursor: 'pointer',
    },
    '& summary::-webkit-details-marker': {
      display: 'none',
    },
    '& summary svg': {
      opacity: 0.4,
      transition: 'rotate 150ms',
    },
    '&[open] summary': {
      marginBottom: tokens.spacing['4'],
    },
    '&[open] summary svg': {
      rotate: '180deg',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& summary svg': {
        transition: 'none',
      },
    },
  },
})

export const docsHeaderMobileWebsite = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  marginTop: tokens.spacing['6'],

  color: inherited.color.colorMixInSrgbColorForeground55Transparent,
  fontSize: tokens.fontSize.xs,
  textDecoration: 'none',
})

export const docsSectionNavScroll = style({
  flex: 1,
  minWidth: 0,
  height: 'var(--tempo-docs-section-nav-height)',
  overflowX: 'auto',
  paddingInline: tokens.spacing['5'],
  scrollbarWidth: 'none',
  // design-exception: Fade the scroll edges so clipped section tabs read as scrollable instead of cut off.
  maskImage:
    'linear-gradient(to right, transparent, black 16px, black calc(100% - 24px), transparent) !custom',
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
      gap: tokens.spacing['1_5'],
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& a': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',

      gap: tokens.spacing['2'],
      height: '34px',

      paddingBlock: tokens.spacing['0'],
      paddingInline: tokens.spacing['2_5'],
      border: 0,
      borderRadius: tokens.radius.lg,

      color: inherited.color.colorMixInSrgbColorForeground65Transparent,
      fontSize: tokens.fontSize.compact,
      fontWeight: tokens.fontWeight.medium,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'color 150ms, background-color 150ms',
    },
    '& a:hover': {
      color: tokens.color.foreground,
      backgroundColor: inherited.color.colorMixInSrgbColorForeground3Transparent,
    },
    '& a[aria-current="page"]': {
      color: tokens.color.foreground,
      backgroundColor: inherited.color.colorMixInSrgbColorForeground8ColorSurfaceShell,
    },
  },
  '@media (width >= 1080px)': {
    paddingInline: tokens.spacing['7'],
  },
})

export const docsSectionIcon = style({
  flexShrink: 0,
})

export const docsReferenceMenu = style({
  position: 'relative',
})

export const docsResourceLinks = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.sansFallback,
  selectors: {
    '& a': {
      display: 'block',

      paddingBlock: tokens.spacing['2_5'],
      paddingInline: tokens.spacing['3'],
      borderRadius: tokens.radius.md,
      color: tokens.color.foreground,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.snug,
      textDecoration: 'none',
    },
    '& a:hover': {
      backgroundColor: inherited.color.colorSurfaceBlock,
    },
  },
})

export const docsResourceLinkLabel = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
})

export const docsResourceLogo = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
})

export const docsResourceLinkText = style({
  flex: 1,
})

export const docsHeaderMobileTheme = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.colorMixInSrgbCurrentColor10Transparent,
  marginTop: tokens.spacing['6'],
  paddingTop: tokens.spacing['6'],
  fontSize: tokens.fontSize.compact,
  selectors: {
    '& select': {
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: inherited.color.colorMixInSrgbCurrentColor16Transparent,
      borderRadius: tokens.radius.lg,
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      padding: '7px 10px !custom',
      backgroundColor: inherited.color.colorSurfaceShell,
      color: 'inherit !custom',
      font: 'inherit',
    },
  },
})

/** Signed-in email in the header's account link, cut short (and hidden on narrow screens) so the logo keeps its width. */
export const docsHeaderAccountEmail = style({
  maxWidth: '24ch',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  // Below the full header the link shows only its icon; its aria-label and title carry the email.
  '@media (width < 1080px)': {
    display: 'none',
  },
})

/** The current area's one-line description at the end of the section row. */
export const docsSectionNavDescription = style({
  display: 'none',
  flexShrink: 0,
  marginBlock: tokens.spacing['0'],
  marginInlineEnd: tokens.spacing['7'],
  color: inherited.color.colorMixInSrgbColorForeground60Transparent,
  fontSize: tokens.fontSize.compact,
  whiteSpace: 'nowrap',
  '@media (width >= 1080px)': {
    display: 'block',
  },
})

export const docsHeaderMobileAreaLabel = style({
  marginBlock: tokens.spacing['0'],
  paddingTop: tokens.spacing['3'],
  paddingBottom: tokens.spacing['1'],
  color: inherited.color.colorMixInSrgbColorForeground55Transparent,
  fontSize: tokens.fontSize.xs,
})

export const docsHeaderMobileAreaGroup = style({
  display: 'grid',
  selectors: {
    '& a': {
      paddingInlineStart: tokens.spacing['3'],
    },
  },
})

/** Log in and Get API key at the foot of the mobile menu. */
export const docsHeaderMobileAccount = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: tokens.spacing['2'],
  marginTop: tokens.spacing['6'],
  selectors: {
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '44px',
      borderRadius: tokens.radius.lg,
      fontSize: tokens.fontSize.sm,
      textDecoration: 'none',
    },
    '& a:first-child': {
      backgroundColor: tokens.color.container,
      color: tokens.color.foreground,
    },
    '& a:last-child': {
      backgroundColor: inherited.color.backgroundColorInvert,
      color: inherited.color.textColorInvert,
    },
  },
})
