import { style } from 'zyzz'
import {
  blockIn as blockInMotion,
  buildFill as buildFillMotion,
  diagramFlow as diagramFlowMotion,
  indicatorFlow as indicatorFlowMotion,
  laneFlow as laneFlowMotion,
  navActivePixel as navActivePixelMotion,
  settleFlash as settleFlashMotion,
  zoneBreathe as zoneBreatheMotion,
} from './motion'

export const docsSectionNav = style({
  '@layer utilities': {
    position: 'fixed',
    top: 'var(--tempo-docs-primary-nav-height)',
    right: 0,
    left: 0,
    zIndex: 50,
    '@media (width >= 1080px)': {
      right: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5))',
      left: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5))',
    },
  },
})

export const navActiveSquare = style({
  selectors: {
    '& > rect': {
      opacity: 0,
      transformBox: 'fill-box',
      transformOrigin: 'center',
      animation: `${navActivePixelMotion} 460ms steps(3, end) both`,
    },
    '& > rect:nth-child(1)': {
      animationDelay: '0ms',
    },
    '& > rect:nth-child(5)': {
      animationDelay: '45ms',
    },
    '& > rect:nth-child(9)': {
      animationDelay: '90ms',
    },
    '& > rect:nth-child(3)': {
      animationDelay: '135ms',
    },
    '& > rect:nth-child(7)': {
      animationDelay: '180ms',
    },
    '& > rect:nth-child(2)': {
      animationDelay: '225ms',
    },
    '& > rect:nth-child(4)': {
      animationDelay: '270ms',
    },
    '& > rect:nth-child(6)': {
      animationDelay: '315ms',
    },
    '& > rect:nth-child(8)': {
      animationDelay: '360ms',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& > rect': {
        animation: 'none',
        opacity: 1,
      },
    },
  },
})

export const edgeMarker = style({
  backgroundColor: 'var(--line-dashed)',
})

export const repoBrandSquareNeutral = style({
  backgroundColor: 'var(--foreground)',
})

export const showcaseVisualFrame = style({
  boxShadow: 'none',
})

export const showcaseVisualCard = style({
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-card)',
  boxShadow: 'none',
})

export const showcaseVisualPanel = style({
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-panel)',
  color: 'var(--foreground)',
})

export const themePreserveDark = style({
  colorScheme: 'dark',
  '--color-background': '#111111',
  '--color-foreground': 'oklch(94.66% 0 0)',
  '--color-foreground-secondary': 'oklch(70.8% 0 0)',
  '--color-foreground-secondary-hover': 'oklch(94.66% 0 0)',
  '--color-on-accent': '#ffffff',
  '--color-surface-block': '#0e0e0e',
  '--color-surface-card': '#131313',
  '--color-surface-card-elev': '#141414',
  '--color-surface-input': '#222222',
  '--color-surface-onyx': '#000000',
  '--color-surface-panel': '#181818',
  '--color-line': '#181818',
  '--color-line-strong': '#2e2e2e',
  '--background': 'var(--color-background)',
  '--foreground': 'var(--color-foreground)',
  '--foreground-secondary': 'var(--color-foreground-secondary)',
  '--foreground-secondary-hover': 'var(--color-foreground-secondary-hover)',
  '--on-accent': 'var(--color-on-accent)',
  '--surface-block': 'var(--color-surface-block)',
  '--surface-card': 'var(--color-surface-card)',
  '--surface-card-elev': 'var(--color-surface-card-elev)',
  '--surface-input': 'var(--color-surface-input)',
  '--surface-onyx': 'var(--color-surface-onyx)',
  '--surface-panel': 'var(--color-surface-panel)',
  '--line': 'var(--color-line)',
  '--line-strong': 'var(--color-line-strong)',
  '--code-token-keyword': '#d487f3',
  '--code-token-function': '#5d88ff',
  '--code-token-string': '#58b88a',
  '--code-token-number': '#cde769',
  '--code-token-comment': 'rgb(255 255 255 / 0.3)',
  '--code-token-punctuation': 'rgb(255 255 255 / 0.45)',
})

export const featureDiagramMark = style({
  filter: 'var(--feature-diagram-mark-filter, url("#feature-diagram-glow"))',
})

export const heading64 = style({
  '@layer utilities': {
    fontSize: '64px',
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: 0,
  },
})

export const heading48 = style({
  '@layer utilities': {
    fontSize: '48px',
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: 0,
  },
})

export const heading40 = style({
  '@layer utilities': {
    fontSize: '40px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: 0,
  },
})

export const heading32 = style({
  '@layer utilities': {
    fontSize: '32px',
    fontWeight: 500,
    lineHeight: 1.25,
    letterSpacing: 0,
  },
})

