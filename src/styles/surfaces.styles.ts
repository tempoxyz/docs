import { inherited } from './inherited'
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
import { style } from './scoped'
import { vars as tokens } from './theme'

export const docsSectionNav = style({
  '@layer utilities': {
    position: 'fixed',
    top: 'var(--tempo-docs-primary-nav-height)',
    insetInlineEnd: 0,
    insetInlineStart: 0,
    zIndex: tokens.zIndex.sectionNav,
    '@media (width >= 1080px)': {
      insetInlineEnd: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5))',
      insetInlineStart: 'max(0px, calc((100% - var(--tempo-docs-shell-width)) * 0.5))',
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
  backgroundColor: inherited.color.lineDashed,
})

export const repoBrandSquareNeutral = style({
  backgroundColor: tokens.color.foreground,
})

export const showcaseVisualFrame = style({
  boxShadow: 'none',
})

export const showcaseVisualCard = style({
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.card,
  boxShadow: 'none',
})

export const showcaseVisualPanel = style({
  borderColor: tokens.color.line,

  backgroundColor: inherited.color.surfacePanel,
  color: tokens.color.foreground,
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
    fontSize: tokens.fontSize.hero,
    fontWeight: tokens.fontWeight.semibold,
    lineHeight: tokens.lineHeight.display,
    letterSpacing: tokens.letterSpacing.normal,
  },
})

export const heading48 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.displayLarge,
    fontWeight: tokens.fontWeight.semibold,

    lineHeight: tokens.lineHeight.display,
    letterSpacing: tokens.letterSpacing.normal,
  },
})

export const heading40 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.display,
    fontWeight: tokens.fontWeight.semibold,
    lineHeight: tokens.lineHeight.heading,
    letterSpacing: tokens.letterSpacing.normal,
  },
})

export const heading32 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.displaySmall,
    fontWeight: tokens.fontWeight.medium,

    lineHeight: tokens.lineHeight.heading,
    letterSpacing: tokens.letterSpacing.normal,
  },
})

export const heading24 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.title,
    fontWeight: tokens.fontWeight.medium,

    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.normal,
  },
})

export const heading20 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.subheading,
    fontWeight: tokens.fontWeight.medium,
    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const heading16 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.body,
    fontWeight: tokens.fontWeight.medium,
    lineHeight: tokens.lineHeight.normal,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const copy16 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.body,
    fontWeight: tokens.fontWeight.normal,
    lineHeight: tokens.lineHeight.relaxed,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const copy15 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.bodySmall,
    fontWeight: tokens.fontWeight.normal,
    lineHeight: tokens.lineHeight.relaxed,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const copy14 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.normal,
    lineHeight: tokens.lineHeight.relaxed,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const copy13 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.compact,
    fontWeight: tokens.fontWeight.normal,

    lineHeight: tokens.lineHeight.normal,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const label16 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.body,
    fontWeight: tokens.fontWeight.normal,
    lineHeight: tokens.lineHeight.normal,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const label15 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.bodySmall,
    fontWeight: tokens.fontWeight.normal,

    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const label14 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.normal,

    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const label13 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.compact,
    fontWeight: tokens.fontWeight.normal,
    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const label12 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.normal,

    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const button16 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.body,
    fontWeight: tokens.fontWeight.medium,
    lineHeight: tokens.lineHeight.normal,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const button14 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,

    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.wide,
  },
})

