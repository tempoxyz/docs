import { style } from 'zyzz'

export const docsSiteHeader = style({
  position: 'fixed',
  zIndex: 60,
  top: 0,
  right: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) / 2))',
  left: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) / 2))',
  color: 'var(--color-foreground)',
  background: 'var(--color-surface-shell)',
  fontFamily: 'var(--font-pilat-book), sans-serif',
  selectors: {
    '& :is(a, button, summary):focus-visible': {
      outline: '2px solid var(--color-foreground)',
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

export const docsHeaderNav = style({
  position: 'relative',
  zIndex: 60,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '20px',
  height: 'var(--tempo-docs-primary-nav-height)',
  paddingInline: '20px',
  '@media (width < 380px)': {
    paddingInline: '14px',
  },
  '@media (width >= 1080px)': {
    gridTemplateColumns: 'minmax(80px, 1fr) minmax(240px, 420px) minmax(max-content, 1fr)',
    paddingInline: '28px',
  },
})

export const docsHeaderBrand = style({
  display: 'flex',
  alignItems: 'center',
  gap: '28px',
  minWidth: 0,
  whiteSpace: 'nowrap',
  '@media (width < 380px)': {
    gap: '20px',
  },
})

export const docsHeaderLogo = style({
  display: 'flex',
  alignItems: 'center',
  height: '40px',
  color: 'inherit',
})

export const docsHeaderWordmark = style({
  color: 'color-mix(in srgb, var(--color-foreground) 60%, transparent)',
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
  selectors: {
    '&[aria-current="page"]': {
      color: 'var(--color-foreground)',
      textDecoration: 'underline',
      textDecorationThickness: '1px',
      textUnderlineOffset: '7px',
    },
    '&:hover': {
      color: 'var(--color-foreground)',
    },
  },
  '@media (width < 380px)': {
    fontSize: '13px',
  },
})

export const docsHeaderDestinations = style({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  whiteSpace: 'nowrap',
})

export const docsHeaderSearch = style({
  display: 'none',
  minWidth: 0,
  height: '39px',
  alignItems: 'center',
  gap: '10px',
  border: '1px solid transparent',
  borderRadius: '6px',
  background: 'var(--color-surface-block)',
  color: 'color-mix(in srgb, var(--color-foreground) 65%, transparent)',
  paddingInline: '14px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'border-color 150ms, color 150ms',
  justifyContent: 'space-between',
  selectors: {
    '&:hover': {
      borderColor: 'color-mix(in srgb, currentColor 25%, transparent)',
      color: 'var(--color-foreground)',
    },
    '& kbd': {
      fontSize: '12px',
      fontFamily: 'inherit',
    },
  },
  '@media (width >= 1080px)': {
    display: 'flex',
  },
})

export const docsHeaderMobileSearch = style({
  display: 'flex',
  minWidth: 0,
  height: '39px',
  alignItems: 'center',
  gap: '10px',
  border: '1px solid transparent',
  borderRadius: '6px',
  background: 'var(--color-surface-block)',
  color: 'color-mix(in srgb, var(--color-foreground) 65%, transparent)',
  paddingInline: '14px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'border-color 150ms, color 150ms',
  selectors: {
    '&:hover': {
      borderColor: 'color-mix(in srgb, currentColor 25%, transparent)',
      color: 'var(--color-foreground)',
    },
  },
  width: '100%',
  marginBottom: '28px',
})

export const docsHeaderActions = style({
  display: 'none',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '16px',
  '@media (width >= 1080px)': {
    display: 'flex',
  },
})

export const docsHeaderWebsite = style({
  display: 'none',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  color: 'color-mix(in srgb, var(--color-foreground) 60%, transparent)',
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: 'var(--color-foreground)',
    },
  },
  '@media (width >= 1280px)': {
    display: 'flex',
  },
})

export const docsHeaderAgentMenu = style({
  position: 'relative',
})

