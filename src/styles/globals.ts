import { inherited } from './inherited'
import { vars as tokens } from './theme'
import './tokens'
import './smoothCorners'
import './links'
import './headingAnchors'
import './copyFeedback'
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
      '--tempo-docs-primary-nav-height': '65px',
      '--tempo-docs-section-nav-height': '44px',
      '--tempo-docs-shell-width': '100%',
      '--tempo-docs-sidebar-width': '256px',
      '--tempo-hub-width': '1168px',
      '--tempo-font-display': 'var(--font-pilat-book)',
      '--tempo-font-body': 'var(--font-pilat-book)',
      '--vocs-spacing-topNav':
        'calc( var(--tempo-docs-primary-nav-height) + var(--tempo-docs-section-nav-height) )',
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

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout]': {
      '--tempo-callout-accent': 'var(--vocs-text-color-muted)',
      backgroundColor: inherited.color.colorMixInSrgbTempoCalloutAccent10VocsBackgroundColorSurface,

      borderColor: inherited.color.colorMixInSrgbTempoCalloutAccent28Transparent,

      color: inherited.color.vocsTextColorPrimary,
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout][data-v-context="info"]': {
      '--tempo-callout-accent': 'var(--info)',
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout][data-v-context="tip"]': {
      '--tempo-callout-accent': 'var(--vocs-color-iris)',
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout][data-v-context="warning"]': {
      '--tempo-callout-accent': 'var(--warning)',
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout][data-v-context="danger"]': {
      '--tempo-callout-accent': 'var(--negative)',
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout][data-v-context="success"]': {
      '--tempo-callout-accent': 'var(--positive)',
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout] p[data-v], aside[data-v][data-v-callout] li[data-v], aside[data-v][data-v-callout] a[data-v], aside[data-v][data-v-callout] code[data-v]':
      {
        color: inherited.color.vocsTextColorPrimary,
      },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout] li::marker': {
      color: inherited.color.vocsTextColorPrimary,
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout] > [data-v-callout-icon]': {
      color: inherited.color.tempoCalloutAccent,
    },
  },
})

global({
  '@layer utilities': {
    '[data-docs-sidebar-toggle]': {
      display: 'inline-flex',
    },
    '[data-docs-sidebar-toggle]:not([data-docs-sidebar-fallback])': {
      marginInlineEnd: tokens.spacing['2'],
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1080px)': {
      '[data-docs-sidebar-toggle]': {
        display: 'none',
      },
    },
  },
})

global({
  '@layer utilities': {
    '[data-docs-sidebar-fallback]': {
      position: 'sticky',
      zIndex: tokens.zIndex.raised,
      top: 'calc(var(--vocs-spacing-topNav) + var(--vocs-spacing-banner))',
      display: 'flex',
      alignItems: 'center',
      height: '48px',
      // design-exception: Preserve the inherited component/framework scope at the point of use.
      paddingInline: 'var(--vocs-spacing-content-px) !custom',
      borderBottomWidth: tokens.borderWidth.hairline,
      borderBottomStyle: 'solid',
      borderBottomColor: inherited.color.vocsBorderColorPrimary,
      backgroundColor: inherited.color.vocsBackgroundColorPrimary,
      fontSize: tokens.fontSize.compact,
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1080px)': {
      '[data-docs-sidebar-fallback]': {
        display: 'none',
      },
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
      '[data-v-sidebar] [data-v-content], [data-v-sidebar] [data-v-footer]': {
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
    '[data-v-sidebar] > [data-v-sidebar-section] + [data-v-sidebar-section]': {
      borderTopWidth: tokens.borderWidth.hairline,
      borderTopStyle: 'solid',
      borderTopColor: inherited.color.colorMixInSrgbForeground12Transparent,
      paddingTop: tokens.spacing['6'],
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] > [data-v-sidebar-section] > [data-v-sidebar-section-header]': {
      height: 'auto',
      minHeight: 0,
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      margin: '0 -8px 12px !custom',

      paddingBlock: tokens.spacing['0'],
      paddingInline: tokens.spacing['2'],
      backgroundColor: 'transparent !custom',

      color: inherited.color.colorMixInSrgbForeground78Transparent,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.semibold,

      letterSpacing: tokens.letterSpacing.wider,
      lineHeight: tokens.lineHeight.normal,
      textTransform: 'uppercase',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header]': {
      minHeight: '34px',
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      margin: '0 -8px !custom',

      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['2'],
      borderRadius: tokens.radius.sm,
      backgroundColor: 'transparent !custom',

      color: inherited.color.colorMixInSrgbForeground72Transparent,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.normal,
      lineHeight: tokens.lineHeight.normal,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header]:not([data-collapsable="true"])':
      {
        minHeight: '26px',
        // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
        margin: '6px -8px 1px !custom',

        color: inherited.color.colorMixInSrgbForeground65Transparent,
        fontSize: tokens.fontSize.compact,
        fontWeight: tokens.fontWeight.normal,
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable="true"]':
      {
        color: inherited.color.colorMixInSrgbForeground68Transparent,
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable="true"]:hover':
      {
        backgroundColor: inherited.color.colorMixInSrgbForeground4Transparent,
        color: tokens.color.foreground,
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content]': {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-content]': {
      marginTop: tokens.spacing['0_5'],
      marginBottom: tokens.spacing['0_5'],

      borderLeftColor: inherited.color.colorMixInSrgbForeground10Transparent,
      gap: 0,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-item][data-link]': {
      minHeight: '34px',
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      margin: '0 -8px !custom',

      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['2'],
      borderRadius: tokens.radius.sm,

      color: inherited.color.colorMixInSrgbForeground72Transparent,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.normal,
      lineHeight: tokens.lineHeight.normal,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] a[data-v-sidebar-item][data-link]:hover': {
      backgroundColor: inherited.color.colorMixInSrgbForeground4Transparent,
      color: tokens.color.foreground,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] a[data-v-sidebar-item][data-active]': {
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.medium,
      boxShadow: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] a[data-v-sidebar-item][data-active]:hover': {
      backgroundColor: inherited.color.colorMixInSrgbForeground10Transparent,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-item][data-condensed="true"]': {
      minHeight: '28px',
      fontSize: tokens.fontSize.compact,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-header] svg': {
      color: inherited.color.colorMixInSrgbForeground38Transparent,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-footer-content] [data-v-socials] a[aria-label="GitHub"] svg': {
      width: '19px',
      height: '19px',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-footer-content] [data-v-socials] a[aria-label="X (Twitter)"] svg': {
      width: '16px',
      height: '16px',
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

