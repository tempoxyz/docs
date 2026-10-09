import './tokens'
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

fontFace({
  fontFamily: '"JetBrains Mono"',
  src: 'url("/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2") format("woff2")',
  fontWeight: 400,
  fontStyle: 'normal',
  fontDisplay: 'swap',
})

fontFace({
  fontFamily: '"JetBrains Mono"',
  src: 'url("/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2") format("woff2")',
  fontWeight: 500,
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
      background: 'var(--vocs-background-color-primary)',
      color: 'var(--vocs-text-color-primary)',
      fontFamily: 'var(--font-pilat-book), ui-sans-serif, system-ui, sans-serif',
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
        paddingTop: 'var(--vocs-spacing-topNav)',
        justifyContent: 'flex-start',
        background: 'var(--vocs-background-color-primary)',
        borderRight: '1px solid var(--vocs-border-color-primary)',
        borderLeft: 0,
      },
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-container], [data-v-sidebar-footer-content], [data-v-mobile-nav]': {
      background: 'var(--vocs-background-color-primary)',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar-container]': {
      paddingTop: '24px',
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
      marginTop: '12px',
      marginRight: 'calc(var(--vocs-spacing-sidebar-px) * -1)',
      marginLeft: 'calc(var(--vocs-spacing-sidebar-px) * -1)',
      paddingTop: '14px',
      paddingRight: 'var(--vocs-spacing-sidebar-px)',
      paddingLeft: 'var(--vocs-spacing-sidebar-px)',
      borderTop: '1px solid var(--vocs-border-color-primary)',
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout]': {
      '--tempo-callout-accent': 'var(--vocs-text-color-muted)',
      background:
        'color-mix( in srgb, var(--tempo-callout-accent) 10%, var(--vocs-background-color-surface) )',
      borderColor: 'color-mix(in srgb, var(--tempo-callout-accent) 28%, transparent)',
      color: 'var(--vocs-text-color-primary)',
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
        color: 'var(--vocs-text-color-primary)',
      },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout] li::marker': {
      color: 'var(--vocs-text-color-primary)',
    },
  },
})

global({
  '@layer utilities': {
    'aside[data-v][data-v-callout] > [data-v-callout-icon]': {
      color: 'var(--tempo-callout-accent)',
    },
  },
})

global({
  '@layer utilities': {
    '[data-docs-sidebar-toggle]': {
      display: 'inline-flex',
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
      zIndex: 10,
      top: 'calc(var(--vocs-spacing-topNav) + var(--vocs-spacing-banner))',
      display: 'flex',
      alignItems: 'center',
      height: '48px',
      paddingInline: 'var(--vocs-spacing-content-px)',
      borderBottom: '1px solid var(--vocs-border-color-primary)',
      background: 'var(--vocs-background-color-primary)',
      fontSize: '13px',
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
        marginLeft:
          'calc( max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5)) + var(--tempo-docs-sidebar-width) )',
        background: 'var(--vocs-background-color-primary)',
        borderRight: '1px solid var(--vocs-border-color-primary)',
        minHeight: '100dvh',
      },
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-layout][data-v-sidebar] > [data-v-main]': {
        paddingRight: 'var(--tempo-docs-outline-width)',
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
        background: 'var(--vocs-background-color-primary)',
        borderRight: '1px solid var(--vocs-border-color-primary)',
      },
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-content], [data-v-sidebar] [data-v-footer]': {
      background: 'transparent',
    },
  },
})