export const button12 = style({
  '@layer utilities': {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,

    lineHeight: tokens.lineHeight.snug,
    letterSpacing: tokens.letterSpacing.wide,
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
  backgroundColor: inherited.color.colorMixInSrgbIndicatorGreen12SurfaceShell,
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
      backgroundColor: 'transparent !custom',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: inherited.color.scrollbarThumb,
      borderRadius: tokens.radius.sm,
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
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.prose,
  letterSpacing: tokens.letterSpacing.wide,

  color: inherited.color.proseBody,
  selectors: {
    '& h2': {
      color: tokens.color.foreground,
      letterSpacing: tokens.letterSpacing.normal,

      marginTop: inherited.spacing.heading,
      fontSize: tokens.fontSize.title,
      lineHeight: tokens.lineHeight.compact,
    },
    '& h3': {
      color: tokens.color.foreground,
      letterSpacing: tokens.letterSpacing.normal,

      marginTop: inherited.spacing.subheading,

      fontSize: tokens.fontSize.lead,

      lineHeight: tokens.lineHeight.snug,
    },
    '& h4': {
      color: tokens.color.foreground,
      letterSpacing: tokens.letterSpacing.normal,

      marginTop: inherited.spacing.subtitle,
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.snug,
    },
    '& p': {
      marginTop: inherited.spacing.paragraph,
    },
    '& ul': {
      marginTop: inherited.spacing.paragraph,

      paddingInlineStart: inherited.spacing.listInset,
      listStyle: 'disc',
    },
    '& ol': {
      marginTop: inherited.spacing.paragraph,

      paddingInlineStart: inherited.spacing.listInset,
      listStyle: 'decimal',
    },
    '& table': {
      marginTop: inherited.spacing.paragraph,
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: tokens.fontSize.sm,
    },
    '& blockquote': {
      marginTop: inherited.spacing.paragraph,
      borderInlineStartWidth: tokens.borderWidth.emphasis,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: tokens.color.lineStrong,

      paddingInlineStart: inherited.spacing.paragraph,

      color: inherited.color.proseQuote,
    },
    '& pre': {
      marginTop: inherited.spacing.paragraph,
      backgroundColor: tokens.color.block,
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,

      paddingBlock: tokens.spacing['4'],
      paddingInline: tokens.spacing['5'],
      overflowX: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--scrollbar-thumb) transparent',
    },
    '& a': {
      color: tokens.color.foreground,
      textDecoration: 'underline',
      textUnderlineOffset: '3px',

      textDecorationColor: inherited.color.proseLinkDecoration,
      transition: 'text-decoration-color 150ms',
    },
    '& a:hover': {
      textDecorationColor: tokens.color.foreground,
    },
    '& strong': {
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.semibold,
    },
    '& li': {
      marginTop: inherited.spacing.marker,
    },
    '& li::marker': {
      color: inherited.color.proseMarker,
    },
    '& code': {
      fontFamily: tokens.fontFamily.mono,

      fontSize: inherited.spacing.inlineCode,
      backgroundColor: inherited.color.surfacePanel,
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      padding: '0.15em 0.4em !custom',

      borderRadius: tokens.radius.xs,
    },
    '& .shiki': {
      color: inherited.color.lightDarkShikiLightShikiDark,
    },
    '& .shiki span': {
      color: inherited.color.lightDarkShikiLightShikiDark,
    },
    '& pre code': {
      background: 'none',
      padding: 0,
      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.relaxed,
    },
    '& hr': {
      marginTop: inherited.spacing.heading,
      borderColor: tokens.color.line,
    },
    '& th': {
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,

      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['3_5'],
      textAlign: 'left',
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.semibold,
      backgroundColor: tokens.color.block,
    },
    '& td': {
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,

      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['3_5'],
      textAlign: 'left',
    },
    '& img': {
      marginTop: inherited.spacing.block,
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
    },
    '& video': {
      display: 'block',
      width: '100%',
      height: 'auto',

      marginTop: inherited.spacing.block,
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      backgroundColor: tokens.color.block,
    },
    '& :is(p:has(img), p:has(svg)) + p:has(> em:only-child)': {
      marginTop: inherited.spacing.caption,
      fontSize: tokens.fontSize.compact,

      color: inherited.color.proseCaption,
    },
  },
  '@media (width < 640px)': {
    selectors: {
      // Wide comparison tables scroll inside the article instead of widening the page.
      '& table': {
        display: 'block',
        maxWidth: '100%',
        overflowX: 'auto',
      },
    },
  },
})

export const docsZoneDiagram = style({
  marginBlock: tokens.spacing['8'],
  marginInline: tokens.spacing['0'],
  selectors: {
    '& svg.blog-diagram': {
      margin: 0,
      border: 0,
    },
    '& figcaption': {
      marginTop: tokens.spacing['3'],
      color: tokens.color.muted,

      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.normal,
      textAlign: 'center',
    },
  },
})

export const docsDemo = style({
  '@layer utilities': {
    selectors: {
      '& :is(input:not([type="checkbox"]):not([type="radio"]), select, textarea)': {
        minHeight: '40px',
        borderRadius: tokens.radius.md,
        borderColor: tokens.color.lineStrong,
        backgroundColor: inherited.color.surfaceInput,
        color: tokens.color.foreground,
        fontSize: tokens.fontSize.sm,
        lineHeight: tokens.lineHeight.normal,
      },
      '& :is(input, select, textarea):focus-visible': {
        outlineWidth: tokens.borderWidth.emphasis,
        outlineStyle: 'solid',
        outlineColor: tokens.color.foreground,
        outlineOffset: '2px',
      },
      '& :is(button, a):focus-visible': {
        outlineWidth: tokens.borderWidth.emphasis,
        outlineStyle: 'solid',
        outlineColor: tokens.color.foreground,
        outlineOffset: '3px',
      },
    },
    '@media (width < 640px)': {
      selectors: {
        '& :is(input:not([type="checkbox"]):not([type="radio"]), select, textarea)': {
          fontSize: tokens.fontSize.body,
        },
      },
    },
  },
})

export const docsSpecificationMeta = style({
  marginBottom: tokens.spacing['4'],
  selectors: {
    '& > a': {
      display: 'inline-flex',
      textDecoration: 'none',
    },
    '& > a:hover > span': {
      color: inherited.color.vocsTextColorPrimary,
      backgroundColor: tokens.color.gray4,
    },
    '& + h1': {
      marginTop: 0,
    },
  },
})
