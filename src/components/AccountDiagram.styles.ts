import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

/** Account diagrams: one compact strip of icon chips on a panel, joined by small glyphs. */
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
    '& .ad-sep': {
      inlineSize: '1px',
      blockSize: '14px',
      marginInline: tokens.spacing['1'],
      backgroundColor: tokens.color.line,
    },
    '& .ad-or': {
      marginInline: tokens.spacing['1'],
      color: tokens.color.muted,
      fontWeight: tokens.fontWeight.normal,
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
