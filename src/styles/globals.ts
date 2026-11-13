import { inherited } from './inherited'
import { vars as tokens } from './theme'
import './tokens'
import './smoothCorners'
import './links'
import './headingAnchors'
import './copyFeedback'
import './docsGetStarted'
import './docsSteps'
import './docsSearch'
import '../components/DocsCards.styles'
import { fontFace, global, layers } from 'zyzz/web'

// The compiler can deliver this sheet before Vocs. Declare the complete order
// so the site's utilities still override the framework's prefixed layers.
layers([
  'reset',
  'properties',
  'vocs_theme',
  'theme',
  'base',
  'vocs_base',
  'vocs_components',
  'components',
  'vocs_utilities',
  'utilities',
])

fontFace({
  fontFamily: '"Geist"',
  src: 'url("/fonts/geist/Geist-Variable.woff2") format("woff2")',
  fontWeight: '100 900',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"Geist Mono"',
  src: 'url("/fonts/geist/GeistMono-Variable.woff2") format("woff2")',
  fontWeight: '100 900',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"Pilat"',
  src: 'url("/fonts/pilat/Pilat-Book.woff2") format("woff2")',
  fontWeight: '400 500',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"Pilat"',
  src: 'url("/fonts/pilat/Pilat-Demi.woff2") format("woff2")',
  fontWeight: '600 700',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

// Tempo JetBrains Mono: JetBrains Mono with the slashed zero as its default 0.
// Medium answers every heavier weight, so bold code never fakes bold.
fontFace({
  fontFamily: '"Tempo JetBrains Mono"',
  src: 'url("/fonts/tempo-jetbrains-mono/TempoJetBrainsMono-Light.woff2") format("woff2")',
  fontWeight: 300,
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"Tempo JetBrains Mono"',
  src: 'url("/fonts/tempo-jetbrains-mono/TempoJetBrainsMono-Regular.woff2") format("woff2")',
  fontWeight: 400,
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"Tempo JetBrains Mono"',
  src: 'url("/fonts/tempo-jetbrains-mono/TempoJetBrainsMono-Medium.woff2") format("woff2")',
  fontWeight: '500 900',
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"HBSet"',
  src: 'url("/fonts/hbset/HBSetv0.96-Light.woff2") format("woff2")',
  fontWeight: 300,
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"HBSet"',
  src: 'url("/fonts/hbset/HBSetv0.96-Regular2.woff2") format("woff2")',
  fontWeight: 400,
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"HBSet"',
  src: 'url("/fonts/hbset/HBSetv0.96-Medium.woff2") format("woff2")',
  fontWeight: 500,
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

global({
  '@layer utilities': {
    ':root': {
      '--tempo-docs-outline-width': '240px',
      '--tempo-docs-primary-nav-height': '56px',
      '--tempo-docs-shell-width': '100%',
      '--tempo-docs-sidebar-width': '256px',
      '--tempo-hub-width': '1168px',
      '--tempo-font-display': 'var(--font-pilat-book)',
      '--tempo-font-body': 'var(--font-pilat-book)',
      '--vocs-spacing-topNav': 'var(--tempo-docs-primary-nav-height)',
    },
  },
})

global({
  '@layer utilities': {
    'html, body': {
      backgroundColor: inherited.color.vocsBackgroundColorPrimary,

      color: inherited.color.vocsTextColorPrimary,
      fontFamily: tokens.fontFamily.system,
    },
  },
})

/* Pilat kerning compresses spaces after punctuation. */

global({
  '@layer utilities': {
    'html, body': {
      fontKerning: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-gutter-top], [data-v-gutter-logo]': {
      display: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-layout][data-v-sidebar] > [data-v-surface-bg]': {
      display: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-layout][data-v-sidebar]': {
      '--vocs-spacing-content': 'calc(84ch + (var(--vocs-spacing-content-px) * 2))',
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1080px)': {
      '[data-layout][data-v-sidebar] > [data-v-gutter-left]': {
        left: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5))',
        width: 'var(--tempo-docs-sidebar-width)',
        // design-exception: Preserve the inherited component/framework scope at the point of use.
        paddingTop: 'var(--vocs-spacing-topNav) !custom',
        justifyContent: 'flex-start',
        backgroundColor: inherited.color.vocsBackgroundColorPrimary,
        borderRightWidth: tokens.borderWidth.hairline,
        borderRightStyle: 'solid',
        borderRightColor: inherited.color.vocsBorderColorPrimary,
        borderLeft: 0,
      },
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-container], [data-v-sidebar-footer-content], [data-v-mobile-nav]': {
      backgroundColor: inherited.color.vocsBackgroundColorPrimary,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-container]': {
      paddingTop: tokens.spacing['6'],
      scrollbarWidth: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-container]::-webkit-scrollbar': {
      display: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-curtain]': {
      display: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-footer-curtain]': {
      display: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-footer-content]': {
      marginTop: tokens.spacing['3'],
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      marginRight: 'calc(var(--vocs-spacing-sidebar-px) * -1) !custom',
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      marginLeft: 'calc(var(--vocs-spacing-sidebar-px) * -1) !custom',
      paddingTop: tokens.spacing['3_5'],
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      paddingRight: 'var(--vocs-spacing-sidebar-px) !custom',
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      paddingLeft: 'var(--vocs-spacing-sidebar-px) !custom',
      borderTopWidth: tokens.borderWidth.hairline,
      borderTopStyle: 'solid',
      borderTopColor: inherited.color.vocsBorderColorPrimary,
    },
  },
})

// G11 callouts: see the TDS Callout and Alert treatment at the end of this file.

// The outline is the rail on wide screens only. Below it, the menu drawer holds the section's
// pages and the page has no outline, so Vocs' mobile row ("Menu", "On this page") stays hidden.
global({
  '@layer utilities': {
    '[data-v-outline-mobile]': {
      display: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-layout][data-v-sidebar] > [data-v-main] [data-v-outline-mobile]': {
      borderTopLeftRadius: 0,
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1080px)': {
      '[data-layout][data-v-sidebar] > [data-v-main]': {
        width: 'calc(var(--tempo-docs-shell-width) - var(--tempo-docs-sidebar-width))',
        maxWidth: 'calc(var(--tempo-docs-shell-width) - var(--tempo-docs-sidebar-width))',
        // design-exception: Preserve the inherited component/framework scope at the point of use.
        marginLeft:
          'calc( max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5)) + var(--tempo-docs-sidebar-width) ) !custom',
        backgroundColor: inherited.color.vocsBackgroundColorPrimary,
        borderRightWidth: tokens.borderWidth.hairline,
        borderRightStyle: 'solid',
        borderRightColor: inherited.color.vocsBorderColorPrimary,
        minHeight: '100dvh',
      },
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-layout][data-v-sidebar] > [data-v-main]': {
        // design-exception: Preserve the inherited component/framework scope at the point of use.
        paddingRight: 'var(--tempo-docs-outline-width) !custom',
      },
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-v-gutter-right]': {
        right: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5))',
        width: 'var(--tempo-docs-outline-width)',
        backgroundColor: inherited.color.vocsBackgroundColorPrimary,
        borderRightWidth: tokens.borderWidth.hairline,
        borderRightStyle: 'solid',
        borderRightColor: inherited.color.vocsBorderColorPrimary,
      },
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-content], [data-v-sidebar] [data-v-footer]': {
      backgroundColor: 'transparent !custom',
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-v-sidebar] [data-v-content]': {
        marginLeft: 'auto !custom',
        marginRight: 'auto !custom',
      },
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-layout][data-v-sidebar][data-v-content-width="full"]:has( [data-v-openapi]:not([data-v-openapi-landing]) ) > [data-v-main]':
        {
          paddingRight: 0,
        },
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-layout][data-v-sidebar][data-v-content-width="full"]:has( [data-v-openapi]:not([data-v-openapi-landing]) ) > [data-v-gutter-right]':
        {
          display: 'none',
        },
    },
  },
})

