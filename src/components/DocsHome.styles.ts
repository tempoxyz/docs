import { style } from 'zyzz'

export const tempoDocsHome = style({
  '--home-muted': 'var(--vocs-text-color-secondary)',
  '--home-ink': 'var(--vocs-text-color-primary)',
  '--home-panel': 'var(--surface-block)',
  '--home-line': 'var(--vocs-border-color-primary)',
  color: 'var(--home-ink)',
  fontFamily: 'var(--tempo-font-body, var(--vocs-font-family))',
  selectors: {
    '& span[id]': {
      display: 'block',
      scrollMarginTop: 'calc(var(--vocs-spacing-topNav) + 32px)',
    },
    '& .tempo-docs-home-heading': {
      paddingBottom: '40px',
    },
    '& h1[data-v]': {
      margin: '0 0 18px',
      padding: 0,
      border: 0,
      fontFamily: 'var(--tempo-font-display, var(--vocs-font-family))',
      fontSize: '48px',
      fontWeight: 500,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    '& .tempo-docs-home-heading p[data-v]': {
      margin: 0,
      color: 'var(--home-muted)',
      fontSize: '16px',
      lineHeight: 1.6,
    },
    '& .tempo-docs-home-start': {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
      alignItems: 'start',
      gap: '48px',
    },
    '& h2[data-v]': {
      margin: 0,
      padding: 0,
      border: 0,
      fontSize: '24px',
      fontWeight: 500,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    '& .tempo-docs-home-guides': {
      paddingTop: '28px',
    },
    '& .tempo-docs-home-guides h2[data-v]': {
      marginBottom: '28px',
      fontSize: '20px',
    },
    '& .tempo-docs-home-guides > a': {
      display: 'block',
      marginBottom: '28px',
      textDecoration: 'none',
    },
    '& .tempo-docs-home-guides strong': {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '16px',
      color: 'var(--home-ink)',
      fontSize: '15px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    '& .tempo-docs-home-guides strong + span': {
      display: 'block',
      marginTop: '6px',
      color: 'var(--home-muted)',
      fontSize: '14px',
      lineHeight: 1.6,
    },
    '& .tempo-docs-home-guides > p[data-v]': {
      margin: '32px 0 0',
      fontSize: '14px',
    },
    '& .tempo-docs-home-products': {
      marginTop: '48px',
    },
    '& .tempo-docs-home-product-grid': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '20px',
      marginTop: '28px',
    },
    '& .tempo-docs-home-product-group': {
      minWidth: 0,
      padding: 'var(--tempo-card-padding)',
      borderRadius: 'var(--tempo-card-radius)',
      background: 'var(--home-panel)',
    },
    '& .tempo-docs-home-product-group h3[data-v]': {
      margin: 0,
      padding: 0,
      fontSize: '18px',
      fontWeight: 500,
      letterSpacing: '-0.015em',
      lineHeight: 1.4,
    },
    '& .tempo-docs-home-product-group h3[data-v] > a:not(.heading-anchor)': {
      color: 'var(--home-ink)',
      fontWeight: 'inherit',
      textDecoration: 'none',
    },
    '& .tempo-docs-home-product-group p[data-v]': {
      minHeight: '3.2em',
      margin: '12px 0 20px',
      color: 'var(--home-muted)',
      fontSize: '14px',
      lineHeight: 1.6,
    },
    '& ul[data-v]': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& li[data-v]': {
      margin: 0,
      padding: 0,
      fontSize: '15px',
      lineHeight: 1.6,
    },
    '& li[data-v] + li[data-v]': {
      marginTop: '10px',
    },
    '& li[data-v] a[data-v]': {
      color: 'var(--home-ink)',
      fontWeight: 400,
      textDecoration: 'none',
    },
    '& p[data-v] a[data-v]': {
      color: 'var(--accent-blue)',
      fontWeight: 400,
      textDecoration: 'underline',
      textDecorationColor: 'color-mix(in srgb, var(--accent-blue) 40%, transparent)',
      textDecorationThickness: '1px',
      textUnderlineOffset: '3px',
    },
    '& .tempo-docs-home-reference': {
      marginTop: '48px',
      paddingTop: '36px',
      borderTop: '1px solid var(--home-line)',
    },
    '& .tempo-docs-home-reference-grid': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '48px',
      marginTop: '32px',
    },
    '& .tempo-docs-home-reference-grid h3[data-v]': {
      margin: '0 0 16px',
      padding: 0,
      color: 'var(--home-muted)',
      fontSize: '14px',
      fontWeight: 400,
      letterSpacing: 0,
    },
    '& .tempo-docs-home-reference-grid > div:first-child ul[data-v]': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '10px 20px',
    },
    '& .tempo-docs-home-reference-grid > div:first-child li[data-v]': {
      margin: 0,
    },
    '& :is(a, button):focus-visible': {
      outline: '2px solid var(--home-ink)',
      outlineOffset: '4px',
    },
    '& :is(li, p)[data-v] a[data-v]:hover': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
    '& .tempo-docs-home-product-group h3[data-v] > a:not(.heading-anchor):hover': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
    '& .tempo-docs-home-guides > a:hover strong': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
  '@media (width < 1100px)': {
    selectors: {
      '& .tempo-docs-home-product-grid': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
      '& .tempo-docs-home-start': {
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
        gap: '32px',
      },
    },
  },
  '@media (width < 800px)': {
    selectors: {
      '& .tempo-docs-home-start': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: '36px',
      },
      '& .tempo-docs-home-guides': {
        padding: 0,
      },
      '& .tempo-docs-home-reference-grid': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '32px',
      },
    },
  },
  '@media (width < 700px)': {
    selectors: {
      '& .tempo-docs-home-product-grid': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: '16px',
        marginTop: '24px',
      },
      '& .tempo-docs-home-product-group p[data-v]': {
        minHeight: 0,
      },
    },
  },
  '@media (width < 520px)': {
    selectors: {
      '& h1[data-v]': {
        fontSize: '40px',
      },
      '& .tempo-docs-home-heading': {
        paddingBottom: '32px',
      },
      '& .tempo-docs-home-heading p[data-v]': {
        fontSize: '15px',
      },
      '& .tempo-docs-home-reference-grid': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: '32px',
      },
      '& .tempo-docs-home-products': {
        marginTop: '36px',
      },
      '& .tempo-docs-home-reference': {
        marginTop: '36px',
        paddingTop: '28px',
      },
    },
  },
})

