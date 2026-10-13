import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

/**
 * Account diagrams on a panel: anatomy boxes (part, fields, alternatives, members) or one compact
 * strip of icon chips joined by small glyphs.
 */
export const accountDiagram = style({
  marginBlock: tokens.spacing['6'],
  marginInline: tokens.spacing['0'],
  color: tokens.color.foreground,
  fontFamily: tokens.fontFamily.sans,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.snug,
  selectors: {
    '& .ad-canvas': {
      paddingBlock: tokens.spacing['5'],
      paddingInline: tokens.spacing['4'],
      borderRadius: tokens.radius.xl,
      backgroundColor: tokens.color.panel,
    },
    '& .ad-icon': {
      flexShrink: 0,
      inlineSize: '16px',
      blockSize: '16px',
      color: 'currentcolor !custom',
    },
    '& .ad-stack': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['3'],
    },
    // Chips and glyphs wrap as a centered line.
    '& .ad-strip': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['2'],
    },
    '& .ad-then': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
    },
    '& .ad-glyph': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
    },
    '& .ad-chip': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['2_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.background,
      fontWeight: tokens.fontWeight.medium,
      whiteSpace: 'nowrap',
    },
    '& .ad-chip-strong': {
      borderColor: tokens.color.foreground,
    },
    '& .ad-chip-quiet': {
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      backgroundColor: 'transparent !custom',
    },
    // A weight, threshold, or held key at the end of a chip.
    '& .ad-value': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minInlineSize: '20px',
      blockSize: '20px',
      paddingInline: tokens.spacing['1_5'],
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.foreground,
      color: tokens.color.background,
      fontFamily: tokens.fontFamily.mono,
      fontSize: tokens.fontSize.xs,
    },
    '& .ad-value .ad-icon': {
      inlineSize: '12px',
      blockSize: '12px',
    },
    // Anatomy: a part is a box, its fields are rows, and nested parts sit inside it.
    '& .ad-part': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['2'],
      minInlineSize: tokens.spacing['0'],
      paddingBlock: tokens.spacing['2_5'],
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.background,
    },
    '& .ad-part-strong': {
      borderColor: tokens.color.lineStrong,
    },
    '& .ad-part-quiet': {
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      backgroundColor: 'transparent !custom',
    },
    '& .ad-part .ad-part': {
      backgroundColor: tokens.color.panel,
    },
    '& .ad-part-head': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      fontWeight: tokens.fontWeight.semibold,
      whiteSpace: 'nowrap',
    },
    '& .ad-part-body': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['1_5'],
    },
    '& .ad-field': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: tokens.spacing['2'],
      rowGap: tokens.spacing['1'],
      color: tokens.color.muted,
    },
    '& .ad-field-label': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      color: tokens.color.foreground,
      whiteSpace: 'nowrap',
    },
    '& .ad-field-label .ad-icon': {
      color: tokens.color.muted,
    },
    '& .ad-field-values': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['1'],
    },
    // One of: alternatives side by side inside a dashed group; they stack when the panel is narrow.
    '& .ad-choice': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['1_5'],
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['2'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.lg,
    },
    '& .ad-choice-label': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    '& .ad-choice-options': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'stretch',
      gap: tokens.spacing['2'],
    },
    '& .ad-choice-options > .ad-part': {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: tokens.spacing['48'],
    },
    // Variants of one part, stacked.
    '& .ad-variants': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['2'],
    },
    '& .ad-part-row > .ad-part-body': {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: tokens.spacing['4'],
    },
    // Members every kind has, below a hairline.
    '& .ad-shared': {
      display: 'flex',
      flexWrap: 'wrap',
      columnGap: tokens.spacing['4'],
      rowGap: tokens.spacing['1_5'],
      paddingBlockStart: tokens.spacing['2'],
      borderBlockStartWidth: tokens.borderWidth.hairline,
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: tokens.color.line,
    },
    '& .ad-tag, & .ad-option': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1'],
      paddingBlock: tokens.spacing['0_5'],
      paddingInline: tokens.spacing['2'],
      fontSize: tokens.fontSize.xs,
      color: tokens.color.foreground,
      whiteSpace: 'nowrap',
    },
    '& .ad-tag': {
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.panel,
    },
    '& .ad-tag-strong': {
      borderColor: tokens.color.lineStrong,
      backgroundColor: tokens.color.background,
      fontWeight: tokens.fontWeight.medium,
    },
    '& .ad-tag .ad-icon, & .ad-option .ad-icon': {
      inlineSize: '12px',
      blockSize: '12px',
      color: tokens.color.muted,
    },
    '& .ad-allof': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: tokens.spacing['1'],
    },
    // One of: dashed options, against the solid members of an all-of group.
    '& .ad-oneof': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: tokens.spacing['1'],
    },
    '& .ad-option': {
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.full,
    },
    // Anatomy views stay compact and center on the panel.
    '& .ad-canvas > .ad-part, & .ad-canvas > .ad-variants': {
      // design-exception: Caps anatomy boxes so they stay compact on wide pages.
      maxInlineSize: '600px !custom',
      marginInline: 'auto !custom',
    },
    '& .ad-canvas > .ad-tree': {
      inlineSize: 'fit-content',
      maxInlineSize: '100%',
      marginInline: 'auto !custom',
    },
    '& .ad-part .ad-part .ad-tag': {
      backgroundColor: tokens.color.background,
    },
    '& .ad-tree': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    '& .ad-tree > .ad-part': {
      alignSelf: 'stretch',
    },
    '& .ad-stem': {
      inlineSize: '1px',
      blockSize: tokens.spacing['3'],
      backgroundColor: tokens.color.lineStrong,
    },
    '& .ad-sum': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
    },
    // The bounds on one key wrap as a unit.
    '& .ad-group': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: tokens.spacing['1_5'],
    },
    '& .ad-strip-note': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    '& .ad-strip-note .ad-chip': {
      color: tokens.color.foreground,
      fontSize: tokens.fontSize.xs,
    },
  },
})
