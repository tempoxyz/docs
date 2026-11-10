import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

export const tempoDocsHome = style({
  '--home-muted': 'var(--vocs-text-color-secondary)',
  '--home-ink': 'var(--vocs-text-color-primary)',
  '--home-panel': tokens.color.panel,

  color: inherited.color.homeInk,

  fontFamily: inherited.fontFamily.tempoFontBodyVarVocsFontFamily,
  selectors: {
    '& span[id]': {
      display: 'block',
      scrollMarginTop: 'calc(var(--vocs-spacing-topNav) + 32px)',
    },
    // The hero: eyebrow, title, one line of orientation and the page's two actions.
    '& .tempo-docs-home-heading': {
      paddingBottom: tokens.spacing['12'],
    },
    '& .tempo-docs-home-eyebrow': {
      marginTop: tokens.spacing['0'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['4'],
      marginInlineStart: tokens.spacing['0'],

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.lineHeight.normal,
    },
    '& h1[data-v]': {
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      margin: '0 0 18px !custom',
      padding: 0,
      border: 0,

      fontFamily: inherited.fontFamily.tempoFontDisplayVarVocsFontFamily,
      fontSize: tokens.fontSize.displayLarge,
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: tokens.letterSpacing.heading,
      lineHeight: tokens.lineHeight.display,
      textWrap: 'balance',
    },
    '& .tempo-docs-home-heading p[data-v]': {
      margin: 0,

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.relaxed,
    },
    // One primary action (accent fill) and one secondary (gray fill).
    '& .tempo-docs-home-actions': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: tokens.spacing['3'],
      marginTop: tokens.spacing['8'],
    },
    '& h2[data-v]': {
      margin: 0,
      padding: 0,
      border: 0,
      fontSize: tokens.fontSize.title,
      fontWeight: tokens.fontWeight.medium,

      letterSpacing: tokens.letterSpacing.heading,
      lineHeight: tokens.lineHeight.compact,
    },
    // Home's one card family: quick links, guides, products and references share the
    // docs card fill, radius and padding, with no border.
    '& :is(.tempo-docs-home-quick-link, .tempo-docs-home-guide, .tempo-docs-home-product-group, .tempo-docs-home-reference-grid > div)':
      {
        minWidth: 0,
        // design-exception: Shares the docs card padding variable with Vocs cards.
        padding: 'var(--tempo-card-padding) !custom',
        // design-exception: Shares the docs card radius variable with Vocs cards.
        borderRadius: 'var(--tempo-card-radius) !custom',
        '--corner-radius': 'var(--tempo-card-radius)',
        backgroundColor: inherited.color.homePanel,
      },
    // A quick link or guide card has one destination, so its link covers the card. The
    // card takes the hover fill and the focus ring.
    '& :is(.tempo-docs-home-quick-link, .tempo-docs-home-guide)': {
      position: 'relative',
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& :is(.tempo-docs-home-quick-link, .tempo-docs-home-guide) > a::after': {
      content: '""',
      position: 'absolute',
      insetBlock: tokens.spacing['0'],
      insetInline: tokens.spacing['0'],
    },
    '& :is(.tempo-docs-home-quick-link, .tempo-docs-home-guide) > a:focus-visible': {
      outlineStyle: 'none',
    },
    '& :is(.tempo-docs-home-quick-link, .tempo-docs-home-guide):has(> a:focus-visible)': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: inherited.color.homeInk,
      outlineOffset: '4px',
    },
    // Quick links: icon and title on one row, the description below.
    '& .tempo-docs-home-quick-links': {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: tokens.spacing['5'],
    },
    '& .tempo-docs-home-quick-link': {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      alignContent: 'start',
      alignItems: 'center',
      columnGap: tokens.spacing['2_5'],
      rowGap: tokens.spacing['2'],
    },
    '& .tempo-docs-home-quick-link .tempo-docs-home-product-icon': {
      marginInlineEnd: tokens.spacing['0'],
      verticalAlign: 'baseline',
    },
    '& .tempo-docs-home-quick-link > a': {
      color: inherited.color.homeInk,
      fontSize: tokens.fontSize.body,
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: tokens.letterSpacing.tight,
      lineHeight: tokens.lineHeight.snug,
      textDecoration: 'none',
    },
    '& .tempo-docs-home-quick-link p[data-v]': {
      gridColumn: '1 / -1',
      margin: 0,

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
      textWrap: 'pretty',
    },
    '& .tempo-docs-home-guides': {
      marginTop: tokens.spacing.section,
    },
    // Start with a guide: three cards, each a description and an action named for it.
    // Actions align at the card end.
    '& .tempo-docs-home-guide-grid': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: tokens.spacing['5'],
      marginTop: tokens.spacing['7'],
    },
    '& .tempo-docs-home-guide': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: tokens.spacing['3'],
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
    '& .tempo-docs-home-guide h3[data-v]': {
      margin: 0,
      padding: 0,

      color: inherited.color.homeInk,
      fontSize: tokens.fontSize.lead,
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: tokens.letterSpacing.tight,
      lineHeight: tokens.lineHeight.snug,
    },
    '& .tempo-docs-home-guide .heading-anchor': {
      display: 'none',
    },
    '& .tempo-docs-home-guide p[data-v]': {
      margin: 0,

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
      textWrap: 'pretty',
    },
    '& .tempo-docs-home-guide-action': {
      // design-exception: Pushes the action to the card end so the three actions align.
      marginTop: 'auto !custom',
      paddingTop: tokens.spacing['2'],

      color: inherited.color.homeInk,
      fontSize: tokens.fontSize.bodySmall,
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.lineHeight.relaxed,
      textDecoration: 'none',
    },
    // Same style as All setup options.
    '& .tempo-docs-home-guides-more': {
      color: inherited.color.homeInk,
      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.relaxed,
      textDecoration: 'none',
    },
    '& .tempo-docs-home-agent': {
      marginTop: tokens.spacing.section,
    },
    '& .tempo-docs-home-products': {
      marginTop: tokens.spacing.section,
    },
    '& .tempo-docs-home-product-grid': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: tokens.spacing['5'],
      marginTop: tokens.spacing['7'],
    },
    // The title sits at the start and the outline badge at the inline end. The row
    // keeps the badge's height so tiles with and without a badge align.
    '& .tempo-docs-home-product-header': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing['3'],
      minHeight: '28px',
    },
    '& .tempo-docs-home-product-group h3[data-v]': {
      margin: 0,
      padding: 0,
      fontSize: tokens.fontSize.lead,
      fontWeight: tokens.fontWeight.medium,

      letterSpacing: tokens.letterSpacing.tight,
      lineHeight: tokens.lineHeight.snug,
    },
    '& .tempo-docs-home-product-group h3[data-v] > a:not(.heading-anchor)': {
      color: inherited.color.homeInk,
      fontWeight: 'inherit !custom',
      textDecoration: 'none',
    },
    // Tile titles are chevron links; the heading keeps its level but not the copy-link anchor.
    '& .tempo-docs-home-product-group .heading-anchor': {
      display: 'none',
    },
    '& .tempo-docs-home-product-group p[data-v]': {
      minHeight: '3.2em',

      marginTop: tokens.spacing['3'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['5'],
      marginInlineStart: tokens.spacing['0'],

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
      textWrap: 'balance',
    },
    '& ul[data-v]': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& li[data-v]': {
      margin: 0,
      padding: 0,
      fontSize: tokens.fontSize.bodySmall,
      lineHeight: tokens.lineHeight.relaxed,
    },
    '& li[data-v] + li[data-v]': {
      marginTop: tokens.spacing['2_5'],
    },
    // Product sub-links are chevron links: no underline at rest or on hover.
    '& .tempo-docs-home-product-group li[data-v] a': {
      color: inherited.color.homeInk,
      fontWeight: tokens.fontWeight.normal,
      textDecoration: 'none',
    },
    '& p[data-v] a[data-v]': {
      color: tokens.color.accent,
      fontWeight: tokens.fontWeight.normal,
      textDecoration: 'underline',

      textDecorationColor: inherited.color.colorMixInSrgbAccentBlue40Transparent,
      textDecorationThickness: '1px',
      textUnderlineOffset: '3px',
    },
    '& .tempo-docs-home-reference': {
      marginTop: tokens.spacing.section,
    },
    '& .tempo-docs-home-reference-grid': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: tokens.spacing['5'],
      marginTop: tokens.spacing['7'],
    },
    '& .tempo-docs-home-reference-grid h3[data-v]': {
      marginTop: tokens.spacing['0'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['4'],
      marginInlineStart: tokens.spacing['0'],
      padding: 0,

      color: inherited.color.homeMuted,
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.normal,
      letterSpacing: tokens.letterSpacing.normal,
    },
    '& .tempo-docs-home-reference-grid > div:first-child ul[data-v]': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      gap: '10px 20px !custom',
    },
    '& .tempo-docs-home-reference-grid > div:first-child li[data-v]': {
      margin: 0,
    },
    // "All APIs & SDKs" leads the group on its own row, above the SDK pairs.
    '& .tempo-docs-home-reference-grid > div:first-child li[data-v]:first-child': {
      gridColumn: '1 / -1',
    },
    // Standalone links get at least a 24px hit area.
    '& .tempo-docs-home-guides-more, & .tempo-docs-home-guide-action, & .tempo-agent-start-footer > a, & .tempo-agent-start-prerequisite, & .tempo-docs-home-product-group :is(h3[data-v], li[data-v]) > a:not(.heading-anchor), & .tempo-docs-home-reference-grid li a':
      {
        display: 'inline-block',
        minHeight: '24px',
      },
    // SegmentedControl items keep their inset ring; an outset one is clipped by the scroller.
    '& :is(a, button):not([role="radio"]):focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: inherited.color.homeInk,
      outlineOffset: '4px',
    },
    // The docs-wide focus rule (outset 3px) outranks the SegmentedControl recipe; restore its inset ring.
    '& [role="radio"]:focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: 'currentColor !custom',
      outlineOffset: '-2px',
    },
  },
  '@media (hover: hover)': {
    selectors: {
      '& :is(.tempo-docs-home-quick-link, .tempo-docs-home-guide):has(> a:hover)': {
        backgroundColor: tokens.color.containerStrong,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& :is(.tempo-docs-home-quick-link, .tempo-docs-home-guide)': {
        transitionProperty: 'none',
      },
    },
  },
  '@media (width < 1100px)': {
    selectors: {
      '& .tempo-docs-home-product-grid': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
      '& .tempo-docs-home-quick-links': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
  },
  '@media (width < 800px)': {
    selectors: {
      '& .tempo-docs-home-reference-grid': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: tokens.spacing['4'],
      },
    },
  },
  // Tablet and phone stack the guides; three columns leave their actions wrapping.
  '@media (width < 900px)': {
    selectors: {
      '& .tempo-docs-home-guide-grid': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['4'],
      },
    },
  },
  '@media (width < 700px)': {
    selectors: {
      '& .tempo-docs-home-product-grid': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['4'],
      },
      '& .tempo-docs-home-product-group p[data-v]': {
        minHeight: 0,
      },
    },
  },
  '@media (width < 520px)': {
    selectors: {
      '& h1[data-v]': {
        fontSize: tokens.fontSize.display,
      },
      '& .tempo-docs-home-heading p[data-v]': {
        fontSize: tokens.fontSize.bodySmall,
      },
      '& .tempo-docs-home-reference-grid': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['4'],
      },
      '& .tempo-docs-home-quick-links': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['3'],
      },
      // Both actions take the full width, the primary one first.
      '& .tempo-docs-home-actions': {
        flexDirection: 'column',
        alignItems: 'stretch',
      },
    },
  },
})

export const tempoDocsHomeProductIcon = style({
  display: 'inline-block',
  width: '20px',
  height: '20px',
  marginInlineEnd: tokens.spacing['2_5'],
  verticalAlign: '-4px',

  color: inherited.color.homeInk,
})

// Build with your agent: a secondary section at the end of Home, in a Home card.
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