export const tempoDocsHomeProductIcon = style({
  display: 'inline-block',
  width: '20px',
  height: '20px',
  marginRight: '10px',
  verticalAlign: '-4px',
  color: 'var(--home-ink)',
})

export const tempoAgentStart = style({
  '--home-muted': 'color-mix(in srgb, var(--home-ink) 68%, transparent)',
  minWidth: 0,
  padding: '28px',
  borderRadius: '24px',
  background: 'var(--home-panel)',
  selectors: {
    '& h2': {
      margin: 0,
      fontSize: '22px',
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    '& > p': {
      margin: '8px 0 18px',
      color: 'var(--home-muted)',
      fontSize: '14px',
      lineHeight: 1.6,
    },
    '& .tempo-agent-start-toolbar': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    },
    '& .tempo-agent-start-label': {
      margin: 0,
      color: 'var(--home-ink)',
      fontSize: '16px',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.5,
    },
    '& .tempo-agent-start-agents': {
      margin: '0 0 20px',
      padding: 0,
      border: 0,
    },
    '& .tempo-agent-start-agents button': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: '40px',
      padding: '8px 14px',
      border: '1px solid transparent',
      borderRadius: '999px',
      background: 'transparent',
      color: 'var(--home-muted)',
      fontSize: '13px',
      fontFamily: 'inherit',
      lineHeight: 1.5,
      cursor: 'pointer',
    },
    '& .tempo-agent-start-agents button[aria-pressed="true"]': {
      borderColor: 'var(--home-ink)',
      color: 'var(--home-ink)',
    },
    '& :is(.tempo-agent-start-agents, .tempo-agent-start-destination) svg': {
      width: '14px',
      height: '14px',
    },
    '& .tempo-agent-start-command': {
      marginTop: '12px',
      overflow: 'hidden',
      borderRadius: '12px',
      background: 'var(--vocs-background-color-primary)',
    },
    '& .tempo-agent-start-destination': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color: 'var(--home-muted)',
      fontSize: '12px',
      lineHeight: 1.5,
    },
    '& .tempo-agent-start-instruction': {
      margin: '6px 0 0',
      color: 'var(--home-muted)',
      fontSize: '14px',
      lineHeight: 1.6,
    },
    '& pre': {
      margin: 0,
      overflowX: 'auto',
      padding: '10px 16px 14px',
      color: 'var(--home-ink)',
      fontFamily: 'var(--vocs-font-family-mono)',
      fontSize: '13px',
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',
      overflowWrap: 'anywhere',
    },
    '& pre code': {
      display: 'block',
      padding: 0,
      border: 0,
      background: 'transparent',
      font: 'inherit',
    },
    '& .tempo-agent-start-copy': {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      minHeight: '32px',
      padding: '6px 8px',
      border: 0,
      borderRadius: '4px',
      background: 'transparent',
      color: 'var(--home-muted)',
      fontFamily: 'inherit',
      fontSize: '13px',
      lineHeight: 1.5,
      cursor: 'pointer',
    },
    '& .tempo-agent-start-copy:hover': {
      color: 'var(--home-ink)',
    },
    '& .tempo-agent-start-copy svg': {
      width: '14px',
      height: '14px',
    },
    '& .tempo-agent-start-prerequisite': {
      marginLeft: '4px',
      color: 'var(--home-ink)',
      textDecoration: 'underline',
      textDecorationColor: 'color-mix(in srgb, var(--home-ink) 35%, transparent)',
      textUnderlineOffset: '3px',
    },
    '& .tempo-agent-start-footer': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px 16px',
      marginTop: '18px',
      fontSize: '13px',
      lineHeight: 1.6,
    },
    '& .tempo-agent-start-footer > a': {
      color: 'var(--home-ink)',
      textDecoration: 'none',
    },
    '& .tempo-agent-start-feedback': {
      margin: '10px 0 0',
      color: 'var(--home-ink)',
      fontSize: '12px',
      lineHeight: 1.6,
    },
    '& .tempo-agent-start-feedback:empty': {
      margin: 0,
    },
    '& .tempo-agent-start-footer > a:hover': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
  '@media (width < 1100px)': {
    selectors: {
      '& pre': {
        fontSize: '12px',
      },
    },
  },
  '@media (width < 800px)': {
    selectors: {
      '& pre': {
        fontSize: '13px',
      },
    },
  },
  '@media (width < 520px)': {
    padding: '20px',
    selectors: {
      '& .tempo-agent-start-toolbar': {
        flexWrap: 'wrap',
        gap: '12px',
      },
      '& pre': {
        padding: '14px',
        fontSize: '12px',
      },
    },
  },
})

export const tempoAgentStartAgents = style({
  selectors: {
    '& legend': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
    },
    '& > div': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
  },
})

export const tempoAgentStartCommand = style({
  selectors: {
    '& > .tempo-agent-start-toolbar': {
      padding: '8px 8px 0 16px',
    },
  },
})