export const docsHeaderAgentTrigger = style({
  display: 'flex',
  height: '36px',
  alignItems: 'center',
  gap: '8px',
  border: 0,
  borderRadius: '20px',
  paddingInline: '16px',
  color: 'var(--color-surface-shell)',
  background: 'var(--color-foreground)',
  fontSize: '14px',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      background: 'color-mix(in srgb, var(--color-foreground) 85%, var(--color-surface-shell))',
    },
    '&[aria-expanded="true"]': {
      background: 'color-mix(in srgb, var(--color-foreground) 85%, var(--color-surface-shell))',
    },
  },
})

export const docsHeaderAgentPanel = style({
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 12px)',
  border: '1px solid color-mix(in srgb, currentColor 12%, transparent)',
  borderRadius: '8px',
  background: 'var(--color-surface-page)',
  boxShadow: '0 8px 24px #0000000d',
  overflow: 'hidden',
})

export const docsHeaderMobileActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  selectors: {
    '& .docs-header-destinations': {
      marginRight: '16px',
    },
  },
  '@media (width >= 1080px)': {
    display: 'none',
  },
})

export const docsHeaderIconButton = style({
  display: 'grid',
  width: '36px',
  height: '40px',
  placeItems: 'center',
  borderRadius: '8px',
  color: 'inherit',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      background: 'color-mix(in srgb, currentColor 5%, transparent)',
    },
  },
})

export const docsSectionNav = style({
  selectors: {
    '& :is(a, button):focus-visible': {
      outline: '2px solid var(--color-foreground)',
      outlineOffset: '4px',
    },
  },
  display: 'flex',
  alignItems: 'center',
  color: 'var(--color-foreground)',
  background: 'var(--color-surface-shell)',
  borderBottom: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
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
  color: 'var(--color-foreground)',
  background: 'var(--color-surface-page)',
  selectors: {
    '&:not([open])': {
      display: 'none',
    },
    '&[open]': {
      display: 'flex',
      flexDirection: 'column',
    },
    '&::backdrop': {
      background: '#0006',
    },
  },
})

export const docsHeaderMobileTop = style({
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 'var(--tempo-docs-primary-nav-height)',
  paddingInline: '20px',
  borderBottom: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
  '@media (width < 380px)': {
    paddingInline: '14px',
  },
})

export const docsHeaderMobileBody = style({
  overflow: 'auto',
  overscrollBehavior: 'contain',
  padding: '20px 24px 32px',
})

export const docsHeaderMobileLabel = style({
  marginBottom: '16px',
  color: 'color-mix(in srgb, var(--color-foreground) 55%, transparent)',
  fontSize: '12px',
})

export const docsHeaderMobileSidebar = style({
  display: 'flex',
  flexDirection: 'column',
})

export const docsHeaderMobileSections = style({
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
  selectors: {
    '& a': {
      display: 'flex',
      justifyContent: 'space-between',
      paddingBlock: '9px',
      fontSize: '14px',
      color: 'inherit',
      textDecoration: 'none',
    },
    '& a span': {
      opacity: 0.4,
    },
  },
})

export const docsHeaderMobileResources = style({
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
})

export const docsHeaderMobileAgents = style({
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
  selectors: {
    '& summary': {
      cursor: 'pointer',
      marginBottom: '16px',
      fontSize: '14px',
    },
  },
})

export const docsHeaderMobileUtilityLink = style({
  display: 'block',
  width: 'fit-content',
  marginTop: '16px',
  paddingBlock: '8px',
  color: 'var(--color-foreground)',
  fontSize: '14px',
  textDecoration: 'none',
  selectors: {
    '&:first-child': {
      marginTop: 0,
      marginBottom: '20px',
    },
    '&:is(:hover, [aria-current="page"])': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
})

export const docsHeaderMobileWebsite = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '24px',
  color: 'color-mix(in srgb, var(--color-foreground) 55%, transparent)',
  fontSize: '12px',
  textDecoration: 'none',
})