global({
  '@layer utilities': {
    '[data-layout][data-v-sidebar][data-v-content-width="full"]:has( [data-v-openapi]:not([data-v-openapi-landing]) ) [data-v-openapi-header], [data-layout][data-v-sidebar][data-v-content-width="full"]:has( [data-v-openapi]:not([data-v-openapi-landing]) ) [data-v-openapi-description]':
      {
        width: '100%',
        maxWidth: 'none',
        marginLeft: 0,
        marginRight: 0,
        textAlign: 'left',
      },
  },
})

global({
  '@layer utilities': {
    '[data-layout][data-v-sidebar][data-v-content-width="full"]:has( [data-v-openapi]:not([data-v-openapi-landing]) ) [data-v-openapi] [data-v-content]':
      {
        marginLeft: 0,
        marginRight: 0,
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-container] [data-v-sidebar]': {
      gap: tokens.spacing['6'],
      fontFamily: tokens.fontFamily.system,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section]': {
      minWidth: 0,
    },
  },
})

global({
  '@layer utilities': {
    // Groups sit 24 apart (the sidebar gap) with no dividers.
    '[data-v-sidebar] > [data-v-sidebar-section] + [data-v-sidebar-section]': {
      borderTopWidth: tokens.borderWidth.none,
      paddingTop: tokens.spacing['0'],
    },
  },
})

// SB2: every section header is a group label (for example Accounts, Payments,
// Fees), quieter than its items like DS SidebarMenu's GroupLabel: 12/16 in the
// tertiary color, 4 above its first item. Labels start on the gutter with the items
// (sidebar padding 12 + item padding 12). Collapsible headers are controls, so they
// keep the 32px item height and the item style.
global({
  '@layer utilities': {
    '[data-v-sidebar] > [data-v-sidebar-section]:only-child > [data-v-sidebar-section-header]': {
      height: 'auto',
      minHeight: 0,
      // design-exception: Items bleed 12px into the sidebar padding so labels sit on the gutter.
      margin: '0 -12px 4px !custom',

      paddingBlock: tokens.spacing['0'],
      paddingInline: tokens.spacing['3'],
      backgroundColor: 'transparent !custom',

      color: tokens.color.tertiary,
      fontFamily: tokens.fontFamily.ui,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.normal,

      letterSpacing: tokens.letterSpacing.normal,
      lineHeight: tokens.lineHeight.caption,
      textTransform: 'none',
    },
    '[data-v-sidebar] > [data-v-sidebar-section]:not(:only-child) > [data-v-sidebar-section-header], [data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header]:not([data-collapsable="true"])':
      {
        height: 'auto',
        minHeight: 0,
        // design-exception: Matches the sidebar entries' 12px bleed below.
        margin: '0 -12px 4px !custom',

        paddingBlock: tokens.spacing['0'],
        paddingInline: tokens.spacing['3'],
        backgroundColor: 'transparent !custom',

        color: tokens.color.tertiary,
        fontFamily: tokens.fontFamily.ui,
        fontSize: tokens.fontSize.xs,
        fontWeight: tokens.fontWeight.normal,

        letterSpacing: tokens.letterSpacing.normal,
        lineHeight: tokens.lineHeight.caption,
        textTransform: 'none',
      },
    '[data-v-sidebar] > [data-v-sidebar-section] > [data-v-sidebar-section-header][data-collapsable="true"]':
      {
        minHeight: '32px',
        paddingBlock: tokens.spacing['1_5'],
        color: tokens.color.foreground,
      },
  },
})

// A collapsed section has no items below its label, so drop the label's bottom
// margin; the divider padding above matches the sidebar gap below.
global({
  '@layer utilities': {
    '[data-v-sidebar] > [data-v-sidebar-section][data-collapsed="true"] > [data-v-sidebar-section-header]':
      {
        marginBottom: tokens.spacing['0'],
      },
  },
})

// Vocs adds a bottom margin to open sections on top of the sidebar gap; drop it so
// the space after a section's last item matches the space between sections.
global({
  '@layer utilities': {
    '[data-v-sidebar] > [data-v-sidebar-section][data-collapsed="false"]': {
      marginBottom: tokens.spacing['0'],
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable="true"]':
      {
        minHeight: '32px',
        // design-exception: Items bleed 12px into the sidebar padding so labels sit on the gutter.
        margin: '0 -12px !custom',

        paddingBlock: tokens.spacing['1_5'],
        paddingInline: tokens.spacing['3'],
        borderRadius: tokens.radius.md,
        '--corner-radius': tokens.radius.md,
        backgroundColor: 'transparent !custom',

        color: tokens.color.muted,
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.normal,
        letterSpacing: tokens.letterSpacing.normal,
        lineHeight: tokens.lineHeight.control,
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable="true"]:hover':
      {
        backgroundColor: tokens.color.containerSubtle,
        color: tokens.color.foreground,
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content]': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['0_5'],
    },
  },
})

global({
  '@layer utilities': {
    // Nested items indent 12, with no guide line.
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-content]': {
      marginTop: tokens.spacing['0_5'],
      marginBottom: tokens.spacing['0'],
      paddingInlineStart: tokens.spacing['3'],
      borderLeftWidth: tokens.borderWidth.none,
      gap: tokens.spacing['0_5'],
    },
  },
})

global({
  '@layer utilities': {
    // Items: 32 high, radius 8, label in the secondary color on the gutter.
    '[data-v-sidebar] [data-v-sidebar-item][data-link]': {
      minHeight: '32px',
      // design-exception: Items bleed 12px into the sidebar padding so labels sit on the gutter.
      margin: '0 -12px !custom',

      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['3'],
      borderRadius: tokens.radius.md,
      '--corner-radius': tokens.radius.md,

      color: tokens.color.muted,
      fontFamily: tokens.fontFamily.ui,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.normal,
      lineHeight: tokens.lineHeight.control,
    },
    // Collapsible headers read as items, in the same UI font.
    '[data-v-sidebar] [data-v-sidebar-section-header][data-collapsable="true"]': {
      fontFamily: tokens.fontFamily.ui,
    },
  },
})

// SB3: entry hover fills enter and exit with the motion tokens (exit on the
// base state, enter on hover). Top-level collapsible group labels share the
// entry hover. Reduced motion switches instantly.
global({
  '@layer utilities': {
    '[data-v-sidebar] :is([data-v-sidebar-item][data-link], [data-v-sidebar-section-header][data-collapsable="true"])':
      {
        transitionProperty: 'color, background-color, border-color, opacity, transform',
        transitionDuration: 'var(--tempo-exit)',
        transitionTimingFunction: 'var(--tempo-ease)',
      },
    '[data-v-sidebar] :is(a[data-v-sidebar-item][data-link], [data-v-sidebar-section-header][data-collapsable="true"]):hover':
      {
        transitionDuration: 'var(--tempo-enter)',
      },
    '[data-v-sidebar] > [data-v-sidebar-section] + [data-v-sidebar-section] > [data-v-sidebar-section-header][data-collapsable="true"]':
      {
        borderRadius: tokens.radius.md,
        '--corner-radius': tokens.radius.md,
      },
    '[data-v-sidebar] > [data-v-sidebar-section] + [data-v-sidebar-section] > [data-v-sidebar-section-header][data-collapsable="true"]:hover':
      {
        backgroundColor: tokens.color.containerSubtle,
        color: tokens.color.foreground,
      },
    '@media (prefers-reduced-motion: reduce)': {
      '[data-v-sidebar] :is([data-v-sidebar-item][data-link], [data-v-sidebar-section-header][data-collapsable="true"])':
        {
          transitionProperty: 'none',
        },
    },
  },
})

