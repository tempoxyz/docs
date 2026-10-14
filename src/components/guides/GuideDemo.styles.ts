import { style } from '../../styles/scoped'
import { vars as tokens } from '../../styles/theme'

/** The guide's name in the demo header. */
export const guideDemoTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
})

/** The network the demo runs on, in the demo header. */
export const guideDemoNetwork = style({
  color: tokens.color.muted,
  fontSize: tokens.fontSize.compact,
})

/**
 * Guide demo: the guide's steps, then what each step changed in your app and on Tempo. Applied
 * with the account sandbox styles on the same root, so it reuses their `as-*` hooks.
 */
export const guideDemo = style({
  selectors: {
    // Compounded with the root class, so it wins over the sandbox's tighter root gap.
    '&.guide-demo': {
      gap: tokens.spacing['6'],
    },
    '& .gd-steps': {
      display: 'grid',
      gap: tokens.spacing['4'],
    },
    '& .gd-result': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: tokens.spacing['2'],
      marginTop: tokens.spacing['1_5'],
      marginInlineEnd: 0,
      marginBottom: 0,
      // design-exception: Aligns step results with the step title, past the 28px badge and its gap.
      marginInlineStart: '42px !custom',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .gd-result > svg': {
      width: '14px',
      height: '14px',
      marginTop: tokens.spacing['0_5'],
      color: tokens.color.green11,
    },
    '& .gd-replay': {
      // design-exception: Aligns the replay button with the step titles, past the 28px badge and its gap.
      paddingInlineStart: '42px !custom',
    },
    // The two boxes: what the step changed in your app, and on Tempo.
    '& .gd-state': {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
      gap: tokens.spacing['4'],
      alignItems: 'start',
    },
    '& :is(.gd-local, .gd-chain)': {
      display: 'grid',
      gap: tokens.spacing['2'],
      minWidth: 0,
    },
    '& .gd-local ul': {
      display: 'grid',
      gap: tokens.spacing['1_5'],
    },
    '& .gd-local li': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: tokens.spacing['2_5'],
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['2_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.card,
    },
    '& .gd-local li[data-new="true"]': {
      borderColor: tokens.color.green11,
    },
    '& .gd-local li[data-status="gone"] .gd-local-text': {
      opacity: 0.55,
      textDecoration: 'line-through',
    },
    '& .gd-icon': {
      display: 'grid',
      placeItems: 'center',
      width: '20px',
      height: '20px',
      flexShrink: 0,
      color: tokens.color.muted,
    },
    '& .gd-local-text': {
      display: 'grid',
      gap: tokens.spacing['0_5'],
      minWidth: 0,
    },
    '& .gd-local-label': {
      fontWeight: tokens.fontWeight.medium,
    },
    '& .gd-local-detail': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      overflowWrap: 'anywhere',
    },
    '& .gd-empty': {
      padding: tokens.spacing['2_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .gd-result p': {
      margin: 0,
    },
    // Transactions a step sent: a label and the hash with a copy button.
    '& .gd-hashes': {
      display: 'flex',
      flexWrap: 'wrap',
      rowGap: tokens.spacing['0_5'],
      columnGap: tokens.spacing['3_5'],
      marginTop: tokens.spacing['1'],
      marginInlineEnd: 0,
      marginBottom: 0,
      marginInlineStart: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& .gd-hashes li': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
    },
    '& .gd-secret': {
      marginTop: tokens.spacing['2'],
    },
  },
  '@media (width <= 720px)': {
    selectors: {
      '& .gd-state': {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
      '& .gd-result': {
        marginInlineStart: 0,
      },
      '& .gd-replay': {
        paddingInlineStart: 0,
      },
    },
  },
})