export const docsSectionNavScroll = style({
  flex: 1,
  minWidth: 0,
  height: 'var(--tempo-docs-section-nav-height)',
  overflowX: 'auto',
  paddingInline: '20px',
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
      gap: '6px',
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& a': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      height: '34px',
      padding: '0 10px',
      border: 0,
      borderRadius: '8px',
      color: 'color-mix(in srgb, var(--color-foreground) 65%, transparent)',
      fontSize: '13px',
      fontWeight: 500,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'color 150ms, background-color 150ms',
    },
    '& a:hover': {
      color: 'var(--color-foreground)',
      background: 'color-mix(in srgb, var(--color-foreground) 3%, transparent)',
    },
    '& a[aria-current="page"]': {
      color: 'var(--color-foreground)',
      background: 'color-mix(in srgb, var(--color-foreground) 8%, var(--color-surface-shell))',
    },
  },
  '@media (width >= 1080px)': {
    paddingInline: '28px',
  },
})

export const docsSectionIcon = style({
  flexShrink: 0,
})

export const docsSectionUtilities = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: '24px',
  marginRight: '20px',
  '@media (width < 800px)': {
    display: 'none',
  },
  '@media (width >= 1080px)': {
    marginRight: '28px',
  },
})

export const docsReferenceMenu = style({
  position: 'relative',
})

export const docsReferenceTrigger = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  height: 'var(--tempo-docs-section-nav-height)',
  padding: '0 2px',
  color: 'color-mix(in srgb, var(--color-foreground) 65%, transparent)',
  fontFamily: 'var(--font-pilat-book), sans-serif',
  fontSize: '13px',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  selectors: {
    '&:is(:hover, [aria-expanded="true"], [aria-current="page"])': {
      color: 'var(--color-foreground)',
    },
    '&[aria-current="page"]::after': {
      content: '""',
      position: 'absolute',
      inset: 'auto 0 0',
      height: '2px',
      background: 'currentColor',
    },
  },
  background: 'none',
  border: 0,
})

export const docsSectionUtilityLink = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  height: 'var(--tempo-docs-section-nav-height)',
  padding: '0 2px',
  color: 'color-mix(in srgb, var(--color-foreground) 65%, transparent)',
  fontFamily: 'var(--font-pilat-book), sans-serif',
  fontSize: '13px',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  selectors: {
    '&:is(:hover, [aria-current="page"])': {
      color: 'var(--color-foreground)',
    },
    '&[aria-current="page"]::after': {
      content: '""',
      position: 'absolute',
      inset: 'auto 0 0',
      height: '2px',
      background: 'currentColor',
    },
  },
})

export const docsReferencePanel = style({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: '280px',
  padding: '12px',
  border: '1px solid color-mix(in srgb, var(--color-foreground) 12%, transparent)',
  borderRadius: '8px',
  background: 'var(--color-surface-shell)',
  boxShadow: '0 8px 24px #0000000d',
  selectors: {
    '&[hidden]': {
      display: 'none',
    },
    '& a:focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: '-2px',
    },
  },
  zIndex: 50,
})

export const docsResourceLinks = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '4px',
  fontFamily: 'var(--font-pilat-book), sans-serif',
  selectors: {
    '& a': {
      display: 'block',
      padding: '10px 12px',
      borderRadius: '6px',
      color: 'var(--color-foreground)',
      fontSize: '14px',
      lineHeight: 1.4,
      textDecoration: 'none',
    },
    '& a:hover': {
      background: 'var(--color-surface-block)',
    },
  },
})

export const docsResourceLinkLabel = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
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
  borderTop: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
  marginTop: '24px',
  paddingTop: '24px',
  fontSize: '13px',
  selectors: {
    '& select': {
      border: '1px solid color-mix(in srgb, currentColor 16%, transparent)',
      borderRadius: '8px',
      padding: '7px 10px',
      background: 'var(--color-surface-shell)',
      color: 'inherit',
      font: 'inherit',
    },
  },
})

export const docsApiMenuMobile = style({
  selectors: {
    '& .docs-reference-trigger': {
      height: 'auto',
      padding: '12px 0',
      fontSize: '16px',
    },
    '& .docs-reference-panel': {
      position: 'static',
      width: '100%',
      boxShadow: 'none',
      marginBottom: '8px',
    },
  },
})

export const docsApiMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  selectors: {
    '& svg': {
      flexShrink: 0,
    },
  },
})