global({
  '@layer utilities': {
    // Hover: the container/subtle chip.
    '[data-v-sidebar] a[data-v-sidebar-item][data-link]:hover': {
      backgroundColor: tokens.color.containerSubtle,
      color: tokens.color.foreground,
    },
  },
})

global({
  '@layer utilities': {
    // Current: the container/regular chip, primary and medium (one active state everywhere).
    '[data-v-sidebar] a[data-v-sidebar-item][data-active]': {
      backgroundColor: tokens.color.container,
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.medium,
      boxShadow: 'none',
    },
  },
})

// A collapsible group whose own page is current takes the same chip as a current item. The
// selectors out-rank the nested-header rules above, which reset the header's fill.
global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable][data-active]:has(> a[aria-current="page"]), [data-v-sidebar] > [data-v-sidebar-section] > [data-v-sidebar-section-header][data-collapsable][data-active]:has(> a[aria-current="page"])':
      {
        borderRadius: tokens.radius.md,
        '--corner-radius': tokens.radius.md,
        backgroundColor: tokens.color.container,
        color: tokens.color.foreground,
        fontWeight: tokens.fontWeight.medium,
      },
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable][data-active]:has(> a[aria-current="page"]):hover, [data-v-sidebar] > [data-v-sidebar-section] > [data-v-sidebar-section-header][data-collapsable][data-active]:has(> a[aria-current="page"]):hover':
      {
        backgroundColor: tokens.color.container,
      },
  },
})

// SB1: the current page has no hover state; hovering it keeps its fill.
global({
  '@layer utilities': {
    '[data-v-sidebar] a[data-v-sidebar-item][data-active]:hover': {
      backgroundColor: tokens.color.container,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-item][data-condensed="true"]': {
      minHeight: '32px',
      fontSize: tokens.fontSize.sm,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-header] svg': {
      color: tokens.color.muted,
    },
  },
})

global({
  '@layer utilities': {
    // GitHub and X live in the site footer; the sidebar footer keeps only the theme control.
    '[data-v-sidebar-footer-content] [data-v-socials]': {
      display: 'none',
    },
  },
})

/* Vocs portals this outline to body; align it with the docs gutter. */

global({
  '@layer utilities': {
    '[data-v-version-outline]': {
      display: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-v-version-outline]': {
        display: 'block',
        right: 'max(24px, calc((100% - var(--tempo-docs-shell-width)) * 0.5 + 24px))',
        width: 'calc(var(--tempo-docs-outline-width) - 48px)',
      },
    },
  },
})

// Ask AI lives in each page's header row (DocsPageActions), which also takes its ⌘I shortcut.
global({
  '@layer utilities': {
    '[data-v-ask-ai-container]': {
      display: 'none',
    },
  },
})

/* https://github.com/radix-ui/colors */

/* Marketing surface tokens copied from the developers site. They override the
 * Tailwind theme variables at runtime so the root marketing pages can switch
 * between the same dark and light palettes while the docs remain Vocs pages. */

// Neutral, shade, tint and accent values come from TDS Core via the TDS Platform
// semantics (tempoxyz/ds@3fd4cf7af1990a86194a5d8955ec76b7f08f3810).
global({
  ':root': {
    colorScheme: 'dark',
    '--font-hbset': '"HBSet"',
    '--font-pilat-book': '"Pilat", ui-sans-serif, system-ui, sans-serif',
    '--font-jetbrains-mono': '"Tempo JetBrains Mono", ui-monospace, monospace',
    '--vocs-font-family': 'var(--font-pilat-book)',
    '--vocs-font-family-mono': 'var(--font-jetbrains-mono), ui-monospace, monospace',
    '--scalar-font-code': 'var(--vocs-font-family-mono)',
    '--color-background': '#000000', // neutral 100
    '--color-foreground': '#ffffff', // neutral 000
    '--color-foreground-secondary': 'rgb(255 255 255 / 0.56)', // tint 056
    '--color-foreground-secondary-hover': '#ffffff', // neutral 000
    '--color-negative': '#f55c45', // redDark
    '--color-info': '#7498fb', // blueDark
    '--color-positive': '#59e5a4', // greenDark
    '--color-warning': '#fa8e36', // orangeDark
    '--color-on-accent': '#ffffff',
    '--color-on-negative': '#ffffff',
    '--color-on-surface-onyx': '#ffffff', // neutral 000
    '--color-surface-block': '#141414', // neutral 092
    '--color-surface-block-muted': '#141414', // neutral 092
    '--color-surface-card': '#141414', // neutral 092
    '--color-surface-card-elev': '#141414', // neutral 092
    '--color-surface-input': '#1f1f1f', // neutral 088
    '--color-surface-onyx': '#000000', // neutral 100
    '--color-surface-deep': '#0a0a0a', // neutral 096
    '--color-surface-skeleton': '#292929', // neutral 084
    '--color-surface-panel': '#141414', // neutral 092
    '--color-surface-page': '#000000', // neutral 100
    '--color-surface-shell': '#000000', // neutral 100
    '--color-line': 'rgb(255 255 255 / 0.16)', // tint 016
    '--color-line-strong': 'rgb(255 255 255 / 0.24)', // tint 024
    '--color-line-dashed': '#858585', // neutral 048
    '--color-accent-blue': '#7498fb', // blueDark
    '--color-indicator-green': '#59e5a4', // greenDark
    '--color-indicator-green-dark': '#1d6418',
    '--color-performance-tps-start': 'var(--color-accent-blue)',
    '--color-performance-tps-mid': 'var(--color-indicator-green)',
    '--color-performance-tps-end': 'var(--color-code-token-number)',
    '--color-canvas-dot-bright': '#d9d9d9',
    '--color-selection-bg': '#ffffff',
    '--color-selection-fg': '#000000',
    '--color-code-token-keyword': '#d487f3',
    '--color-code-token-function': '#5d88ff',
    '--color-code-token-string': '#58b88a',
    '--color-code-token-number': '#cde769',
    '--color-code-token-comment': 'rgb(255 255 255 / 0.3)',
    '--color-code-token-punctuation': 'rgb(255 255 255 / 0.45)',
    '--color-prose-body': 'rgba(255, 255, 255, 0.7)',
    '--color-prose-link-decoration': 'rgba(255, 255, 255, 0.3)',
    '--color-prose-marker': 'rgba(255, 255, 255, 0.35)',
    '--color-prose-quote': 'rgba(255, 255, 255, 0.5)',
    '--color-prose-caption': 'rgba(255, 255, 255, 0.4)',
    '--color-scrollbar-thumb': '#151515',
  },
})

/* Documentation diagram (inlined SVG) palette — kept identical to the original
     dark-only artwork so dark mode is unchanged; the light overrides below
     swap these for legible values on a light page. */

