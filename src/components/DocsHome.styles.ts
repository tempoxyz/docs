import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// Home: the hero (eyebrow, title, lead, one primary button), then Start with a guide,
// Products and Reference & tools. Every card is the page background with a 1px border,
// radius 12 and padding 20, 16 apart: title 16 medium, description 14/20 secondary.
export const tempoDocsHome = style({
  color: tokens.color.foreground,
  fontFamily: tokens.fontFamily.ui,
  selectors: {
    '& span[id]': {
      display: 'block',
      scrollMarginTop: 'calc(var(--vocs-spacing-topNav) + 32px)',
    },
    '& .tempo-docs-home-eyebrow': {
      marginTop: tokens.spacing['0'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['3'],
      marginInlineStart: tokens.spacing['0'],

      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      lineHeight: tokens.lineHeight.control,
    },
    // Home's display title: 48 from Tablet up, 32 on Mobile; H1 → lead 12.
    '& h1[data-v]': {
      marginTop: tokens.spacing['0'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['3'],
      marginInlineStart: tokens.spacing['0'],
      padding: 0,
      border: 0,

      fontFamily: tokens.fontFamily.book,
      fontSize: tokens.fontSize.displayLarge,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.heading,
      lineHeight: tokens.lineHeight.display,
      textWrap: 'balance',
    },
    '& .tempo-docs-home-heading p[data-v]': {
      margin: 0,

      color: tokens.color.muted,
      fontSize: tokens.fontSize.lead,
      lineHeight: tokens.lineHeight.relaxed,
      textWrap: 'pretty',
    },
    // Lead → the hero's one button 32.
    '& .tempo-docs-home-actions': {
      display: 'flex',
      marginTop: tokens.spacing['8'],
    },
    // Sections: H2 48 above; H2 → card grid 24 (the block rhythm).
    '& :is(.tempo-docs-home-guides, .tempo-docs-home-products, .tempo-docs-home-reference)': {
      marginTop: tokens.spacing['12'],
    },
    '& h2[data-v]': {
      margin: 0,
      padding: 0,
      border: 0,

      fontFamily: tokens.fontFamily.book,
      fontSize: tokens.fontSize.title,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.tight,
      lineHeight: tokens.lineHeight.compact,
    },
    '& .heading-anchor': {
      display: 'none',
    },
    // Start with a guide: the heading row carries Find your starting point at the inline end.
    '& .tempo-docs-home-section-head': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      columnGap: tokens.spacing['4'],
      rowGap: tokens.spacing['2'],
    },
    '& .tempo-docs-home-guides-more': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
      textDecoration: 'none',
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& :is(.tempo-docs-home-guide-grid, .tempo-docs-home-product-grid, .tempo-docs-home-quick-links)':
      {
        display: 'grid',
        gap: tokens.spacing['4'],
        marginTop: tokens.spacing['6'],
      },
    '& .tempo-docs-home-guide-grid': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
    '& .tempo-docs-home-product-grid': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
    '& .tempo-docs-home-quick-links': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    // The one card family.
    '& :is(.tempo-docs-home-guide, .tempo-docs-home-product-group, .tempo-docs-home-quick-link)': {
      minWidth: 0,
      padding: tokens.spacing['5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.hairline,
      borderRadius: tokens.radius.lg,
      '--corner-radius': tokens.radius.lg,
    },
    // Card titles 16 medium primary.
    '& :is(.tempo-docs-home-guide, .tempo-docs-home-product-group) h3[data-v], & .tempo-docs-home-quick-link > a':
      {
        margin: 0,
        padding: 0,

        color: tokens.color.foreground,
        fontFamily: tokens.fontFamily.ui,
        fontSize: tokens.fontSize.body,
        fontWeight: tokens.fontWeight.medium,
        letterSpacing: tokens.letterSpacing.normal,
        lineHeight: tokens.lineHeight.body,
        textDecoration: 'none',
      },
    // Card descriptions 14/20 secondary, 4 below the title.
    '& :is(.tempo-docs-home-guide, .tempo-docs-home-product-group, .tempo-docs-home-quick-link) p[data-v]':
      {
        margin: 0,

        color: tokens.color.muted,
        fontSize: tokens.fontSize.sm,
        lineHeight: tokens.lineHeight.control,
        textWrap: 'pretty',
      },
    // A guide or quick-link card has one destination, so its link covers the card. The card
    // takes the hover fill and the focus ring.
    '& :is(.tempo-docs-home-guide, .tempo-docs-home-quick-link)': {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: tokens.spacing['1'],
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& :is(.tempo-docs-home-guide, .tempo-docs-home-quick-link) > a::after': {
      content: '""',
      position: 'absolute',
      insetBlock: tokens.spacing['0'],
      insetInline: tokens.spacing['0'],
    },
    '& :is(.tempo-docs-home-guide, .tempo-docs-home-quick-link) > a:focus-visible': {
      outlineStyle: 'none',
    },
    '& :is(.tempo-docs-home-guide, .tempo-docs-home-quick-link):has(> a:focus-visible)': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.foreground,
      outlineOffset: '4px',
    },
    // Guides: the action sits at the card end, so the three actions align.
    // Chevron links stay inline-block: a flex link would drop the space before the last word.
    '& .tempo-docs-home-guide-action': {
      display: 'inline-block',
      minHeight: '24px',
      // design-exception: Pushes the action to the card end so the three actions align.
      marginTop: 'auto !custom',
      paddingTop: tokens.spacing['3'],

      color: tokens.color.foreground,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      lineHeight: tokens.lineHeight.control,
      textDecoration: 'none',
    },
    // Reference & tools: a 32 icon tile, then the title and description.
    '& .tempo-docs-home-quick-link > .tempo-docs-home-icon-tile': {
      marginBottom: tokens.spacing['3'],
    },
    // Products: the icon and linked title at the start, the outline badge at the inline end.
    // The row keeps the badge's height so cards with and without a badge align.
    '& .tempo-docs-home-product-header': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing['3'],
      minHeight: '28px',
    },
    '& .tempo-docs-home-product-group h3[data-v]': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .tempo-docs-home-product-group h3[data-v] > a:not(.heading-anchor)': {
      color: tokens.color.foreground,
      fontWeight: 'inherit !custom',
      textDecoration: 'none',
    },
    // Two lines of description keep the link lists level across a row.
    '& .tempo-docs-home-product-group p[data-v]': {
      minHeight: '40px',
      marginTop: tokens.spacing['1'],
      marginBottom: tokens.spacing['4'],
    },
    '& ul[data-v]': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& li[data-v]': {
      margin: 0,
      padding: 0,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.control,
    },
    '& li[data-v]::marker': {
      content: 'none',
    },
    '& li[data-v] + li[data-v]': {
      marginTop: tokens.spacing['2'],
    },
    '& .tempo-docs-home-product-group li[data-v] a': {
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.normal,
      textDecoration: 'none',
    },
    // Standalone links get at least a 24px hit area.
    '& .tempo-docs-home-guides-more, & .tempo-docs-home-product-group :is(h3[data-v], li[data-v]) > a:not(.heading-anchor)':
      {
        display: 'inline-block',
        minHeight: '24px',
      },
    '& :is(a, button):focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.foreground,
      outlineOffset: '4px',
    },
  },
  '@media (hover: hover)': {
    selectors: {
      '& :is(.tempo-docs-home-guide, .tempo-docs-home-quick-link):has(> a:hover)': {
        backgroundColor: tokens.color.containerSubtle,
        transitionDuration: 'var(--tempo-enter)',
      },
      '& .tempo-docs-home-guides-more:hover': {
        color: tokens.color.foreground,
        transitionDuration: 'var(--tempo-enter)',
      },
      '& .tempo-docs-home-product-group :is(h3[data-v] > a:not(.heading-anchor), li[data-v] a):hover':
        {
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
        },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& :is(.tempo-docs-home-guide, .tempo-docs-home-quick-link, .tempo-docs-home-guides-more)': {
        transitionProperty: 'none',
      },
    },
  },
  // Below Desktop: products and quick links in two columns, guides stacked.
  '@media (width < 1080px)': {
    selectors: {
      '& :is(.tempo-docs-home-product-grid, .tempo-docs-home-quick-links)': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
  },
  '@media (width < 900px)': {
    selectors: {
      '& .tempo-docs-home-guide-grid': {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
    },
  },
  '@media (width < 768px)': {
    selectors: {
      '& h1[data-v]': {
        fontSize: tokens.fontSize.displaySmall,
      },
    },
  },
  // Mobile: one column of cards.
  '@media (width < 640px)': {
    selectors: {
      '& :is(.tempo-docs-home-product-grid, .tempo-docs-home-quick-links)': {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
      '& .tempo-docs-home-product-group p[data-v]': {
        minHeight: 0,
      },
    },
  },
})

export const tempoDocsHomeProductIcon = style({
  display: 'inline-block',
  flexShrink: 0,
  width: '20px',
  height: '20px',
  marginInlineEnd: tokens.spacing['2'],

  color: tokens.color.foreground,
})

// A 32 icon tile (radius 8, container fill) holding a 16 icon.
export const tempoDocsHomeIconTile = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: tokens.color.container,

  color: tokens.color.foreground,
})

