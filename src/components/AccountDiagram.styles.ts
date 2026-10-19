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
    '& .ad-canvas': {
      containerType: 'inline-size',
      display: 'flex',
      justifyContent: 'center',
    },
    '& .ad-icon': {
      flexShrink: 0,
      inlineSize: '16px',
      blockSize: '16px',
      color: tokens.color.muted,
    },
    // Cards
    '& .ad-node': {
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
    '& .ad-node-strong': {
      borderColor: tokens.color.lineStrong,
    },
    '& .ad-node-title': {
      fontWeight: tokens.fontWeight.medium,
      whiteSpace: 'nowrap',
    },
    // A weight or threshold at the end of a card; the threshold is filled.
    '& .ad-value': {
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
    '& .ad-node-strong .ad-value': {
      backgroundColor: tokens.color.foreground,
      color: tokens.color.background,
    },
    // A drawn arrow. The label and note rows are equal, so the line sits on the cards' center.
    '& .ad-link': {
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
    '& .ad-link-label': {
      alignSelf: 'end',
      color: tokens.color.foreground,
      whiteSpace: 'nowrap',
    },
    '& .ad-link-note': {
      alignSelf: 'start',
      fontSize: tokens.fontSize.xs,
      whiteSpace: 'nowrap',
    },
    '& .ad-link-line': {
      display: 'flex',
      alignItems: 'center',
      inlineSize: '100%',
      color: tokens.color.muted,
    },
    '& .ad-link-rule': {
      flexGrow: 1,
      blockSize: '1px',
      backgroundColor: tokens.color.muted,
    },
    '& .ad-link-head': {
      flexShrink: 0,
      inlineSize: '6px',
      blockSize: '10px',
      // design-exception: Pulls the chevron's tip onto the end of the line.
      marginInlineStart: '-5px !custom',
    },
    // Rows of from → to on one grid.
    '& .ad-flow': {
      display: 'grid',
      gridTemplateColumns: 'max-content max-content max-content',
      alignItems: 'center',
      columnGap: tokens.spacing['3'],
      rowGap: tokens.spacing['4'],
    },
    '& .ad-flow-from': {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    '& .ad-flow-to': {
      display: 'flex',
    },
    '& .ad-stack': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: tokens.spacing['4'],
    },
    '& .ad-stack > .ad-node': {
      justifyContent: 'center',
    },
    // A stem from each card in the row down into the card both share.
    '& .ad-stack-shared .ad-flow .ad-node': {
      position: 'relative',
    },
    '& .ad-stack-shared .ad-flow .ad-node::after': {
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
    '& .ad-fan': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .ad-fan-stem': {
      inlineSize: tokens.spacing['5'],
      blockSize: '1px',
      backgroundColor: tokens.color.muted,
    },
    '& .ad-fan-branches': {
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'max-content max-content',
      gridAutoRows: '1fr',
      alignItems: 'center',
      columnGap: tokens.spacing['3'],
      rowGap: tokens.spacing['3'],
    },
    '& .ad-fan-branches::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: tokens.spacing['0'],
      // design-exception: Equal rows put each arrow on a quarter line of the grid.
      insetBlock: 'calc(25% - 3px) !custom',
      inlineSize: '1px',
      backgroundColor: tokens.color.muted,
    },
    '& .ad-fan-branches > .ad-link': {
      paddingInline: tokens.spacing['0'],
    },
    '& .ad-fan-branches > .ad-node': {
      justifySelf: 'start',
    },
    // A single line of cards and arrows.
    // Arrows stay with the card they point to, so a wrapped chain never ends on an arrow.
    '& .ad-chain': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['3'],
    },
    '& .ad-then': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['3'],
    },
    // Equal columns joined into, or split from, one card by a bracket.
    '& .ad-fork': {
      display: 'grid',
      justifyItems: 'center',
      inlineSize: '100%',
      // design-exception: Caps the fork so its equal columns stay compact on wide pages.
      maxInlineSize: '520px !custom',
    },
    '& .ad-fork-top, & .ad-fork-bottom': {
      display: 'grid',
      gridAutoColumns: 'minmax(0, 1fr)',
      gridAutoFlow: 'column',
      alignItems: 'stretch',
      justifyItems: 'stretch',
      gap: tokens.spacing['3'],
      inlineSize: '100%',
    },
    '& .ad-fork-join .ad-fork-bottom, & .ad-fork-split .ad-fork-top': {
      display: 'flex',
      justifyContent: 'center',
    },
    '& .ad-fork-split .ad-fork-bottom': {
      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
      gridAutoFlow: 'row',
    },
    '& .ad-fork-top > .ad-node, & .ad-fork-bottom > .ad-node': {
      justifyContent: 'center',
    },
    // The bracket spans from the first column's center to the last column's center, with a
    // stem from its middle.
    '& .ad-fork-bracket': {
      position: 'relative',
      display: 'block',
      inlineSize: '100%',
      blockSize: tokens.spacing['6'],
    },
    '& .ad-fork-bracket::before': {
      content: '""',
      position: 'absolute',
      insetInline: 'calc(100% / 6)',
      blockSize: '50%',
      borderColor: tokens.color.lineStrong,
      borderStyle: 'solid',
      borderWidth: tokens.borderWidth.none,
      borderInlineWidth: tokens.borderWidth.hairline,
    },
    '& .ad-fork-join .ad-fork-bracket::before': {
      insetBlockStart: tokens.spacing['0'],
      borderBlockEndWidth: tokens.borderWidth.hairline,
    },
    '& .ad-fork-split .ad-fork-bracket::before': {
      insetBlockEnd: tokens.spacing['0'],
      borderBlockStartWidth: tokens.borderWidth.hairline,
      // design-exception: The split's two columns sit either side of a narrow "or", so their
      // centers fall a quarter in from each edge.
      insetInline: '25% !custom',
    },
    '& .ad-fork-bracket::after': {
      content: '""',
      position: 'absolute',
      insetInlineStart: '50%',
      inlineSize: '1px',
      blockSize: '50%',
      backgroundColor: tokens.color.lineStrong,
    },
    '& .ad-fork-join .ad-fork-bracket::after': {
      insetBlockEnd: tokens.spacing['0'],
    },
    '& .ad-fork-split .ad-fork-bracket::after': {
      insetBlockStart: tokens.spacing['0'],
    },
    '& .ad-or': {
      alignSelf: 'center',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    // Short labels inside a card, or after an arrow.
    '& .ad-tags': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: tokens.spacing['1_5'],
    },
    '& .ad-tag': {
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
    '& .ad-panel .ad-tag': {
      backgroundColor: tokens.color.container,
    },
    // Titled cards holding tags.
    '& .ad-panels': {
      display: 'grid',
      gap: tokens.spacing['3'],
    },
    '& .ad-panel': {
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
    '& .ad-panel-quiet': {
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      backgroundColor: 'transparent !custom',
    },
    '& .ad-panel-head': {
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
      '& .ad-node > .ad-icon, & .ad-panel-head > .ad-icon': {
        display: 'none',
      },
      '& .ad-node': {
        gap: tokens.spacing['1_5'],
        paddingBlock: tokens.spacing['2'],
        paddingInline: tokens.spacing['2_5'],
      },
      '& .ad-node-title': {
        whiteSpace: 'normal',
      },
      '& .ad-link': {
        minInlineSize: tokens.spacing['12'],
        paddingInline: tokens.spacing['0'],
        fontSize: tokens.fontSize.xs,
      },
      '& .ad-link-note': {
        fontSize: tokens.fontSize.caption,
      },
      '& .ad-flow, & .ad-chain, & .ad-then, & .ad-fan-branches': {
        columnGap: tokens.spacing['2'],
      },
      '& .ad-fan-stem': {
        inlineSize: tokens.spacing['3'],
      },
      '& .ad-fork-top, & .ad-fork-bottom': {
        gap: tokens.spacing['2'],
      },
      '& .ad-fork-top > .ad-node, & .ad-fork-bottom > .ad-node': {
        paddingInline: tokens.spacing['1_5'],
      },
      // Three signers share a row, so their cards use the smaller size.
      '& .ad-fork-join .ad-node-title': {
        fontSize: tokens.fontSize.xs,
        whiteSpace: 'nowrap',
      },
      '& .ad-fork-join .ad-value': {
        marginInlineStart: tokens.spacing['0'],
      },
      // The chain's last step drops below the access key: a down arrow, then its limits.
      '& .ad-chain': {
        display: 'grid',
        gridTemplateColumns: 'max-content max-content max-content',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: tokens.spacing['1'],
      },
      '& .ad-chain > .ad-then': {
        display: 'contents',
      },
      // The access key and the down arrow share a column, centered on each other.
      '& .ad-chain > .ad-then > .ad-node': {
        justifySelf: 'center',
      },
      '& .ad-chain > .ad-then:last-child > .ad-link': {
        gridColumn: '3',
        gridRow: '2',
        gridTemplateRows: 'auto',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        columnGap: tokens.spacing['2'],
        minInlineSize: tokens.spacing['0'],
        paddingBlock: tokens.spacing['1'],
      },
      '& .ad-chain > .ad-then:last-child .ad-link-label': {
        justifySelf: 'end',
        alignSelf: 'center',
      },
      '& .ad-chain > .ad-then:last-child .ad-link-line': {
        flexDirection: 'column',
        inlineSize: 'auto',
        blockSize: tokens.spacing['6'],
      },
      '& .ad-chain > .ad-then:last-child .ad-link-rule': {
        inlineSize: '1px',
        blockSize: 'auto',
      },
      '& .ad-chain > .ad-then:last-child .ad-link-head': {
        marginInlineStart: tokens.spacing['0'],
        // design-exception: Pulls the rotated chevron's tip onto the end of the vertical line.
        marginBlockStart: '-7px !custom',
        transform: 'rotate(90deg)',
      },
      '& .ad-chain > .ad-then:last-child > .ad-tags': {
        gridColumn: '1 / -1',
        gridRow: '3',
        justifySelf: 'end',
      },
      // Side columns shrink to wrap long titles; the arrow column keeps its label on one line.
      '& .ad-flow': {
        gridTemplateColumns: 'fit-content(40%) max-content fit-content(40%)',
      },
      '& .ad-panel': {
        paddingBlock: tokens.spacing['3'],
        paddingInline: tokens.spacing['3'],
      },
    },
  },
  // Below phone width, flows and chains stack with downward arrows, and forks stack their columns.
  '@container (width < 340px)': {
    selectors: {
      '& .ad-flow': {
        gridTemplateColumns: 'max-content',
        justifyItems: 'center',
        rowGap: tokens.spacing['1'],
      },
      '& .ad-flow-from, & .ad-flow-to': {
        justifyContent: 'center',
      },
      '& .ad-flow-to:not(:last-child)': {
        marginBlockEnd: tokens.spacing['8'],
      },
      '& .ad-chain': {
        flexDirection: 'column',
        gap: tokens.spacing['1'],
      },
      // The fan keeps its horizontal branches; the card moves above them on a vertical stem.
      '& .ad-fan': {
        flexDirection: 'column',
      },
      '& .ad-fan-stem': {
        inlineSize: '1px',
        blockSize: tokens.spacing['4'],
      },
      '& .ad-fan-branches': {
        paddingBlockStart: tokens.spacing['3'],
        borderBlockStartWidth: tokens.borderWidth.hairline,
        borderBlockStartStyle: 'solid',
        borderBlockStartColor: tokens.color.muted,
      },
      '& .ad-fan-branches::before': {
        display: 'none',
      },
      '& .ad-link': {
        gridTemplateRows: 'auto',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        columnGap: tokens.spacing['2'],
        minInlineSize: tokens.spacing['0'],
        paddingBlock: tokens.spacing['1'],
      },
      '& .ad-link-label': {
        justifySelf: 'end',
        alignSelf: 'center',
      },
      '& .ad-link-note': {
        justifySelf: 'start',
        alignSelf: 'center',
      },
      '& .ad-link-line': {
        flexDirection: 'column',
        inlineSize: 'auto',
        blockSize: tokens.spacing['6'],
      },
      '& .ad-link-rule': {
        inlineSize: '1px',
        blockSize: 'auto',
      },
      '& .ad-link-head': {
        marginInlineStart: tokens.spacing['0'],
        // design-exception: Pulls the rotated chevron's tip onto the end of the vertical line.
        marginBlockStart: '-7px !custom',
        transform: 'rotate(90deg)',
      },
      '& .ad-fan-branches > .ad-link': {
        gridTemplateRows: '1fr auto 1fr',
        gridTemplateColumns: 'auto',
        minInlineSize: tokens.spacing['20'],
        paddingBlock: tokens.spacing['0'],
      },
      '& .ad-fan-branches .ad-link-label': {
        justifySelf: 'center',
        alignSelf: 'end',
      },
      '& .ad-fan-branches .ad-link-line': {
        flexDirection: 'row',
        inlineSize: '100%',
        blockSize: 'auto',
      },
      '& .ad-fan-branches .ad-link-rule': {
        inlineSize: 'auto',
        blockSize: '1px',
      },
      '& .ad-fan-branches .ad-link-head': {
        marginBlockStart: tokens.spacing['0'],
        // design-exception: Pulls the chevron's tip onto the end of the line.
        marginInlineStart: '-5px !custom',
        transform: 'none',
      },
      '& .ad-fork-split .ad-or': {
        justifySelf: 'center',
      },
      '& .ad-fork-top, & .ad-fork-split .ad-fork-bottom': {
        gridAutoFlow: 'row',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['2'],
      },
      '& .ad-fork-bracket': {
        inlineSize: '1px',
        blockSize: tokens.spacing['4'],
        backgroundColor: tokens.color.lineStrong,
      },
      '& .ad-fork-bracket::before, & .ad-fork-bracket::after': {
        display: 'none',
      },
    },
  },
})