global({
  ':root': {
    '--diagram-bg': '#0e0e0e',
    '--diagram-selection-bg': '#234b75',
    '--diagram-inverse-selection-bg': '#d7eaff',
    '--diagram-box': '#1c1c1c',
    '--diagram-box-border': '#2e2e2e',
    '--diagram-line': '#2e2e2e',
    '--diagram-line-soft': '#181818',
    '--diagram-accent': '#65ff54',
    '--diagram-accent-bg': '#143810',
    '--background': 'var(--color-background)',
    '--foreground': 'var(--color-foreground)',
    '--foreground-secondary': 'var(--color-foreground-secondary)',
    '--foreground-secondary-hover': 'var(--color-foreground-secondary-hover)',
    '--negative': 'var(--color-negative)',
    '--info': 'var(--color-info)',
    '--positive': 'var(--color-positive)',
    '--warning': 'var(--color-warning)',
    '--on-accent': 'var(--color-on-accent)',
    '--on-negative': 'var(--color-on-negative)',
    '--on-surface-onyx': 'var(--color-on-surface-onyx)',
    '--surface-block': 'var(--color-surface-block)',
    '--surface-block-muted': 'var(--color-surface-block-muted)',
    '--surface-card': 'var(--color-surface-card)',
    '--surface-card-elev': 'var(--color-surface-card-elev)',
    '--surface-input': 'var(--color-surface-input)',
    '--surface-onyx': 'var(--color-surface-onyx)',
    '--surface-deep': 'var(--color-surface-deep)',
    '--surface-skeleton': 'var(--color-surface-skeleton)',
    '--surface-panel': 'var(--color-surface-panel)',
    '--surface-page': 'var(--color-surface-page)',
    '--surface-shell': 'var(--color-surface-shell)',
    '--line': 'var(--color-line)',
    '--line-strong': 'var(--color-line-strong)',
    '--line-dashed': 'var(--color-line-dashed)',
    '--accent-blue': 'var(--color-accent-blue)',
    '--indicator-green': 'var(--color-indicator-green)',
    '--indicator-green-dark': 'var(--color-indicator-green-dark)',
    '--performance-tps-start': 'var(--color-performance-tps-start)',
    '--performance-tps-mid': 'var(--color-performance-tps-mid)',
    '--performance-tps-end': 'var(--color-performance-tps-end)',
    '--canvas-dot-rgb': '125, 125, 125',
    '--canvas-dot-alpha-base': '0.05',
    '--canvas-dot-bright': 'var(--color-canvas-dot-bright)',
    '--selection-bg': 'var(--color-selection-bg)',
    '--selection-fg': 'var(--color-selection-fg)',
    '--code-token-keyword': 'var(--color-code-token-keyword)',
    '--code-token-function': 'var(--color-code-token-function)',
    '--code-token-string': 'var(--color-code-token-string)',
    '--code-token-number': 'var(--color-code-token-number)',
    '--code-token-comment': 'var(--color-code-token-comment)',
    '--code-token-punctuation': 'var(--color-code-token-punctuation)',
    '--prose-body': 'var(--color-prose-body)',
    '--prose-link-decoration': 'var(--color-prose-link-decoration)',
    '--prose-marker': 'var(--color-prose-marker)',
    '--prose-quote': 'var(--color-prose-quote)',
    '--prose-caption': 'var(--color-prose-caption)',
    '--scrollbar-thumb': 'var(--color-scrollbar-thumb)',
    '--vocs-color-accent': 'var(--accent-blue)',
    '--vocs-color-blue': 'var(--info)',
    '--vocs-color-green': 'var(--positive)',
    '--vocs-color-red': 'var(--negative)',
    '--vocs-color-yellow': 'var(--warning)',
    '--vocs-color-background-primary': 'var(--surface-shell)',
    '--vocs-background-color-primary': 'var(--surface-shell)',
    '--vocs-background-color-surface': 'var(--surface-card)',
    '--vocs-background-color-surfaceMuted': 'var(--surface-panel)',
    '--vocs-background-color-surfaceTint': 'var(--surface-block)',
    '--vocs-background-color-code-block': 'var(--surface-block)',
    '--vocs-background-color-code-highlighted':
      'color-mix(in srgb, var(--foreground) 8%, var(--surface-block))',
    '--vocs-background-color-inline-code': 'var(--surface-block)',
    '--vocs-text-color-primary': 'var(--foreground)',
    '--vocs-text-color-secondary': 'var(--foreground-secondary)',
    '--vocs-text-color-muted': 'var(--prose-caption)',
    '--vocs-text-color-heading': 'var(--foreground)',
    '--vocs-text-color-link': 'var(--foreground)',
    '--vocs-text-color-link-hover': 'var(--foreground-secondary-hover)',
    '--vocs-text-color-quote': 'var(--prose-quote)',
    '--vocs-border-color-primary': 'var(--line)',
    '--vocs-border-color-secondary': 'var(--line-strong)',
    '--vocs-border-color-code-highlighted': 'var(--line-strong)',
    '--showcase-window-frame': 'var(--surface-block-muted)',
    '--showcase-window-frame-border': 'var(--line-strong)',
    '--showcase-window-bg': 'var(--surface-block)',
    '--showcase-window-chrome': 'var(--surface-card)',
    '--showcase-window-card': 'var(--surface-card-elev)',
    '--showcase-window-input': 'var(--surface-input)',
    '--showcase-window-active': 'color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--showcase-window-chip': 'color-mix(in srgb, var(--foreground) 6%, transparent)',
    '--showcase-window-border': 'var(--line-strong)',
    '--showcase-window-border-strong': 'color-mix(in srgb, var(--foreground) 28%, transparent)',
    '--showcase-window-dot': 'var(--surface-skeleton)',
    '--showcase-window-text': 'var(--foreground)',
    '--showcase-window-muted': 'var(--foreground-secondary)',
    '--showcase-window-accent': 'var(--accent-blue)',
    '--showcase-window-accent-text': 'var(--on-accent)',
    '--showcase-window-positive': 'var(--indicator-green)',
    '--showcase-window-positive-bg': 'color-mix(in srgb, var(--indicator-green) 14%, transparent)',
    '--showcase-window-warning': 'var(--negative)',
    '--showcase-window-warning-bg': 'color-mix(in srgb, var(--negative) 14%, transparent)',
  },
})

global({
  ':root:where([data-theme="light"], [data-vocs-theme="light"])': {
    colorScheme: 'light',
    '--color-background': '#ffffff', // neutral 000
    '--color-foreground': '#000000', // neutral 100
    '--color-foreground-secondary': 'rgb(0 0 0 / 0.56)', // shade 056
    '--color-foreground-secondary-hover': '#000000', // neutral 100
    '--color-negative': '#eb3417', // redLight
    '--color-info': '#4471ed', // blueLight
    '--color-positive': '#13a963', // greenLight
    '--color-warning': '#e06f12', // orangeLight
    '--color-on-accent': '#ffffff',
    '--color-on-negative': '#ffffff',
    '--color-on-surface-onyx': '#ffffff', // neutral 000
    '--color-surface-block': '#f5f5f5', // neutral 004
    '--color-surface-block-muted': '#f7f7f7', // neutral 003
    '--color-surface-card': '#ffffff', // neutral 000
    '--color-surface-card-elev': '#ffffff', // neutral 000
    '--color-surface-input': '#f5f5f5', // neutral 004
    '--color-surface-onyx': '#141414', // neutral 092
    '--color-surface-deep': '#f5f5f5', // neutral 004
    '--color-surface-skeleton': '#e0e0e0', // neutral 012
    '--color-surface-panel': '#f5f5f5', // neutral 004
    '--color-surface-page': '#ffffff', // neutral 000
    '--color-surface-shell': '#ffffff', // neutral 000
    '--color-line': 'rgb(0 0 0 / 0.08)', // shade 008
    '--color-line-strong': 'rgb(0 0 0 / 0.16)', // shade 016
    '--color-line-dashed': '#a3a3a3', // neutral 036
    '--color-accent-blue': '#4471ed', // blueLight
    '--color-indicator-green': '#13a963', // greenLight
    '--color-indicator-green-dark': '#0f5f18',
    '--color-performance-tps-start': 'var(--color-indicator-green)',
    '--color-performance-tps-mid':
      'color-mix( in srgb, var(--color-indicator-green) 45%, var(--color-accent-blue) )',
    '--color-performance-tps-end': 'var(--color-accent-blue)',
    '--color-canvas-dot-bright': '#111111',
    '--color-selection-bg': '#111111',
    '--color-selection-fg': '#ffffff',
    '--color-code-token-keyword': '#a93ad4',
    '--color-code-token-function': 'var(--color-accent-blue)',
    '--color-code-token-string': '#167a52',
    '--color-code-token-number': '#6a7500',
    '--color-code-token-comment': 'color-mix(in srgb, var(--color-foreground) 38%, transparent)',
    '--color-code-token-punctuation':
      'color-mix(in srgb, var(--color-foreground) 48%, transparent)',
    '--color-prose-body': 'color-mix(in srgb, var(--color-foreground) 70%, transparent)',
    '--color-prose-link-decoration': 'color-mix(in srgb, var(--color-foreground) 28%, transparent)',
    '--color-prose-marker': 'color-mix(in srgb, var(--color-foreground) 35%, transparent)',
    '--color-prose-quote': 'color-mix(in srgb, var(--color-foreground) 52%, transparent)',
    '--color-prose-caption': 'color-mix(in srgb, var(--color-foreground) 45%, transparent)',
    '--color-scrollbar-thumb': '#d4d4d4',
    '--diagram-bg': '#f5f5f5',
    '--diagram-selection-bg': '#d7eaff',
    '--diagram-inverse-selection-bg': '#234b75',
    '--diagram-box': '#ffffff',
    '--diagram-box-border': '#d4d4d4',
    '--diagram-line': '#d4d4d4',
    '--diagram-line-soft': '#e5e5e5',
    '--diagram-accent': '#168f24',
    '--diagram-accent-bg': '#e3f5e5',
    '--canvas-dot-rgb': '17, 17, 17',
    '--canvas-dot-alpha-base': '0.045',
    '--showcase-window-frame': 'var(--surface-block)',
    '--showcase-window-frame-border': 'var(--line-strong)',
    '--showcase-window-bg': 'var(--surface-shell)',
    '--showcase-window-chrome': 'var(--surface-panel)',
    '--showcase-window-card': 'var(--surface-card)',
    '--showcase-window-input': 'var(--surface-card)',
    '--showcase-window-active': 'var(--surface-block)',
    '--showcase-window-chip': 'var(--surface-input)',
    '--showcase-window-border': 'var(--line)',
    '--showcase-window-border-strong': 'var(--line-strong)',
    '--showcase-window-dot': 'var(--surface-skeleton)',
    '--showcase-window-text': 'var(--foreground)',
    '--showcase-window-muted': 'var(--foreground-secondary)',
    '--showcase-window-accent': 'var(--accent-blue)',
    '--showcase-window-accent-text': 'var(--on-accent)',
    '--showcase-window-positive': 'var(--indicator-green)',
    '--showcase-window-positive-bg': 'color-mix(in srgb, var(--indicator-green) 12%, transparent)',
    '--showcase-window-warning': 'var(--negative)',
    '--showcase-window-warning-bg': 'color-mix(in srgb, var(--negative) 12%, transparent)',
  },
})

