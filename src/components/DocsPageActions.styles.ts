import { global } from 'zyzz/web'
import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  '[data-layout]:has(.docs-page-actions) [data-v-copy-for-ai]': {
    display: 'none',
  },
  // The host floats at the end of the H1's first line, so a long title wraps under it.
  // It takes the H1's type so 1lh is that first line, and centres the 32px control on it.
  'article[data-v-content] .docs-page-actions-host': {
    float: 'inline-end',
    position: 'relative',
    zIndex: tokens.zIndex.raised,
    display: 'flex',
    alignItems: 'center',
    height: '1lh',
    marginBlock: tokens.spacing['0'],
    marginInlineStart: tokens.spacing['4'],
    fontSize: tokens.fontSize.displaySmall,
    lineHeight: tokens.lineHeight.heading,
  },
  '@media (width < 768px)': {
    'article[data-v-content] .docs-page-actions-host': {
      fontSize: tokens.fontSize.heading,
    },
  },
})

export const docsPageActions = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  fontFamily: tokens.fontFamily.sansFallback,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.normal,
  lineHeight: tokens.lineHeight.control,
})

// Secondary split button: "Copy page" plus a chevron that opens the page menu.
export const docsPageActionsSplit = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  height: '32px',
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: tokens.color.container,
  selectors: {
    '& > button': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['2'],
      height: '32px',
      paddingBlock: tokens.spacing['0'],
      paddingInline: tokens.spacing['3'],
      border: 0,
      backgroundColor: 'transparent !custom',
      color: inherited.color.vocsTextColorPrimary,
      fontFamily: 'inherit !custom',
      fontSize: 'inherit !custom',
      fontWeight: 'inherit !custom',
      lineHeight: 'inherit !custom',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& > button:first-child': {
      borderStartStartRadius: tokens.radius.md,
      borderEndStartRadius: tokens.radius.md,
    },
    '& > button:last-child': {
      width: '32px',
      paddingInline: tokens.spacing['0'],
      borderInlineStartWidth: tokens.borderWidth.hairline,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: tokens.color.hairline,
      borderStartEndRadius: tokens.radius.md,
      borderEndEndRadius: tokens.radius.md,
      color: tokens.color.muted,
    },
    '& > button[aria-expanded="true"]': {
      backgroundColor: tokens.color.containerStrong,
    },
    '& svg': { flexShrink: 0 },
  },
  '@media (hover: hover)': {
    selectors: {
      '& > button:hover': {
        backgroundColor: tokens.color.containerStrong,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& > button': { transitionProperty: 'none' },
    },
  },
})

// Menus are surfaces: radius 12 with items inset 4 at radius 8, on the page background.
export const docsPageActionsMenu = style({
  position: 'absolute',
  zIndex: tokens.zIndex.floating,
  insetBlockStart: 'calc(100% + 4px)',
  insetInlineEnd: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['0_5'],
  minWidth: '208px',
  padding: tokens.spacing['1'],
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.hairline,
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  backgroundColor: tokens.color.background,
  // design-exception: DS Shadow small; contract.ts has no shadow scale yet.
  boxShadow: '0 4px 12px rgb(0 0 0 / 0.08) !custom',
  selectors: {
    '& > :is(a, button)': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      width: '100%',
      height: '32px',
      paddingBlock: tokens.spacing['0'],
      paddingInline: tokens.spacing['2'],
      border: 0,
      borderRadius: tokens.radius.md,
      '--corner-radius': tokens.radius.md,
      backgroundColor: 'transparent !custom',
      color: inherited.color.vocsTextColorPrimary,
      fontFamily: 'inherit !custom',
      fontSize: 'inherit !custom',
      lineHeight: 'inherit !custom',
      textAlign: 'start',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    },
    '& > :is(a, button):is(:hover, :focus-visible)': {
      backgroundColor: tokens.color.containerSubtle,
    },
    '& > :is(a, button):focus-visible': {
      // design-exception: Menu items fill the menu's inset, so their ring sits inside them.
      outlineOffset: '-2px !custom',
    },
    '& svg': { flexShrink: 0, color: tokens.color.muted },
  },
})