// DocsHomeAgent (Build with your agent). Home no longer renders it; it reads the --home-* colours
// from its host.
export const tempoAgentStart = style({
  minWidth: 0,
  selectors: {
    // One section heading style on Home (Start with a guide, Products, Tools & references).
    '& h2': {
      margin: 0,
      fontSize: tokens.fontSize.title,
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: tokens.letterSpacing.heading,
      lineHeight: tokens.lineHeight.compact,
    },
    '& .tempo-agent-start-toolbar': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing['4'],
    },
    // The agent block is a Home card: the docs card fill, radius and padding.
    '& .tempo-agent-start-panel': {
      marginTop: tokens.spacing['7'],
      // design-exception: Shares the docs card padding variable with Vocs cards.
      padding: 'var(--tempo-card-padding) !custom',
      // design-exception: Shares the docs card radius variable with Vocs cards.
      borderRadius: 'var(--tempo-card-radius) !custom',
      '--corner-radius': 'var(--tempo-card-radius)',
      backgroundColor: inherited.color.homePanel,
    },
    // Connect Tempo docs, with the agent's install link at the inline end.
    '& .tempo-agent-start-heading': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      columnGap: tokens.spacing['4'],
      rowGap: tokens.spacing['1'],
    },
    '& .tempo-agent-start-label': {
      margin: 0,

      color: inherited.color.homeInk,
      fontSize: tokens.fontSize.body,
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: tokens.letterSpacing.tight,
      lineHeight: tokens.lineHeight.normal,
    },
    // The setup chooser spans the full width; on narrow screens it scrolls sideways
    // (SegmentedControl sets overflow-x: auto) and never wraps.
    '& .tempo-agent-start-agents': {
      marginTop: tokens.spacing['0'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['5'],
      marginInlineStart: tokens.spacing['0'],
    },
    '& .tempo-agent-start-destination svg': {
      width: '14px',
      height: '14px',
    },
    // The terminal sits inside the card, so it takes the page fill.
    '& .tempo-agent-start-command': {
      marginTop: tokens.spacing['3'],
      overflow: 'hidden',
      borderRadius: tokens.radius.xl,
      '--corner-radius': tokens.radius.xl,
      backgroundColor: tokens.color.background,
    },
    '& .tempo-agent-start-destination': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.xs,
      lineHeight: tokens.lineHeight.normal,
    },
    '& .tempo-agent-start-instruction': {
      marginTop: tokens.spacing['1_5'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['0'],
      marginInlineStart: tokens.spacing['0'],

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
    },
    '& pre': {
      margin: 0,
      overflowX: 'auto',

      paddingTop: tokens.spacing['2_5'],
      paddingInlineEnd: tokens.spacing['4'],
      paddingBottom: tokens.spacing['3_5'],
      paddingInlineStart: tokens.spacing['4'],

      color: inherited.color.homeInk,

      fontFamily: inherited.fontFamily.vocsFontFamilyMono,
      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.prose,
      whiteSpace: 'pre-wrap',
      overflowWrap: 'anywhere',
    },
    '& pre code': {
      display: 'block',
      padding: 0,
      border: 0,
      backgroundColor: 'transparent !custom',
      font: 'inherit',
    },
    '& .tempo-agent-start-copy': {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['1_5'],
      minHeight: '32px',

      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['2'],
      border: 0,
      borderRadius: tokens.radius.sm,
      backgroundColor: 'transparent !custom',

      color: inherited.color.homeMuted,
      fontFamily: 'inherit !custom',
      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.normal,
      cursor: 'pointer',
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& .tempo-agent-start-copy:hover': {
      color: inherited.color.homeInk,
      transitionDuration: 'var(--tempo-enter)',
    },
    '& .tempo-agent-start-copy svg': {
      width: '14px',
      height: '14px',
    },
    // The install link can stand alone (Codex, Claude Code), so it carries no leading margin.
    '& .tempo-agent-start-prerequisite': {
      color: inherited.color.homeInk,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
      textDecoration: 'underline',

      textDecorationColor: inherited.color.colorMixInSrgbHomeInk35Transparent,
      textUnderlineOffset: '3px',
    },
    '& .tempo-agent-start-footer': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      gap: '8px 16px !custom',

      marginTop: tokens.spacing['4'],
      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.relaxed,
    },
    '& .tempo-agent-start-footer > a': {
      color: inherited.color.homeInk,
      textDecoration: 'none',
    },
    '& .tempo-agent-start-feedback': {
      marginTop: tokens.spacing['2_5'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['0'],
      marginInlineStart: tokens.spacing['0'],

      color: inherited.color.homeInk,
      fontSize: tokens.fontSize.xs,
      lineHeight: tokens.lineHeight.relaxed,
    },
    '& .tempo-agent-start-feedback:empty': {
      margin: 0,
    },
  },
  '@media (width < 1100px)': {
    selectors: {
      '& pre': {
        fontSize: tokens.fontSize.xs,
      },
    },
  },
  '@media (width < 800px)': {
    selectors: {
      '& pre': {
        fontSize: tokens.fontSize.compact,
      },
    },
  },
  '@media (width < 520px)': {
    selectors: {
      '& .tempo-agent-start-toolbar': {
        flexWrap: 'wrap',
        gap: tokens.spacing['3'],
      },
      '& pre': {
        padding: tokens.spacing['3_5'],
        fontSize: tokens.fontSize.xs,
      },
    },
  },
})

export const tempoAgentStartCommand = style({
  selectors: {
    '& > .tempo-agent-start-toolbar': {
      paddingTop: tokens.spacing['2'],
      paddingInlineEnd: tokens.spacing['2'],
      paddingBottom: tokens.spacing['0'],
      paddingInlineStart: tokens.spacing['4'],
    },
  },
})