global({
  'html, body': {
    backgroundColor: tokens.color.background,
    color: tokens.color.foreground,
  },
})

global({
  'html:has(.docs-site-header), body:has(.docs-site-header)': {
    backgroundColor: tokens.color.shell,
  },
})

global({
  html: {
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
})

global({
  body: {
    userSelect: 'text',
    fontFamily: tokens.fontFamily.book,
  },
})

global({
  ':where( a[href], button:not(:disabled), summary, [role="button"], input[type="button"], input[type="submit"], input[type="reset"] )':
    {
      cursor: 'pointer',
    },
})

global({
  '::selection': {
    backgroundColor: inherited.color.selectionBg,

    color: inherited.color.selectionFg,
  },
})

global({
  '@media (prefers-reduced-motion: no-preference)': {
    html: {
      scrollBehavior: 'smooth',
    },
  },
})

global({
  ':root:where([data-theme="light"], [data-vocs-theme="light"])': {
    '--feature-diagram-mark-filter': 'none',
  },
})

/* Typography utilities — Regen design system. Each bundles font-size,
   font-weight, line-height, and letter-spacing. font-family inherits, so
   compose with `font-mono` etc. when a different family is needed. */

/* "Live" indicator surface: a slow diagonal sweep between the dark and
     bright green tokens. The 200% background-size leaves enough off-canvas
     gradient for the sweep to read as continuous flow rather than a pulse. */

/* Ring outline expanding and fading out from the Reth badge border on hover. */

/* Payment-lanes chart on /performance: pulses travel along the flat fee line
   (offset matches the dash period 26 + 162) while the general-blockspace
   zone's tint slowly breathes. */

/* Settlement stream on /performance: a new block pops in, its fill bar runs
   for one block interval (duration set via --build-ms), and the cell flashes
   green once at the moment it settles. */

/* Thin scrollbar for the mobile inline code block. */

global({
  '[data-v-logo] img': {
    height: '20px',
    marginTop: tokens.spacing['0_5'],
  },
})

/* ---------------------------------------------------------------------------
 * API Overview — the `<OpenApi.Endpoints>` accordion is a static reference
 * list here, so suppress the interactive hover highlight on category triggers
 * and endpoint rows.
 * --------------------------------------------------------------------------- */

global({
  '[data-v-openapi-overview] [data-v-openapi-disclosure-trigger]:hover, [data-v-openapi-overview] [data-v-openapi-overview-endpoint]:hover':
    {
      backgroundColor: 'transparent !custom',
    },
})

/* ---------------------------------------------------------------------------
 * Terminal theme — scoped color variables for the embedded terminal demo.
 * --------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * Zone diagrams — SVGs embedded in technical documentation.
 * --------------------------------------------------------------------------- */

/* ZoneDiagram inlines SVGs so they can
   follow the active theme. Text uses currentColor; shapes use diagram tokens. */

global({
  '.docs-zone-diagram svg.blog-diagram': {
    display: 'block',
    width: '100%',
    height: 'auto',

    marginTop: inherited.spacing.block,
    borderWidth: tokens.borderWidth.hairline,
    borderStyle: 'solid',
    borderColor: tokens.color.line,
    color: tokens.color.foreground,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram :is(text, tspan)': {
    WebkitUserSelect: 'text',
    userSelect: 'text',
    cursor: 'text',
  },
})

/* SVG glyph fills stay unchanged during selection in Chromium. */

global({
  '.docs-zone-diagram svg.blog-diagram :is(text, tspan)::selection': {
    backgroundColor: inherited.color.diagramSelectionBg,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram [fill="var(--on-surface-onyx)"]': {
    '--diagram-selection-bg': '#234b75',
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram [fill="var(--diagram-box)"]': {
    '--diagram-selection-bg': 'var(--diagram-inverse-selection-bg)',
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram .dgm-bg': {
    fill: inherited.color.diagramBg,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram .dgm-box': {
    fill: inherited.color.diagramBox,

    stroke: inherited.color.diagramBoxBorder,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram .dgm-accent-box': {
    fill: inherited.color.diagramAccentBg,

    stroke: inherited.color.diagramAccent,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram .dgm-line': {
    stroke: inherited.color.diagramLine,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram .dgm-line-soft': {
    stroke: inherited.color.diagramLineSoft,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram .dgm-accent-line': {
    stroke: inherited.color.diagramAccent,
  },
})

global({
  '.docs-zone-diagram svg.blog-diagram .dgm-accent': {
    fill: inherited.color.diagramAccent,
  },
})

/* A quiet navigation surface frames the denser developer reading workspace. */

global({
  '@layer utilities': {
    '[data-layout][data-v-sidebar] > [data-v-gutter-left], [data-v-sidebar-container], [data-v-sidebar-footer-content]':
      {
        backgroundColor: tokens.color.shell,
      },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content]': {
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.prose,
    },
  },
})