export const heading24 = style({
  '@layer utilities': {
    fontSize: '24px',
    fontWeight: 500,
    lineHeight: 1.35,
    letterSpacing: 0,
  },
})

export const heading20 = style({
  '@layer utilities': {
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.01em',
  },
})

export const heading16 = style({
  '@layer utilities': {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
})

export const copy16 = style({
  '@layer utilities': {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
})

export const copy15 = style({
  '@layer utilities': {
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
})

export const copy14 = style({
  '@layer utilities': {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
})

export const copy13 = style({
  '@layer utilities': {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.55,
    letterSpacing: '0.01em',
  },
})

export const label16 = style({
  '@layer utilities': {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
})

export const label15 = style({
  '@layer utilities': {
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.45,
    letterSpacing: '0.01em',
  },
})

export const label14 = style({
  '@layer utilities': {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.45,
    letterSpacing: '0.01em',
  },
})

export const label13 = style({
  '@layer utilities': {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0.01em',
  },
})

export const label12 = style({
  '@layer utilities': {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: '0.01em',
  },
})

export const button16 = style({
  '@layer utilities': {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
})

export const button14 = style({
  '@layer utilities': {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.45,
    letterSpacing: '0.01em',
  },
})

export const button12 = style({
  '@layer utilities': {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1.35,
    letterSpacing: '0.01em',
  },
})

export const indicatorFlow = style({
  '@layer utilities': {
    backgroundImage:
      'linear-gradient( 135deg, var(--indicator-green-dark), var(--indicator-green), var(--indicator-green-dark) )',
    backgroundSize: '200% 200%',
    animation: `${indicatorFlowMotion} 4s ease-in-out infinite alternate`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})

export const featureDiagramHideSmallCaptions = style({
  selectors: {
    '& [data-small-caption]': {
      display: 'none',
    },
  },
})

export const laneFlow = style({
  animation: `${laneFlowMotion} 2.4s linear infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})

export const diagramFlow = style({
  strokeDasharray: '0.01 10',
  strokeDashoffset: 0,
  strokeLinecap: 'round',
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${diagramFlowMotion} 1.4s linear infinite`,
  },
})

export const zoneBreathe = style({
  animation: `${zoneBreatheMotion} 4s ease-in-out infinite alternate`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})

export const settledCell = style({
  backgroundColor: 'color-mix(in srgb, var(--indicator-green) 12%, var(--surface-shell))',
})

export const blockIn = style({
  animation: `${blockInMotion} 240ms ease-out`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})

export const buildFill = style({
  animation: `${buildFillMotion} var(--build-ms, 500ms) linear forwards`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})

export const settleFlash = style({
  animation: `${settleFlashMotion} 600ms ease-out`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})

export const codeScroll = style({
  scrollbarWidth: 'thin',
  scrollbarColor: 'var(--scrollbar-thumb) transparent',
  selectors: {
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--scrollbar-thumb)',
      borderRadius: '4px',
    },
  },
})

export const terminalTheme = style({
  '--term-bg1': 'light-dark(oklch(0.94 0 0), oklch(0.14 0 0))',
  '--term-bg2': 'light-dark(oklch(1 0 0), oklch(0.15 0 0))',
  '--term-gray1': 'light-dark(oklch(0.955 0 0), oklch(0.18 0 0))',
  '--term-gray2': 'light-dark(oklch(0.933 0 0), oklch(0.2 0 0))',
  '--term-gray3': 'light-dark(oklch(0.933 0 0), oklch(0.22 0 0))',
  '--term-gray4': 'light-dark(oklch(0.933 0 0), oklch(0.27 0 0))',
  '--term-gray5': 'light-dark(oklch(0.549 0 0), oklch(0.45 0 0))',
  '--term-gray6': 'light-dark(oklch(0.45 0 0), oklch(0.58 0 0))',
  '--term-gray10': 'light-dark(oklch(0.21 0 0), oklch(0.9 0 0))',
  '--term-blue9': 'light-dark(hsl(211 100% 42%), hsl(210 100% 70%))',
  '--term-amber9': 'light-dark(hsl(30 100% 32%), hsl(39 95% 58%))',
  '--term-green9': 'light-dark(hsl(133 50% 32%), hsl(131 50% 60%))',
  '--term-orange9': 'light-dark(hsl(25 95% 45%), hsl(25 95% 63%))',
  '--term-pink9': 'light-dark(hsl(336 65% 45%), hsl(341 90% 72%))',
})

export const blogProse = style({
  fontSize: '16px',
  lineHeight: 1.7,
  letterSpacing: '0.01em',
  color: 'var(--prose-body)',
  selectors: {
    '& h2': {
      color: 'var(--foreground)',
      letterSpacing: 0,
      marginTop: '2.5em',
      fontSize: '24px',
      lineHeight: 1.3,
    },
    '& h3': {
      color: 'var(--foreground)',
      letterSpacing: 0,
      marginTop: '2em',
      fontSize: '19px',
      lineHeight: 1.35,
    },
    '& h4': {
      color: 'var(--foreground)',
      letterSpacing: 0,
      marginTop: '1.75em',
      fontSize: '16px',
      lineHeight: 1.4,
    },
    '& p': {
      marginTop: '1.25em',
    },
    '& ul': {
      marginTop: '1.25em',
      paddingLeft: '1.4em',
      listStyle: 'disc',
    },
    '& ol': {
      marginTop: '1.25em',
      paddingLeft: '1.4em',
      listStyle: 'decimal',
    },
    '& table': {
      marginTop: '1.25em',
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
    },
    '& blockquote': {
      marginTop: '1.25em',
      borderLeft: '2px solid var(--line-strong)',
      paddingLeft: '1.25em',
      color: 'var(--prose-quote)',
    },
    '& pre': {
      marginTop: '1.25em',
      background: 'var(--surface-block)',
      border: '1px solid var(--line)',
      padding: '16px 20px',
      overflowX: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--scrollbar-thumb) transparent',
    },
    '& a': {
      color: 'var(--foreground)',
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
      textDecorationColor: 'var(--prose-link-decoration)',
      transition: 'text-decoration-color 150ms',
    },
    '& a:hover': {
      textDecorationColor: 'var(--foreground)',
    },
    '& strong': {
      color: 'var(--foreground)',
      fontWeight: 600,
    },
    '& li': {
      marginTop: '0.4em',
    },
    '& li::marker': {
      color: 'var(--prose-marker)',
    },
    '& code': {
      fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
      fontSize: '0.875em',
      background: 'var(--surface-panel)',
      padding: '0.15em 0.4em',
      borderRadius: '3px',
    },
    '& .shiki': {
      color: 'light-dark(var(--shiki-light), var(--shiki-dark))',
    },
    '& .shiki span': {
      color: 'light-dark(var(--shiki-light), var(--shiki-dark))',
    },
    '& pre code': {
      background: 'none',
      padding: 0,
      fontSize: '13px',
      lineHeight: 1.6,
    },
    '& hr': {
      marginTop: '2.5em',
      borderColor: 'var(--line)',
    },
    '& th': {
      border: '1px solid var(--line)',
      padding: '8px 14px',
      textAlign: 'left',
      color: 'var(--foreground)',
      fontWeight: 600,
      background: 'var(--surface-block)',
    },
    '& td': {
      border: '1px solid var(--line)',
      padding: '8px 14px',
      textAlign: 'left',
    },
    '& img': {
      marginTop: '1.5em',
      border: '1px solid var(--line)',
    },
    '& video': {
      display: 'block',
      width: '100%',
      height: 'auto',
      marginTop: '1.5em',
      border: '1px solid var(--line)',
      background: 'var(--surface-block)',
    },
    '& :is(p:has(img), p:has(svg)) + p:has(> em:only-child)': {
      marginTop: '0.75em',
      fontSize: '13px',
      color: 'var(--prose-caption)',
    },
  },
})

export const docsZoneDiagram = style({
  margin: '2rem 0',
  selectors: {
    '& svg.blog-diagram': {
      margin: 0,
      border: 0,
    },
    '& figcaption': {
      marginTop: '0.75rem',
      color: 'var(--foreground-secondary)',
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      textAlign: 'center',
    },
  },
})

export const docsDemo = style({
  '@layer utilities': {
    selectors: {
      '& :is(input:not([type="checkbox"]):not([type="radio"]), select, textarea)': {
        minHeight: '40px',
        borderRadius: '6px',
        borderColor: 'var(--line-strong)',
        background: 'var(--surface-input)',
        color: 'var(--foreground)',
        fontSize: '14px',
        lineHeight: 1.5,
      },
      '& :is(input, select, textarea):focus-visible': {
        outline: '2px solid var(--foreground)',
        outlineOffset: '2px',
      },
      '& :is(button, a):focus-visible': {
        outline: '2px solid var(--foreground)',
        outlineOffset: '3px',
      },
    },
    '@media (width < 640px)': {
      selectors: {
        '& :is(input:not([type="checkbox"]):not([type="radio"]), select, textarea)': {
          fontSize: '16px',
        },
      },
    },
  },
})

export const docsSpecificationMeta = style({
  marginBottom: '1rem',
  selectors: {
    '& > a': {
      display: 'inline-flex',
      textDecoration: 'none',
    },
    '& > a:hover > span': {
      color: 'var(--vocs-text-color-primary)',
      background: 'var(--color-gray4)',
    },
    '& + h1': {
      marginTop: 0,
    },
  },
})