global({
  '@layer utilities': {
    '@media (width >= 1376px)': {
      '[data-v-sidebar] [data-v-content], [data-v-sidebar] [data-v-footer]': {
        marginLeft: 'auto',
        marginRight: 'auto',
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
      gap: '24px',
      fontFamily: 'var(--font-pilat-book), ui-sans-serif, system-ui, sans-serif',
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
      borderTop: '1px solid color-mix(in srgb, var(--foreground) 12%, transparent)',
      paddingTop: '24px',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] > [data-v-sidebar-section] > [data-v-sidebar-section-header]': {
      height: 'auto',
      minHeight: 0,
      margin: '0 -8px 12px',
      padding: '0 8px',
      background: 'transparent',
      color: 'color-mix(in srgb, var(--foreground) 78%, transparent)',
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.055em',
      lineHeight: 1.5,
      textTransform: 'uppercase',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header]': {
      minHeight: '34px',
      margin: '0 -8px',
      padding: '6px 8px',
      borderRadius: '4px',
      background: 'transparent',
      color: 'color-mix(in srgb, var(--foreground) 72%, transparent)',
      fontSize: '14px',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.5,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header]:not([data-collapsable="true"])':
      {
        minHeight: '26px',
        margin: '6px -8px 1px',
        color: 'color-mix(in srgb, var(--foreground) 65%, transparent)',
        fontSize: '13px',
        fontWeight: 400,
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable="true"]':
      {
        color: 'color-mix(in srgb, var(--foreground) 68%, transparent)',
      },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-content] [data-v-sidebar-section-header][data-collapsable="true"]:hover':
      {
        background: 'color-mix(in srgb, var(--foreground) 4%, transparent)',
        color: 'var(--foreground)',
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
      marginTop: '2px',
      marginBottom: '2px',
      borderLeftColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
      gap: 0,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-item][data-link]': {
      minHeight: '34px',
      margin: '0 -8px',
      padding: '6px 8px',
      borderRadius: '4px',
      color: 'color-mix(in srgb, var(--foreground) 72%, transparent)',
      fontSize: '14px',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.5,
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] a[data-v-sidebar-item][data-link]:hover': {
      background: 'color-mix(in srgb, var(--foreground) 4%, transparent)',
      color: 'var(--foreground)',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] a[data-v-sidebar-item][data-active]': {
      background: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
      color: 'var(--foreground)',
      fontWeight: 500,
      boxShadow: 'none',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] a[data-v-sidebar-item][data-active]:hover': {
      background: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-item][data-condensed="true"]': {
      minHeight: '28px',
      fontSize: '13px',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-sidebar] [data-v-sidebar-section-header] svg': {
      color: 'color-mix(in srgb, var(--foreground) 38%, transparent)',
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

global({
  ':root': {
    colorScheme: 'dark',
    '--font-hbset': '"HBSet"',
    '--font-pilat-book': '"Pilat", ui-sans-serif, system-ui, sans-serif',
    '--font-jetbrains-mono': '"JetBrains Mono"',
    '--vocs-font-family': 'var(--font-pilat-book)',
    '--vocs-font-family-mono': 'var(--font-jetbrains-mono), ui-monospace, monospace',
    '--color-background': '#111111',
    '--color-foreground': 'oklch(94.66% 0 0)',
    '--color-foreground-secondary': 'oklch(70.8% 0 0)',
    '--color-foreground-secondary-hover': 'oklch(94.66% 0 0)',
    '--color-negative': 'oklch(71.38% 0.2147 23.49)',
    '--color-info': 'oklch(71.7% 0.1648 250.79)',
    '--color-positive': 'oklch(81.51% 0.2258 148.1)',
    '--color-warning': 'oklch(77.21% 0.1991 64.28)',
    '--color-on-accent': '#ffffff',
    '--color-on-negative': '#ffffff',
    '--color-on-surface-onyx': 'oklch(94.66% 0 0)',
    '--color-surface-block': '#0e0e0e',
    '--color-surface-block-muted': '#121212',
    '--color-surface-card': '#131313',
    '--color-surface-card-elev': '#141414',
    '--color-surface-input': '#222222',
    '--color-surface-onyx': '#000000',
    '--color-surface-deep': '#050505',
    '--color-surface-skeleton': '#292929',
    '--color-surface-panel': '#181818',
    '--color-surface-page': '#0a0a0a',
    '--color-surface-shell': '#0c0c0c',
    '--color-line': '#181818',
    '--color-line-strong': '#2e2e2e',
    '--color-line-dashed': '#888888',
    '--color-accent-blue': '#5d88ff',
    '--color-indicator-green': '#57b88a',
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
    '--color-background': '#ffffff',
    '--color-foreground': '#000000',
    '--color-foreground-secondary': '#737373',
    '--color-foreground-secondary-hover': '#111111',
    '--color-on-accent': '#ffffff',
    '--color-on-negative': '#ffffff',
    '--color-on-surface-onyx': '#ffffff',
    '--color-surface-block': '#f5f5f5',
    '--color-surface-block-muted': '#f7f7f7',
    '--color-surface-card': '#ffffff',
    '--color-surface-card-elev': '#ffffff',
    '--color-surface-input': '#f5f5f5',
    '--color-surface-onyx': '#111111',
    '--color-surface-deep': '#f4f4f5',
    '--color-surface-skeleton': '#e5e5e5',
    '--color-surface-panel': '#f7f7f7',
    '--color-surface-page': '#ffffff',
    '--color-surface-shell': '#ffffff',
    '--color-line': '#e5e5e5',
    '--color-line-strong': '#d4d4d4',
    '--color-line-dashed': '#a3a3a3',
    '--color-accent-blue': '#3c66d8',
    '--color-indicator-green': '#168f24',
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
    background: 'var(--background)',
    color: 'var(--foreground)',
  },
})

