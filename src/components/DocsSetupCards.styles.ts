import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

export const docsSetupGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: tokens.spacing['4'],
  marginBlock: tokens.spacing['6'],
  '@media (width < 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
})

// GS6: the outline treatment (page fill plus a hairline, per G4) with the same
// smoothed radius and padding as the Vocs cards beside them (DocsCards.styles.ts).
export const docsSetupCard = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  // design-exception: Shares the Vocs card padding variable so both tile sets match.
  padding: 'var(--tempo-card-padding) !custom',
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.hairline,
  // design-exception: Shares the Vocs card radius variable so both tile sets match.
  borderRadius: 'var(--tempo-card-radius) !custom',
  '--corner-radius': 'var(--tempo-card-radius)',
  backgroundColor: tokens.color.background,
  color: tokens.color.foreground,
  selectors: {
    '& h3': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2_5'],
      margin: 0,
      fontSize: tokens.fontSize.lead,
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.lineHeight.snug,
    },
    '& svg': {
      flexShrink: 0,
    },
    '& p': {
      marginTop: tokens.spacing['3'],
      marginInlineEnd: tokens.spacing['0'],
      marginBottom: tokens.spacing['6'],
      marginInlineStart: tokens.spacing['0'],

      color: inherited.color.colorMixInSrgbColorForeground65Transparent,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.relaxed,
    },
  },
})

// Links are small secondary buttons, inline, wrapping to a new row when the
// tile runs out of width.
export const docsSetupLinks = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.spacing['2'],
  marginTop: 'auto !custom',
})

// The small secondary button: controls.ts `button` (variant default) at the
// TDS Platform small size. Gray fill, md smoothed radius, hover and focus states.
export const docsSetupLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '32px', // design-exception: TDS Platform small button height; not a spacing step.
  paddingBlock: tokens.spacing['1_5'],
  paddingInline: tokens.spacing['3'],
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  backgroundColor: tokens.color.container,
  color: tokens.color.foreground,
  fontSize: tokens.fontSize.compact,
  fontWeight: tokens.fontWeight.medium,
  lineHeight: tokens.lineHeight.control,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.foreground,
      outlineOffset: '3px',
    },
  },
  '@media (hover: hover)': {
    selectors: {
      '&:hover': {
        backgroundColor: tokens.color.containerStrong,
        transitionDuration: 'var(--tempo-enter)',
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
})

// A visible chevron at the inline end of each setup link button (tempo.xyz
// use-case geometry); it travels 0.15em on hover or focus, and flips in RTL.
export const docsSetupLinkChevron = style({
  '--tempo-chevron-travel': '0.15em',
  display: 'inline-block',
  flexShrink: 0,
  width: '0.274em',
  height: '0.477em',
  marginInlineStart: tokens.spacing['2'],
  transitionProperty: 'transform, translate, scale, rotate',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    ':is(a:hover, a:focus-visible) > &': {
      transform: 'translateX(var(--tempo-chevron-travel))',
      transitionDuration: 'var(--tempo-enter)',
    },
    ':dir(rtl) &': {
      '--tempo-chevron-travel': '-0.15em',
      scale: '-1 1',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      ':is(a:hover, a:focus-visible) > &': {
        transform: 'none',
      },
    },
  },
})