global({
  '@layer utilities': {
    // Headings: Pilat Book, regular, tight tracking, primary. H2 24, H3 18, H4 16.
    'article[data-v-content] :is(h1, h2, h3, h4)[data-v]': {
      color: tokens.color.foreground,
      fontFamily: inherited.fontFamily.tempoFontDisplay,
      fontWeight: tokens.fontWeight.normal,

      letterSpacing: tokens.letterSpacing.tight,
      textWrap: 'balance',
    },
    'article[data-v-content] h2[data-v]': {
      fontSize: tokens.fontSize.title,
      lineHeight: tokens.lineHeight.heading,
    },
    'article[data-v-content] h3[data-v]': {
      fontSize: tokens.fontSize.lead,
      lineHeight: tokens.lineHeight.snug,
    },
    'article[data-v-content] h4[data-v]': {
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.normal,
    },
  },
})

global({
  '@layer utilities': {
    // H1 32 (28 below 768), with the Copy page control floated on its first line.
    'article[data-v-content] h1[data-v]': {
      maxWidth: 'none',
      border: 0,
      paddingBottom: 0,
      fontSize: tokens.fontSize.displaySmall,
      letterSpacing: tokens.letterSpacing.tight,

      lineHeight: tokens.lineHeight.heading,
    },
    '@media (width < 768px)': {
      'article[data-v-content] h1[data-v]': {
        fontSize: tokens.fontSize.heading,
      },
    },
    // H1 to lead 12; H2 16 below; H3 12 below; H4 8 below.
    'article[data-v-content] > h1[data-v]:has(+ p[data-v])': {
      marginBottom: tokens.spacing['3'],
    },
    'article[data-v-content] > h2[data-v]': {
      marginBottom: tokens.spacing['4'],
    },
    'article[data-v-content] > h3[data-v]': {
      marginBottom: tokens.spacing['3'],
    },
    'article[data-v-content] > h4[data-v]': {
      marginBottom: tokens.spacing['2'],
    },
    // Lists: 8 between items.
    'article[data-v-content] :is(ul, ol)[data-v] > li + li': {
      marginTop: tokens.spacing['2'],
    },
  },
})

global({
  '@layer utilities': {
    // Lead at body size in the secondary color, 32 above the first content.
    'article[data-v-content] > h1[data-v] + p[data-v]': {
      marginBottom: tokens.spacing['8'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.body,
    },
  },
})

/* Vocs already accounts for the site header in html scroll-padding-top. */

global({
  '@layer utilities': {
    'article[data-v-content] :is(h1, h2, h3, h4)[id]': {
      scrollMarginTop: '16px',
    },
  },
})

global({
  '@layer utilities': {
    '@media (width < 1376px)': {
      'article[data-v-content] :is(h1, h2, h3, h4)[id]': {
        scrollMarginTop: '64px',
      },
    },
  },
})

// The rail holds the outline only: "On this page" 14/20 secondary, items 14/20
// secondary, the current one primary with a 2px indicator in content/primary on a
// hairline track. Feedback moves to the page end; Copy page sits on the H1's row.
global({
  '@layer utilities': {
    '[data-v-outline]:not([data-v-outline-mobile]) > :not([data-v-outline-nav])': {
      display: 'none',
    },
    '[data-v-outline-nav]': {
      gap: tokens.spacing['3'],
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
    },
    '[data-v-outline-nav] > div:first-child': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      lineHeight: tokens.lineHeight.control,
    },
    '[data-v-outline-nav] > div:first-child > svg': {
      display: 'none',
    },
    '[data-v-outline-items]': {
      borderInlineStartColor: tokens.color.hairline,
      fontSize: tokens.fontSize.sm,
    },
    '[data-v-outline-item] a': {
      paddingBlock: tokens.spacing['1'],
      color: tokens.color.muted,
      fontWeight: tokens.fontWeight.normal,
      lineHeight: tokens.lineHeight.control,
    },
    '[data-v-outline-item] a:hover': {
      color: tokens.color.foreground,
    },
    '[data-v-outline-indicator]': {
      backgroundColor: tokens.color.foreground,
    },
    '[data-v-outline-item] a[data-active="true"]': {
      color: tokens.color.foreground,
    },
  },
})

global({
  '@layer utilities': {
    // The docs-local SegmentedControl and Tabs keep their own TDS rings (inset for segments).
    'body:has(.docs-site-header) :is(a, button, input, summary):not([data-tds-control]):focus-visible':
      {
        outlineWidth: tokens.borderWidth.emphasis,
        outlineStyle: 'solid',
        outlineColor: tokens.color.foreground,
        outlineOffset: '3px',
      },
  },
})

/* The entry page needs room for product discovery, not a second contents list. */

global({
  '@layer utilities': {
    '[data-layout]:has(.tempo-docs-home) > [data-v-main]': {
      width: 'var(--tempo-docs-shell-width)',
      maxWidth: 'var(--tempo-docs-shell-width)',
      marginInline: 'auto !custom',
      paddingRight: 0,
      border: 0,
    },
  },
})

global({
  '@layer utilities': {
    '[data-layout]:has(.tempo-docs-home) [data-v-gutter-left], [data-layout]:has(.tempo-docs-home) [data-v-gutter-right], [data-layout]:has(.tempo-docs-home) [data-v-outline-mobile], [data-layout]:has(.tempo-docs-home) [data-v-outline], [data-layout]:has(.tempo-docs-home) [data-v-content-footer]':
      {
        display: 'none',
      },
  },
})

global({
  '@layer utilities': {
    // Home sits on the gutter (16, 24 from 768) with 32 above the hero (48 from 1080).
    'article[data-v-content]:has(.tempo-docs-home)': {
      maxWidth: 'calc(var(--tempo-hub-width) + 48px)',
      marginInline: 'auto !custom',
      paddingBlock: tokens.spacing['8'],
      paddingInline: tokens.spacing['4'],
    },
    '@media (width >= 768px)': {
      'article[data-v-content]:has(.tempo-docs-home)': {
        paddingInline: tokens.spacing['6'],
      },
    },
    '@media (width >= 1080px)': {
      'article[data-v-content]:has(.tempo-docs-home)': {
        paddingBlock: tokens.spacing['12'],
      },
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] :is(p, li, td)[data-v] a[data-v]': {
      color: tokens.color.accent,
      fontWeight: tokens.fontWeight.normal,
      textDecorationLine: 'underline',
      textDecorationStyle: 'solid',

      textDecorationColor: inherited.color.colorMixInSrgbAccentBlue40Transparent,
      textDecorationThickness: '1px',
      textUnderlineOffset: '3px',
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] :is(p, li, td)[data-v] a[data-v]:is(:hover, :focus-visible)': {
      textDecorationColor: 'currentColor !custom',
    },
  },
})

// Linked inline code, such as a CLI command, keeps its code styling; hover reveals the link.
global({
  '@layer utilities': {
    'article[data-v-content] :is(p, li, td)[data-v] a[data-v]:has(> code:only-child)': {
      color: tokens.color.foreground,
      textDecorationLine: 'none',
    },
    'article[data-v-content] :is(p, li, td)[data-v] a[data-v]:has(> code:only-child):is(:hover, :focus-visible)':
      {
        textDecorationLine: 'underline',
        textDecorationColor: 'currentColor !custom',
      },
  },
})

/* Formal specifications link back to their index above the page title. */

// Vocs owns the Mermaid wrapper markup.
global({ '.data-v-mermaid-container': { minHeight: '200px' } })

// G2: code blocks round once, at the container, with smooth corners. Below
// 768px Vocs bleeds code to the viewport edge, so the container stays square.
global({
  '@layer vocs_utilities': {
    '@media (width >= 768px)': {
      '[data-v-code-container]': {
        '--corner-radius': tokens.radius.lg,
        borderRadius: tokens.radius.lg,
        overflow: 'clip',
      },
      '[data-v-code-container] :is([data-v-code-header], pre[data-v])': {
        borderRadius: tokens.radius.none,
      },
    },
  },
})

// G3: raster images in docs content take a radius sized to content images.
// Inline SVG diagrams, logos and icons keep their own geometry.
global({
  '@layer vocs_utilities': {
    'article[data-v-content] img[data-v]:not([src$=".svg"])': {
      '--corner-radius': tokens.radius.lg,
      borderRadius: tokens.radius.lg,
    },
  },
})