global({
  '@layer utilities': {
    '@media (width < 1376px)': {
      '[data-v-ask-ai-container]': {
        display: 'none',
      },
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-v-ask-ai-container]': {
        position: 'fixed',
        top: 'auto',
        bottom: '24px',
        left: 'auto',
        right: 'max(24px, calc((100% - var(--tempo-docs-shell-width)) * 0.5 + 24px))',
        width: 'calc(var(--tempo-docs-outline-width) - 48px)',
        translate: 0,
        transform: 'none',
      },
    },
  },
})

global({
  '@layer vocs_utilities': {
    '@media (width >= 1376px)': {
      '[data-v-ask-ai-container] > button': {
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
      },
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

/* Blog diagram (inlined SVG) palette — kept identical to the original
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
    '--vocs-background-color-code-highlighted': 'var(--surface-panel)',
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
  'html:has(.docs-section-nav), body:has(.docs-section-nav)': {
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
 * Blog prose — markdown bodies rendered on /blog/[slug].
 * --------------------------------------------------------------------------- */

/* Diagrams are inlined as SVG at build time (see blogPlugin) so they can
   follow the active theme. Text uses currentColor; shapes use diagram tokens. */

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram': {
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
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram :is(text, tspan)': {
    WebkitUserSelect: 'text',
    userSelect: 'text',
    cursor: 'text',
  },
})

/* SVG glyph fills stay unchanged during selection in Chromium. */

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram :is(text, tspan)::selection': {
    backgroundColor: inherited.color.diagramSelectionBg,
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram [fill="var(--on-surface-onyx)"]': {
    '--diagram-selection-bg': '#234b75',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram [fill="var(--diagram-box)"]': {
    '--diagram-selection-bg': 'var(--diagram-inverse-selection-bg)',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-bg': {
    fill: inherited.color.diagramBg,
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-box': {
    fill: inherited.color.diagramBox,

    stroke: inherited.color.diagramBoxBorder,
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-accent-box': {
    fill: inherited.color.diagramAccentBg,

    stroke: inherited.color.diagramAccent,
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-line': {
    stroke: inherited.color.diagramLine,
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-line-soft': {
    stroke: inherited.color.diagramLineSoft,
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-accent-line': {
    stroke: inherited.color.diagramAccent,
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-accent': {
    fill: inherited.color.diagramAccent,
  },
})

/* An italic-only paragraph right after an image/diagram is a caption. */

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
    'article[data-v-content] :is(h1, h2, h3)[data-v]': {
      fontFamily: inherited.fontFamily.tempoFontDisplay,
      fontWeight: tokens.fontWeight.medium,

      letterSpacing: tokens.letterSpacing.heading,
      textWrap: 'balance',
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] > h1[data-v]': {
      maxWidth: '24ch',
      border: 0,
      paddingBottom: 0,
      // design-exception: Preserve this responsive geometry across viewport sizes.
      fontSize: 'clamp(32px, 3vw, 42px) !custom',
      letterSpacing: tokens.letterSpacing.display,

      lineHeight: tokens.lineHeight.display,
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] > h1[data-v] + p[data-v]': {
      color: inherited.color.colorMixInSrgbForeground68Transparent,

      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.prose,
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

global({
  '@layer utilities': {
    'article[data-v-content] aside[data-v-callout]': {
      borderRadius: tokens.radius.md,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-outline-indicator]': {
      backgroundColor: tokens.color.foreground,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-outline-item] a[data-active="true"]': {
      color: tokens.color.foreground,
    },
  },
})

global({
  '@layer utilities': {
    'body:has(.docs-section-nav) :is(a, button, input, summary):focus-visible': {
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
    '[data-layout]:has(.tempo-docs-home) [data-v-gutter-left], [data-layout]:has(.tempo-docs-home) [data-v-gutter-right], [data-layout]:has(.tempo-docs-home) [data-v-outline-mobile], [data-layout]:has(.tempo-docs-home) [data-v-outline], [data-layout]:has(.tempo-docs-home) [data-v-content-footer], [data-layout]:has(.tempo-docs-home) [data-v-footer]':
      {
        display: 'none',
      },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content]:has(.tempo-docs-home)': {
      maxWidth: 'calc(var(--tempo-hub-width) + 96px)',
      marginInline: 'auto !custom',
      // design-exception: Preserve this responsive geometry across viewport sizes.
      padding: 'clamp(24px, 4vw, 48px) !custom',
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
    // Vocs pulls the active tab's underline over the header border it no longer has;
    // keep it inside the tab list, which clips vertically.
    '[data-v-code-group-tab]': {
      marginBottom: tokens.spacing['0'],
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
