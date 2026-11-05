import { style } from '../../styles/scoped'
import { vars as tokens } from '../../styles/theme'

/**
 * Scenario switcher for the configurable accounts overview: one segmented row of equal options
 * above the demo, two by two on a phone so labels never wrap.
 */
export const scenarioDemo = style({
  display: 'grid',
  gap: tokens.spacing['4'],
  minWidth: 0,
  selectors: {
    '& .sd-switcher': {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: tokens.spacing['0_5'],
      padding: tokens.spacing['0_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
    },
    '& .sd-switcher button': {
      minHeight: '36px',
      paddingBlock: 0,
      paddingInline: tokens.spacing['3'],
      border: 0,
      borderRadius: tokens.radius.md,
      backgroundColor: 'transparent !custom', // design-exception: the unselected option shows the switcher's own background
      color: tokens.color.muted,
      font: 'inherit',
      fontSize: tokens.fontSize.sm,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    },
    '& .sd-switcher button:hover': {
      color: tokens.color.foreground,
    },
    '& .sd-switcher button[aria-selected="true"]': {
      backgroundColor: tokens.color.container,
      color: tokens.color.foreground,
      fontWeight: tokens.fontWeight.medium,
    },
    '& .sd-switcher button:focus-visible': {
      outlineWidth: tokens.borderWidth.hairline,
      outlineStyle: 'solid',
      outlineColor: tokens.color.lineStrong,
    },
    '& .sd-caption': {
      margin: 0,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
    },
  },
  '@media (width <= 640px)': {
    selectors: {
      '& .sd-switcher': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
  },
})