// G4: a panel whose fill differs from the page has no border; one that matches
// the page keeps the hairline. Code, prompts and inline code sit on the block
// fill in both themes, so their Vocs borders go.
global({
  '@layer vocs_utilities': {
    '[data-v-code-container] :is([data-v-code-header], [data-v-code-group-list], pre[data-v])': {
      borderWidth: tokens.borderWidth.none,
      backgroundColor: tokens.color.block,
    },
    '[data-v-prompt]': {
      borderWidth: tokens.borderWidth.none,
      backgroundColor: tokens.color.block,
    },
    // Code header tabs sit 4 inside the 12px block, so they take radius 8 (12 - 4): 32
    // high, 14/20, secondary; the current tab is the container/regular chip.
    '[data-v-code-group-list]': {
      gap: tokens.spacing['1'],
      paddingInline: tokens.spacing['1'],
    },
    '[data-v-code-group-tab]': {
      height: '32px',
      marginBottom: tokens.spacing['0'],
      paddingInline: tokens.spacing['3'],
      borderBottomWidth: tokens.borderWidth.none,
      borderRadius: tokens.radius.md,
      '--corner-radius': tokens.radius.md,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.normal,
      lineHeight: tokens.lineHeight.control,
    },
    '[data-v-code-group-tab]:hover': {
      backgroundColor: tokens.color.containerSubtle,
      color: tokens.color.foreground,
    },
    '[data-v-code-group-tab][data-active]': {
      backgroundColor: tokens.color.container,
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.medium,
    },
    '[data-v-code-title]': {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.normal,
      lineHeight: tokens.lineHeight.control,
    },
    // Table headers 12/16; kbd 4.
    'div[data-v-table-wrapper] th': {
      fontSize: tokens.fontSize.xs,
      lineHeight: tokens.lineHeight.caption,
    },
    'article[data-v-content] kbd': {
      borderRadius: tokens.radius.sm,
      '--corner-radius': tokens.radius.sm,
      fontSize: tokens.fontSize.xs,
      lineHeight: tokens.lineHeight.caption,
    },
    // The API reference overview pane sits on its own fill.
    '[data-v-openapi-overview]': {
      borderWidth: tokens.borderWidth.none,
      '--corner-radius': tokens.radius.lg,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.panel,
    },
    ':not(pre) > code[data-v]:not(.twoslash-popup-code)': {
      borderWidth: tokens.borderWidth.none,
    },
  },
})