global({
  'html:has(.docs-section-nav), body:has(.docs-section-nav)': {
    background: 'var(--surface-shell)',
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
    fontFamily: 'var(--font-pilat-book)',
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
    background: 'var(--selection-bg)',
    color: 'var(--selection-fg)',
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
    marginTop: '2px',
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
      backgroundColor: 'transparent',
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
    marginTop: '1.5em',
    border: '1px solid var(--line)',
    color: 'var(--foreground)',
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
    background: 'var(--diagram-selection-bg)',
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
    fill: 'var(--diagram-bg)',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-box': {
    fill: 'var(--diagram-box)',
    stroke: 'var(--diagram-box-border)',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-accent-box': {
    fill: 'var(--diagram-accent-bg)',
    stroke: 'var(--diagram-accent)',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-line': {
    stroke: 'var(--diagram-line)',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-line-soft': {
    stroke: 'var(--diagram-line-soft)',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-accent-line': {
    stroke: 'var(--diagram-accent)',
  },
})

global({
  ':is(.blog-prose, .docs-zone-diagram) svg.blog-diagram .dgm-accent': {
    fill: 'var(--diagram-accent)',
  },
})

/* An italic-only paragraph right after an image/diagram is a caption. */

/* A quiet navigation surface frames the denser developer reading workspace. */

global({
  '@layer utilities': {
    '[data-layout][data-v-sidebar] > [data-v-gutter-left], [data-v-sidebar-container], [data-v-sidebar-footer-content]':
      {
        background: 'var(--surface-shell)',
      },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content]': {
      fontSize: '16px',
      lineHeight: 1.7,
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] :is(h1, h2, h3)[data-v]': {
      fontFamily: 'var(--tempo-font-display)',
      fontWeight: 500,
      letterSpacing: '-0.025em',
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
      fontSize: 'clamp(32px, 3vw, 42px)',
      letterSpacing: '-0.04em',
      lineHeight: 1.14,
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] > h1[data-v] + p[data-v]': {
      color: 'color-mix(in srgb, var(--foreground) 68%, transparent)',
      fontSize: '17px',
      lineHeight: 1.7,
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
      borderRadius: '6px',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-outline-indicator]': {
      background: 'var(--foreground)',
    },
  },
})

global({
  '@layer utilities': {
    '[data-v-outline-item] a[data-active="true"]': {
      color: 'var(--foreground)',
    },
  },
})

global({
  '@layer utilities': {
    'body:has(.docs-section-nav) :is(a, button, input, summary):focus-visible': {
      outline: '2px solid var(--foreground)',
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
      marginInline: 'auto',
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
      marginInline: 'auto',
      padding: 'clamp(24px, 4vw, 48px)',
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] :is(p, li, td)[data-v] a[data-v]': {
      color: 'var(--accent-blue)',
      fontWeight: 400,
      textDecorationLine: 'underline',
      textDecorationStyle: 'solid',
      textDecorationColor: 'color-mix(in srgb, var(--accent-blue) 40%, transparent)',
      textDecorationThickness: '1px',
      textUnderlineOffset: '3px',
    },
  },
})

global({
  '@layer utilities': {
    'article[data-v-content] :is(p, li, td)[data-v] a[data-v]:is(:hover, :focus-visible)': {
      textDecorationColor: 'currentColor',
    },
  },
})

/* Formal specifications link back to their index above the page title. */

// Vocs owns the Mermaid wrapper markup.
global({ '.data-v-mermaid-container': { minHeight: '200px' } })
