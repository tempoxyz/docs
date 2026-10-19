import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

/**
 * Account diagrams in the Zone diagram's language: cards on the page, joined by drawn arrows with a
 * label above and a note below, or by brackets that join or split equal columns.
 */
export const accountDiagram = style({
  marginBlock: tokens.spacing['8'],
  marginInline: tokens.spacing['0'],
  color: tokens.color.foreground,
  fontFamily: tokens.fontFamily.sans,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.snug,
  selectors: {
    '& .dg-canvas': {
      containerType: 'inline-size',
      display: 'flex',
      justifyContent: 'center',
    },
    '& .dg-icon': {
      flexShrink: 0,
      inlineSize: '16px',
      blockSize: '16px',
      color: tokens.color.muted,
    },
    // Cards
    '& .dg-node': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['2_5'],
      minInlineSize: tokens.spacing['0'],
      paddingBlock: tokens.spacing['2_5'],
      paddingInline: tokens.spacing['3_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.card,
    },
    '& .dg-node-strong': {
      borderColor: tokens.color.lineStrong,
    },
    '& .dg-node-title': {
      fontWeight: tokens.fontWeight.medium,
      whiteSpace: 'nowrap',
    },
    // A weight or threshold at the end of a card; the threshold is filled.
    '& .dg-value': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minInlineSize: tokens.spacing['5'],
      blockSize: tokens.spacing['5'],
      marginInlineStart: tokens.spacing['1'],
      paddingInline: tokens.spacing['1_5'],
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.container,
      fontFamily: tokens.fontFamily.mono,
      fontSize: tokens.fontSize.xs,
    },
    '& .dg-node-strong .dg-value': {
      backgroundColor: tokens.color.foreground,
      color: tokens.color.background,
    },
    // A drawn arrow. The label and note rows are equal, so the line sits on the cards' center.
    '& .dg-link': {
      display: 'grid',
      gridTemplateRows: '1fr auto 1fr',
      justifyItems: 'center',
      rowGap: tokens.spacing['1'],
      minInlineSize: tokens.spacing['24'],
      paddingInline: tokens.spacing['1'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      lineHeight: tokens.lineHeight.none,
    },
    '& .dg-link-label': {
      alignSelf: 'end',
      color: tokens.color.foreground,
      whiteSpace: 'nowrap',
    },
    '& .dg-link-note': {
      alignSelf: 'start',
      fontSize: tokens.fontSize.xs,
      whiteSpace: 'nowrap',
    },
    '& .dg-link-line': {
      display: 'flex',
      alignItems: 'center',
      inlineSize: '100%',
      color: tokens.color.muted,
    },
    '& .dg-link-rule': {
      flexGrow: 1,
      blockSize: '1px',
      backgroundColor: tokens.color.muted,
    },
    '& .dg-link-head': {
      flexShrink: 0,
      inlineSize: '6px',
      blockSize: '10px',
      // design-exception: Pulls the chevron's tip onto the end of the line.
      marginInlineStart: '-5px !custom',
    },
    // Rows of from → to on one grid.
    '& .dg-flow': {
      display: 'grid',
      gridTemplateColumns: 'max-content max-content max-content',
      alignItems: 'center',
      columnGap: tokens.spacing['3'],
      rowGap: tokens.spacing['4'],
    },
    '& .dg-flow-from': {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    '& .dg-flow-to': {
      display: 'flex',
    },
    '& .dg-stack': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: tokens.spacing['4'],
    },
    '& .dg-stack > .dg-node': {
      justifyContent: 'center',
    },
    // A stem from each card in the row down into the card both share.
    '& .dg-stack-shared .dg-flow .dg-node': {
      position: 'relative',
    },
    '& .dg-stack-shared .dg-flow .dg-node::after': {
      content: '""',
      position: 'absolute',
      insetBlockStart: '100%',
      insetInlineStart: '50%',
      inlineSize: '1px',
      blockSize: tokens.spacing['4'],
      backgroundColor: tokens.color.lineStrong,
    },
    // One card on the left whose arrows fan out to two cards.
    // A stem from the card meets a bar that spans the two rows' centers; each arrow starts on it.
    '& .dg-fan': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .dg-fan-stem': {
      inlineSize: tokens.spacing['5'],
      blockSize: '1px',
      backgroundColor: tokens.color.muted,
    },
    '& .dg-fan-branches': {
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'max-content max-content',
      gridAutoRows: '1fr',
      alignItems: 'center',
      columnGap: tokens.spacing['3'],
      rowGap: tokens.spacing['3'],
    },
    '& .dg-fan-branches::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: tokens.spacing['0'],
      // design-exception: Equal rows put each arrow on a quarter line of the grid.
      insetBlock: 'calc(25% - 3px) !custom',
      inlineSize: '1px',
      backgroundColor: tokens.color.muted,
    },
    '& .dg-fan-branches > .dg-link': {
      paddingInline: tokens.spacing['0'],
    },
    '& .dg-fan-branches > .dg-node': {
      justifySelf: 'start',
    },
    // A single line of cards and arrows.
    // Arrows stay with the card they point to, so a wrapped chain never ends on an arrow.
    '& .dg-chain': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['3'],
    },
    '& .dg-then': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['3'],
    },
    // Equal columns joined into, or split from, one card by a bracket.
    '& .dg-fork': {
      display: 'grid',
      justifyItems: 'center',
      inlineSize: '100%',
      // design-exception: Caps the fork so its equal columns stay compact on wide pages.
      maxInlineSize: '520px !custom',
    },
    '& .dg-fork-top, & .dg-fork-bottom': {
      display: 'grid',
      gridAutoColumns: 'minmax(0, 1fr)',
      gridAutoFlow: 'column',
      alignItems: 'stretch',
      justifyItems: 'stretch',
      gap: tokens.spacing['3'],
      inlineSize: '100%',
    },
    '& .dg-fork-join .dg-fork-bottom, & .dg-fork-split .dg-fork-top': {
      display: 'flex',
      justifyContent: 'center',
    },
    '& .dg-fork-split .dg-fork-bottom': {
      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
      gridAutoFlow: 'row',
    },
    '& .dg-fork-top > .dg-node, & .dg-fork-bottom > .dg-node': {
      justifyContent: 'center',
    },
    // The bracket spans from the first column's center to the last column's center, with a
    // stem from its middle.
    '& .dg-fork-bracket': {
      position: 'relative',
      display: 'block',
      inlineSize: '100%',
      blockSize: tokens.spacing['6'],
    },
    '& .dg-fork-bracket::before': {
      content: '""',
      position: 'absolute',
      insetInline: 'calc(100% / 6)',
      blockSize: '50%',
      borderColor: tokens.color.lineStrong,
      borderStyle: 'solid',
      borderWidth: tokens.borderWidth.none,
      borderInlineWidth: tokens.borderWidth.hairline,
    },
    '& .dg-fork-join .dg-fork-bracket::before': {
      insetBlockStart: tokens.spacing['0'],
      borderBlockEndWidth: tokens.borderWidth.hairline,
    },
    '& .dg-fork-split .dg-fork-bracket::before': {
      insetBlockEnd: tokens.spacing['0'],
      borderBlockStartWidth: tokens.borderWidth.hairline,
      // design-exception: The split's two columns sit either side of a narrow "or", so their
      // centers fall a quarter in from each edge.
      insetInline: '25% !custom',
    },
    '& .dg-fork-bracket::after': {
      content: '""',
      position: 'absolute',
      insetInlineStart: '50%',
      inlineSize: '1px',
      blockSize: '50%',
      backgroundColor: tokens.color.lineStrong,
    },
    '& .dg-fork-join .dg-fork-bracket::after': {
      insetBlockEnd: tokens.spacing['0'],
    },
    '& .dg-fork-split .dg-fork-bracket::after': {
      insetBlockStart: tokens.spacing['0'],
    },
    '& .dg-or': {
      alignSelf: 'center',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    // Short labels inside a card, or after an arrow.
    '& .dg-tags': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: tokens.spacing['1_5'],
    },
    '& .dg-tag': {
      display: 'inline-flex',
      alignItems: 'center',
      paddingBlock: tokens.spacing['1'],
      paddingInline: tokens.spacing['2_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      fontSize: tokens.fontSize.compact,
      whiteSpace: 'nowrap',
    },
    '& .dg-panel .dg-tag': {
      backgroundColor: tokens.color.container,
    },
    // Titled cards holding tags.
    '& .dg-panels': {
      display: 'grid',
      gap: tokens.spacing['3'],
    },
    '& .dg-panel': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing['2_5'],
      paddingBlock: tokens.spacing['3_5'],
      paddingInline: tokens.spacing['4'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.card,
    },
    '& .dg-panel-quiet': {
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      backgroundColor: 'transparent !custom',
    },
    '& .dg-panel-head': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      fontWeight: tokens.fontWeight.medium,
    },
  },
  // On a phone, diagrams stay wide: cards drop their icons and tighten, and arrows shorten.
  '@container (width < 560px)': {
    selectors: {
      '&': {
        fontSize: tokens.fontSize.compact,
      },
      '& .dg-node > .dg-icon, & .dg-panel-head > .dg-icon': {
        display: 'none',
      },
      '& .dg-node': {
        gap: tokens.spacing['1_5'],
        paddingBlock: tokens.spacing['2'],
        paddingInline: tokens.spacing['2_5'],
      },
      '& .dg-node-title': {
        whiteSpace: 'normal',
      },
      '& .dg-link': {
        minInlineSize: tokens.spacing['12'],
        paddingInline: tokens.spacing['0'],
        fontSize: tokens.fontSize.xs,
      },
      '& .dg-link-note': {
        fontSize: tokens.fontSize.caption,
      },
      '& .dg-flow, & .dg-chain, & .dg-then, & .dg-fan-branches': {
        columnGap: tokens.spacing['2'],
      },
      '& .dg-fan-stem': {
        inlineSize: tokens.spacing['3'],
      },
      '& .dg-fork-top, & .dg-fork-bottom': {
        gap: tokens.spacing['2'],
      },
      '& .dg-fork-top > .dg-node, & .dg-fork-bottom > .dg-node': {
        paddingInline: tokens.spacing['1_5'],
      },
      // Three signers share a row, so their cards use the smaller size.
      '& .dg-fork-join .dg-node-title': {
        fontSize: tokens.fontSize.xs,
        whiteSpace: 'nowrap',
      },
      '& .dg-fork-join .dg-value': {
        marginInlineStart: tokens.spacing['0'],
      },
      // The chain's last step drops below the access key: a down arrow, then its limits.
      '& .dg-chain': {
        display: 'grid',
        gridTemplateColumns: 'max-content max-content max-content',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: tokens.spacing['1'],
      },
      '& .dg-chain > .dg-then': {
        display: 'contents',
      },
      // The access key and the down arrow share a column, centered on each other.
      '& .dg-chain > .dg-then > .dg-node': {
        justifySelf: 'center',
      },
      '& .dg-chain > .dg-then:last-child > .dg-link': {
        gridColumn: '3',
        gridRow: '2',
        gridTemplateRows: 'auto',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        columnGap: tokens.spacing['2'],
        minInlineSize: tokens.spacing['0'],
        paddingBlock: tokens.spacing['1'],
      },
      '& .dg-chain > .dg-then:last-child .dg-link-label': {
        justifySelf: 'end',
        alignSelf: 'center',
      },
      '& .dg-chain > .dg-then:last-child .dg-link-line': {
        flexDirection: 'column',
        inlineSize: 'auto',
        blockSize: tokens.spacing['6'],
      },
      '& .dg-chain > .dg-then:last-child .dg-link-rule': {
        inlineSize: '1px',
        blockSize: 'auto',
      },
      '& .dg-chain > .dg-then:last-child .dg-link-head': {
        marginInlineStart: tokens.spacing['0'],
        // design-exception: Pulls the rotated chevron's tip onto the end of the vertical line.
        marginBlockStart: '-7px !custom',
        transform: 'rotate(90deg)',
      },
      '& .dg-chain > .dg-then:last-child > .dg-tags': {
        gridColumn: '1 / -1',
        gridRow: '3',
        justifySelf: 'end',
      },
      // Side columns shrink to wrap long titles; the arrow column keeps its label on one line.
      '& .dg-flow': {
        gridTemplateColumns: 'fit-content(40%) max-content fit-content(40%)',
      },
      '& .dg-panel': {
        paddingBlock: tokens.spacing['3'],
        paddingInline: tokens.spacing['3'],
      },
    },
  },
  // Below phone width, flows and chains stack with downward arrows, and forks stack their columns.
  '@container (width < 340px)': {
    selectors: {
      '& .dg-flow': {
        gridTemplateColumns: 'max-content',
        justifyItems: 'center',
        rowGap: tokens.spacing['1'],
      },
      '& .dg-flow-from, & .dg-flow-to': {
        justifyContent: 'center',
      },
      '& .dg-flow-to:not(:last-child)': {
        marginBlockEnd: tokens.spacing['8'],
      },
      '& .dg-chain': {
        flexDirection: 'column',
        gap: tokens.spacing['1'],
      },
      // The fan keeps its horizontal branches; the card moves above them on a vertical stem.
      '& .dg-fan': {
        flexDirection: 'column',
      },
      '& .dg-fan-stem': {
        inlineSize: '1px',
        blockSize: tokens.spacing['4'],
      },
      '& .dg-fan-branches': {
        paddingBlockStart: tokens.spacing['3'],
        borderBlockStartWidth: tokens.borderWidth.hairline,
        borderBlockStartStyle: 'solid',
        borderBlockStartColor: tokens.color.muted,
      },
      '& .dg-fan-branches::before': {
        display: 'none',
      },
      '& .dg-link': {
        gridTemplateRows: 'auto',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        columnGap: tokens.spacing['2'],
        minInlineSize: tokens.spacing['0'],
        paddingBlock: tokens.spacing['1'],
      },
      '& .dg-link-label': {
        justifySelf: 'end',
        alignSelf: 'center',
      },
      '& .dg-link-note': {
        justifySelf: 'start',
        alignSelf: 'center',
      },
      '& .dg-link-line': {
        flexDirection: 'column',
        inlineSize: 'auto',
        blockSize: tokens.spacing['6'],
      },
      '& .dg-link-rule': {
        inlineSize: '1px',
        blockSize: 'auto',
      },
      '& .dg-link-head': {
        marginInlineStart: tokens.spacing['0'],
        // design-exception: Pulls the rotated chevron's tip onto the end of the vertical line.
        marginBlockStart: '-7px !custom',
        transform: 'rotate(90deg)',
      },
      '& .dg-fan-branches > .dg-link': {
        gridTemplateRows: '1fr auto 1fr',
        gridTemplateColumns: 'auto',
        minInlineSize: tokens.spacing['20'],
        paddingBlock: tokens.spacing['0'],
      },
      '& .dg-fan-branches .dg-link-label': {
        justifySelf: 'center',
        alignSelf: 'end',
      },
      '& .dg-fan-branches .dg-link-line': {
        flexDirection: 'row',
        inlineSize: '100%',
        blockSize: 'auto',
      },
      '& .dg-fan-branches .dg-link-rule': {
        inlineSize: 'auto',
        blockSize: '1px',
      },
      '& .dg-fan-branches .dg-link-head': {
        marginBlockStart: tokens.spacing['0'],
        // design-exception: Pulls the chevron's tip onto the end of the line.
        marginInlineStart: '-5px !custom',
        transform: 'none',
      },
      '& .dg-fork-split .dg-or': {
        justifySelf: 'center',
      },
      '& .dg-fork-top, & .dg-fork-split .dg-fork-bottom': {
        gridAutoFlow: 'row',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['2'],
      },
      '& .dg-fork-bracket': {
        inlineSize: '1px',
        blockSize: tokens.spacing['4'],
        backgroundColor: tokens.color.lineStrong,
      },
      '& .dg-fork-bracket::before, & .dg-fork-bracket::after': {
        display: 'none',
      },
    },
  },
})