// G9: body sections are separated by space, not rules. Vocs marks its H2 rule
// and margin !important in vocs_components, so the override sits in an earlier
// layer. Table row rules, H9's top rules and the page-end footer keep theirs.
global({
  '@layer base': {
    ':is(article[data-v-content], [data-v-openapi-intro], [data-v-openapi-guide]) > :not(:is(hgroup[data-v], h1[data-v])) + h2:not(:only-child)':
      {
        // design-exception: Vocs sets this margin !important; system-v2 puts 48 above an H2.
        marginTop: '48px !custom !important',
      },
    'article[data-v-content] > :not(:is(h1, h2))[data-v] + h3[data-v]': {
      // design-exception: Vocs pulls prose siblings up 8px with !important; system-v2 puts 32 above an H3.
      marginTop: '32px !custom !important',
    },
    'article[data-v-content] > :not(:is(h1, h2, h3))[data-v] + h4[data-v]': {
      // design-exception: Vocs pulls prose siblings up 8px with !important; system-v2 puts 24 above an H4.
      marginTop: '24px !custom !important',
    },
    'article[data-v-content] > :is(h3, h4)[data-v] + :is(p, ul, ol)[data-v]': {
      // design-exception: Vocs pulls prose siblings up 8px with !important; the heading's own margin sets the gap.
      marginTop: '0px !custom !important',
    },
  },
  '@layer vocs_utilities': {
    ':is(article[data-v-content], [data-v-openapi-intro], [data-v-openapi-guide]) > :not(:is(hgroup[data-v], h1[data-v])) + h2:not(:only-child)':
      {
        paddingTop: tokens.spacing['0'],
        borderTopWidth: tokens.borderWidth.none,
      },
    'article[data-v-content] hr[data-v]': {
      borderTopWidth: tokens.borderWidth.none,
      marginBlock: tokens.spacing.section,
    },
    // API reference pages: the header rule and the rules between operations.
    '[data-v-openapi-header], :is([data-v-openapi-intro], [data-v-openapi-guide]) > h1[data-v]': {
      borderBottomWidth: tokens.borderWidth.none,
    },
    '[data-v-openapi-operation][data-separator]': {
      marginTop: tokens.spacing.section,
      paddingTop: tokens.spacing['0'],
      borderTopWidth: tokens.borderWidth.none,
    },
    // Page end: 64 above one row with "Was this helpful?" on the left and "Edit this
    // page" on the right; 16 to the divider; 24 to the Previous / Next pager. Vocs
    // renders feedback here only below 1376px (the rail has it above) and adds a
    // Last updated line and a second Copy for AI, which the page header replaces.
    'article[data-v-content] > [data-v-content-footer]': {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      alignItems: 'center',
      columnGap: tokens.spacing['4'],
      rowGap: tokens.spacing['4'],
      marginTop: tokens.spacing['16'],
    },
    '[data-v-content-footer] > *': {
      gridColumn: '1 / -1',
      marginBlock: tokens.spacing['0'],
    },
    '[data-v-content-footer] > :first-child': {
      display: 'block',
      gridColumn: 1,
      gridRow: 1,
    },
    '[data-v-content-footer] > :nth-child(2)': {
      gridColumn: 2,
      gridRow: 1,
      flexDirection: 'row',
    },
    '[data-v-content-footer] > :first-child:empty, [data-v-content-footer] > :nth-child(2):empty': {
      display: 'none',
    },
    '[data-layout]:has(.docs-page-actions) [data-v-content-footer] > :nth-child(3), [data-v-last-updated]':
      {
        display: 'none',
      },
    '[data-v-content-footer] > :last-child': {
      paddingTop: tokens.spacing['6'],
      borderTopColor: tokens.color.hairline,
    },
    '[data-v-content-footer] div[data-v-feedback]': {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
    },
    '[data-v-content-footer] div[data-v-feedback] > p': {
      color: tokens.color.muted,
      fontWeight: tokens.fontWeight.normal,
    },
    '[data-v-content-footer] div[data-v-feedback] > div': {
      gap: tokens.spacing['2'],
    },
    '[data-v-content-footer] div[data-v-feedback] button': {
      borderRadius: tokens.radius.md,
      '--corner-radius': tokens.radius.md,
      color: tokens.color.muted,
    },
    '[data-v-content-footer] form[data-v-feedback]': {
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
    },
    // Edit this page: a tertiary button with a pencil.
    '[data-v-edit-link]': {
      gap: tokens.spacing['2'],
      height: '32px',
      paddingInline: tokens.spacing['2'],
      borderRadius: tokens.radius.md,
      '--corner-radius': tokens.radius.md,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
      textDecoration: 'none',
    },
    '@media (hover: hover)': {
      ':is([data-v-content-footer] div[data-v-feedback] button, [data-v-edit-link]):hover': {
        backgroundColor: tokens.color.containerSubtle,
        color: tokens.color.foreground,
      },
      '[data-v-pagination] > a:hover': {
        backgroundColor: tokens.color.containerSubtle,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
    // Previous and Next are surface cards: radius 12, padding 16 20, title 16, label 12.
    '[data-v-pagination]': {
      gap: tokens.spacing['4'],
    },
    '[data-v-pagination] > a': {
      flexGrow: 1,
      flexBasis: 0,
      gap: tokens.spacing['1'],
      paddingBlock: tokens.spacing['4'],
      paddingInline: tokens.spacing['5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.hairline,
      borderRadius: tokens.radius.lg,
      '--corner-radius': tokens.radius.lg,
      backgroundColor: tokens.color.background,
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '[data-v-pagination] > a > span': {
      transitionProperty: 'none',
    },
    // Vocs puts the page title first and the Previous / Next label second.
    '[data-v-pagination] > a > span:first-child, [data-v-pagination] > a:hover > span:first-child':
      {
        color: tokens.color.foreground,
        fontSize: tokens.fontSize.body,
        fontWeight: tokens.fontWeight.medium,
        lineHeight: tokens.lineHeight.body,
      },
    '[data-v-pagination] > a > span:last-child': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      lineHeight: tokens.lineHeight.caption,
    },
  },
})

// G10: tables span exactly the content width (Vocs pulls them 12px past each
// edge) and scroll inside their own wrapper when they are wider. Below 768px
// Vocs bleeds them to the viewport edge, which stays.
global({
  '@layer vocs_utilities': {
    '@media (width >= 768px)': {
      'div[data-v-table-wrapper]': {
        marginInline: tokens.spacing['0'],
        '--corner-radius': tokens.radius.lg,
        borderRadius: tokens.radius.lg,
      },
    },
  },
})

// G11: callouts follow the TDS Platform Alert in four quiet tones: neutral (note,
// info), tip, warning and negative (danger), plus positive for success. Each has a
// subtle tinted fill, no border and a leading icon in its tone; text stays primary.
global({
  '@layer utilities': {
    'aside[data-v][data-v-callout]': {
      '--tempo-alert-tone': 'var(--foreground-secondary)',
      position: 'relative',
      marginInline: tokens.spacing['0'],
      padding: tokens.spacing['4'],
      borderWidth: tokens.borderWidth.none,
      '--corner-radius': tokens.radius.lg,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.containerSubtle,
      color: inherited.color.vocsTextColorPrimary,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
    },
    'aside[data-v][data-v-callout] :is(p, li, a, code)[data-v], aside[data-v][data-v-callout] li::marker':
      {
        color: inherited.color.vocsTextColorPrimary,
      },
    // TDS B2 lines (14/20) inside callouts, so the icon centers on the first line.
    'aside[data-v][data-v-callout] :is(p, li)[data-v]': {
      lineHeight: tokens.lineHeight.control,
    },
    'aside[data-v][data-v-callout][data-v-context="tip"]': {
      '--tempo-alert-tone': 'var(--info)',
      backgroundColor: tokens.color.infoContainer,
    },
    'aside[data-v][data-v-callout][data-v-context="warning"]': {
      '--tempo-alert-tone': 'var(--warning)',
      backgroundColor: tokens.color.warningContainer,
    },
    'aside[data-v][data-v-callout][data-v-context="danger"]': {
      '--tempo-alert-tone': 'var(--negative)',
      backgroundColor: tokens.color.negativeContainer,
    },
    'aside[data-v][data-v-callout][data-v-context="success"]': {
      '--tempo-alert-tone': 'var(--positive)',
      backgroundColor: tokens.color.positiveContainer,
    },
    'aside[data-v][data-v-callout] > [data-v-callout-icon]': {
      position: 'absolute',
      // Centres the 16px icon on the 20px first line inside the 16px inset.
      insetBlockStart: '18px',
      insetInlineStart: '16px',
      width: '16px',
      height: '16px',
      marginTop: tokens.spacing['0'],
      // design-exception: The tone is set per context above from the status tokens.
      color: 'var(--tempo-alert-tone) !custom',
    },
    'aside[data-v][data-v-callout] > [data-v-callout-icon] > svg': {
      display: 'block',
      width: '16px',
      height: '16px',
    },
    'aside[data-v][data-v-callout][data-v-content] > :not(:is([data-v-callout-icon], [data-v-code-container]))':
      {
        paddingInlineStart: tokens.spacing['7'],
      },
  },
})

// G8: Vocs-owned buttons follow the same rule: gray secondary fill, no outline,
// smoothed md radius (OpenAPI code-panel actions, the 404 link). G4: the 404
// icon circle keeps a hairline only where its fill matches the page.
// The 404 markup carries Vocs utility classes (vocs:bg-surface vocs:border) in
// this same layer, so its selectors are scoped under [data-v-not-found] to win
// on specificity.
global({
  '@layer vocs_utilities': {
    '[data-v-openapi-action], [data-v-not-found] > [data-v-not-found-link]': {
      borderWidth: tokens.borderWidth.none,
      '--corner-radius': tokens.radius.md,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.container,
      transitionProperty: 'background-color',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '[data-v-openapi-action]:not(:disabled):hover, [data-v-not-found] > [data-v-not-found-link]:hover':
      {
        backgroundColor: tokens.color.containerStrong,
        transitionDuration: 'var(--tempo-enter)',
      },
    '[data-v-not-found] > [data-v-not-found-icon]': {
      borderColor: tokens.color.cardLine,
    },
  },
})

// Body text takes TDS Platform B1's size and tracking (16px, 0.12px) in docs
// articles. B1's 22px line height is set for UI text; long-form prose keeps a
// 26px leading. Card descriptions keep their own 14px size, and callouts keep
// B2 (utilities layer above). Home keeps its own scale.
global({
  '@layer vocs_utilities': {
    'article[data-v-content] :is(p, li)[data-v]:not(a *)': {
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.relaxed,
      letterSpacing: tokens.letterSpacing.b1,
    },
  },
})

// Prose keeps a readable measure of about 72 characters; code blocks, tables,
// callouts and cards still use the full content column.
global({
  '@layer utilities': {
    ':is(article[data-v-content]:not(:has(.tempo-docs-home)), [data-v-openapi-intro], [data-v-openapi-guide]) > :is(p, ul, ol, dl, blockquote, hgroup)[data-v]':
      {
        maxWidth: '720px',
      },
  },
})

// The site footer is a band under the article. It starts at the sidebar's edge,
// runs under the right rail to the page edge, and keeps its columns in line with
// the article. Above 1376px it rises over the fixed outline rail as it scrolls in.
global({
  // Vocs caps API landing and guide footers at the content width with !important.
  '@layer base': {
    '[data-v-main] > [data-v-footer]': {
      maxWidth: 'none !important',
    },
  },
  '@layer utilities': {
    '[data-v-main]:has(> [data-v-footer])': {
      paddingBottom: tokens.spacing['0'],
    },
    '[data-v-main] > [data-v-footer]': {
      width: 'auto',
      maxWidth: 'none',
      // The article's bottom padding sets the gap; the footer brings its own hairline.
      marginTop: tokens.spacing['0'],
      paddingInline: tokens.spacing['0'],
      paddingBottom: tokens.spacing['0'],
    },
    '@media (width >= 1376px)': {
      '[data-v-main] > [data-v-footer]': {
        position: 'relative',
        zIndex: tokens.zIndex.overlay,
      },
      '[data-layout][data-v-sidebar]:not(:has(.tempo-docs-home)):not([data-v-content-width="full"]:has([data-v-openapi]:not([data-v-openapi-landing]))) > [data-v-main] > [data-v-footer]':
        {
          // design-exception: Extend the band under the outline rail that the main column pads for.
          marginInlineEnd: 'calc(var(--tempo-docs-outline-width) * -1) !custom',
        },
      '[data-layout][data-v-sidebar]:not(:has(.tempo-docs-home)):not([data-v-content-width="full"]:has([data-v-openapi]:not([data-v-openapi-landing]))) > [data-v-main] > [data-v-footer] > .docs-site-footer':
        {
          // design-exception: Keep the footer columns clear of the outline rail.
          paddingInlineEnd: 'var(--tempo-docs-outline-width) !custom',
        },
    },
  },
})
