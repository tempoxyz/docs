import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

/**
 * Account diagrams on a panel: chips (things) joined by labeled arrows, boxes with plain-text
 * attributes, signer weights joining a threshold, and a signer ledger.
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
      containerType: 'inline-size',
      paddingBlock: tokens.spacing['5'],
      paddingInline: tokens.spacing['4'],
      borderRadius: tokens.radius.xl,
      backgroundColor: tokens.color.panel,
    },
    '& .ad-icon': {
      flexShrink: 0,
      inlineSize: '16px',
      blockSize: '16px',
      color: tokens.color.muted,
    },
    // Each diagram centers on the panel at its natural width.
    '& .ad-canvas > .ad-variants, & .ad-canvas > .ad-tree, & .ad-canvas > .ad-ledger, & .ad-canvas > .ad-stack-fit':
      {
        inlineSize: 'fit-content',
        maxInlineSize: '100%',
        marginInline: 'auto !custom',
      },
    '& .ad-canvas > .ad-part': {
      // design-exception: Caps the address box so its two kinds stay compact on wide pages.
      maxInlineSize: '560px !custom',
      marginInline: 'auto !custom',
    },
    '& .ad-stack': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['3'],
    },
    // Chips and arrows wrap as a centered line.
    '& .ad-strip': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['2'],
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
    // A weight or threshold at the end of a chip; the threshold is filled.
    '& .ad-value': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minInlineSize: '20px',
      blockSize: '20px',
      paddingInline: tokens.spacing['1_5'],
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.panel,
      fontFamily: tokens.fontFamily.mono,
      fontSize: tokens.fontSize.xs,
    },
    '& .ad-chip-strong .ad-value': {
      backgroundColor: tokens.color.foreground,
      color: tokens.color.background,
    },
    // An arrow with its verb above and an optional note below. The equal outer rows keep the
    // arrow on the chips' center line.
    '& .ad-then': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
    },
    '& .ad-arrow': {
      display: 'inline-grid',
      gridTemplateRows: '1fr auto 1fr',
      justifyItems: 'center',
      rowGap: tokens.spacing['0_5'],
      color: tokens.color.muted,
    },
    '& .ad-arrow-label': {
      fontSize: tokens.fontSize.xs,
      lineHeight: tokens.lineHeight.none,
      whiteSpace: 'nowrap',
    },
    '& .ad-arrow-label:first-child': {
      alignSelf: 'end',
    },
    '& .ad-arrow-label:last-child': {
      alignSelf: 'start',
    },
    '& .ad-arrow-line': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.sm,
      lineHeight: tokens.lineHeight.none,
    },
    // A root chip whose arrows fan out to the things it controls.
    '& .ad-fan': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['3'],
    },
    '& .ad-branches': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: tokens.spacing['1'],
      paddingInlineStart: tokens.spacing['3'],
      borderInlineStartWidth: tokens.borderWidth.hairline,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: tokens.color.lineStrong,
    },
    // One wide bar under a strip, for something both ends share.
    '& .ad-bar': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['1_5'],
      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.background,
    },
    '& .ad-bar-title': {
      fontWeight: tokens.fontWeight.medium,
    },
    '& .ad-detail': {
      color: tokens.color.muted,
    },
    '& .ad-group': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: tokens.spacing['1'],
    },
    '& .ad-tag': {
      display: 'inline-flex',
      alignItems: 'center',
      paddingBlock: tokens.spacing['0_5'],
      paddingInline: tokens.spacing['2'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.background,
      fontSize: tokens.fontSize.xs,
      whiteSpace: 'nowrap',
    },
    // Boxes: a titled part with plain-text attributes; nested parts sit on the panel fill.
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
    '& .ad-fields': {
      display: 'grid',
      gridTemplateColumns: 'max-content minmax(0, 1fr)',
      columnGap: tokens.spacing['4'],
      rowGap: tokens.spacing['1'],
    },
    '& .ad-field-detail': {
      color: tokens.color.muted,
    },
    '& .ad-variants': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['2'],
    },
    // Two kinds side by side with "or" between; they stack on a narrow panel.
    '& .ad-pair': {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
      alignItems: 'stretch',
      gap: tokens.spacing['2'],
    },
    '& .ad-or': {
      alignSelf: 'center',
      justifySelf: 'center',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    // What both kinds have, below a hairline.
    '& .ad-shared': {
      display: 'flex',
      flexWrap: 'wrap',
      columnGap: tokens.spacing['5'],
      rowGap: tokens.spacing['1'],
      paddingBlockStart: tokens.spacing['2'],
      borderBlockStartWidth: tokens.borderWidth.hairline,
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: tokens.color.line,
    },
    // Signer chips over a stem into the threshold.
    '& .ad-tree': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    '& .ad-stem': {
      inlineSize: '1px',
      blockSize: tokens.spacing['3'],
      backgroundColor: tokens.color.lineStrong,
    },
    '& .ad-caption': {
      marginBlockStart: tokens.spacing['1_5'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    // Signers, their weights, and what each does, with the threshold below a rule.
    '& .ad-ledger': {
      display: 'grid',
      gridTemplateColumns: 'max-content auto auto',
      alignItems: 'center',
      columnGap: tokens.spacing['5'],
      rowGap: tokens.spacing['2'],
      paddingBlock: tokens.spacing['2_5'],
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.background,
    },
    '& .ad-ledger-name': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      whiteSpace: 'nowrap',
    },
    '& .ad-ledger-weight': {
      justifySelf: 'end',
      fontFamily: tokens.fontFamily.mono,
    },
    '& .ad-ledger-note': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    '& .ad-ledger-total': {
      fontWeight: tokens.fontWeight.semibold,
    },
    '& .ad-ledger-rule': {
      gridColumn: '1 / -1',
      blockSize: '1px',
      backgroundColor: tokens.color.line,
    },
    '& .ad-lost': {
      color: tokens.color.muted,
      textDecorationLine: 'line-through',
    },
  },
  '@container (width < 480px)': {
    selectors: {
      '& .ad-pair': {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
    },
  },
})
