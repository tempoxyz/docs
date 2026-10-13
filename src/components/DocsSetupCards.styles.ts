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

export const docsSetupCard = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: tokens.spacing['6'],

  borderRadius: tokens.radius.xl,
  backgroundColor: tokens.color.panel,
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

export const docsSetupLinks = style({
  display: 'grid',
  gap: tokens.spacing['1'],
  marginTop: 'auto !custom',
  selectors: {
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing['3'],
      minHeight: '36px',

      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['2'],
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      marginInline: '-8px !custom',
      borderRadius: tokens.radius.md,
      color: 'inherit !custom',
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.normal,
      textDecoration: 'none',
    },
    '& a:hover': {
      backgroundColor: inherited.color.colorMixInSrgbColorForeground6Transparent,
    },
    '& a:focus-visible': {
      // design-exception: Preserve this surface's layered artwork or focus treatment.
      outline: '2px solid currentColor !custom',
      outlineOffset: '2px',
    },
  },
})
