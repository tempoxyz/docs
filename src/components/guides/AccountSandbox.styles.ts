import { inherited } from '../../styles/inherited'
import { pulse as pulseMotion } from '../../styles/motion'
import { style } from '../../styles/scoped'
import { vars as tokens } from '../../styles/theme'

/**
 * Account sandbox: the account's state, actions below it, then its history. It follows the account
 * diagrams: monochrome cards with hairline borders, muted labels, and color only for errors. The
 * builder and the guide demos share these semantic `as-*` hooks, so the rules stay scoped to the
 * sandbox root.
 */
export const accountSandbox = style({
  display: 'grid',
  gap: tokens.spacing['5'],
  minWidth: 0,
  color: tokens.color.foreground,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.snug,
  // Button and icon resets sit in the components layer with zero-specificity scopes, below the
  // docs Button's own rules. Unlayered, `color: inherit` would leave black text on black buttons.
  '@layer components': {
    selectors: {
      ':where(&) button': {
        font: 'inherit',
        color: 'inherit !custom',
        cursor: 'pointer',
      },
      ':where(&) button:disabled': {
        cursor: 'default',
        opacity: 0.45,
      },
      ':where(&) svg': {
        width: '16px',
        height: '16px',
        flexShrink: 0,
      },
    },
  },
  selectors: {
    ':where(&) :is(p, ul, ol)': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    '& .as-label, & .as-muted, & .as-note, & .as-field-label': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-hidden': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
    },

    // Account state
    '& .as-state': {
      display: 'grid',
      gap: tokens.spacing['4'],
    },
    '& .as-state-head': {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: tokens.spacing['3'],
      minWidth: 0,
    },
    '& .as-state-name': {
      display: 'grid',
      gap: tokens.spacing['0_5'],
      minWidth: 0,
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-address': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.normal,
    },
    '& .as-address code': {
      padding: 0,
      border: 0,
      backgroundColor: 'transparent !custom',
      color: 'inherit !custom',
      fontFamily: tokens.fontFamily.mono,
      fontSize: tokens.fontSize.xs,
    },
    '& .as-address > * + *::before': {
      content: '" · "',
      whiteSpace: 'pre',
    },
    // While a devnet request runs: the status after the address and the balance pulse, and the
    // locked cards dim.
    '& :is(.as-badge, .as-balance)[data-pending="true"]': {
      animation: `${pulseMotion} 1.4s ease-in-out infinite`,
    },
    '& .as-badge[data-pending="true"]': {
      display: 'inline-flex',
      alignItems: 'center',
      alignSelf: 'center',
      gap: tokens.spacing['1_5'],
      marginInlineStart: tokens.spacing['2'],
      color: tokens.color.foreground,
    },
    '& .as-badge[data-pending="true"]::before': {
      content: '""',
      width: '6px',
      height: '6px',
      borderRadius: tokens.radius.round,
      backgroundColor: tokens.color.foreground,
    },
    '&[aria-busy="true"] :is(.as-state-columns, .as-panel)': {
      opacity: 0.55,
    },
    '& :is(.as-state-columns, .as-panel)': {
      transitionProperty: 'opacity',
      transitionDuration: '150ms',
    },
    '& .as-balance': {
      fontWeight: tokens.fontWeight.medium,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    '& .as-state-columns': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: tokens.spacing['4'],
    },
    '& .as-state-columns > div': {
      display: 'grid',
      alignContent: 'start',
      gap: tokens.spacing['2'],
      minWidth: 0,
    },
    '& .as-state-list': {
      display: 'grid',
      gap: tokens.spacing['2'],
    },
    // Where the first signer or access key will appear.
    '& .as-slot': {
      display: 'grid',
      minHeight: '58px',
      placeItems: 'center',
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.lg,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-item': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2_5'],
      minWidth: 0,
      minHeight: '58px',
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.card,
    },
    // Just added: a stronger border, nothing more.
    '& .as-item[data-change="added"]': {
      borderColor: tokens.color.lineStrong,
    },
    '& .as-item:is([data-status="lost"], [data-status="expired"], [data-status="paused"], [data-change="removed"])':
      {
        opacity: 0.6,
      },
    '& .as-item[data-change="removed"] :is(.as-item-name, .as-item-detail)': {
      textDecoration: 'line-through',
    },
    '& .as-icon': {
      display: 'grid',
      flexShrink: 0,
      placeItems: 'center',
      color: tokens.color.muted,
    },
    '& .as-item-text': {
      display: 'grid',
      flex: 1,
      gap: tokens.spacing['0_5'],
      minWidth: 0,
    },
    '& .as-item-name': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      gap: tokens.spacing['1_5'],
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-item-detail': {
      overflow: 'hidden',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& .as-tag': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.normal,
    },
    // A column's label, with its control (the threshold) at the end.
    '& .as-column-head': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing['3'],
      minHeight: '28px',
    },
    // Controls on a signer or key card: its weight stepper, Remove, or Revoke.
    '& .as-item-controls': {
      display: 'inline-flex',
      flexShrink: 0,
      alignSelf: 'center',
      alignItems: 'center',
      gap: tokens.spacing['3'],
    },
    // A key card runs three lines, so its icon and Revoke sit on the title's line.
    '& .as-item:has(.as-limit, .as-item-secret)': {
      alignItems: 'flex-start',
    },
    '& .as-item:has(.as-limit, .as-item-secret) :is(.as-icon, .as-item-controls)': {
      alignSelf: 'flex-start',
      // design-exception: Centers a 16px icon or a link on the 20px title line.
      marginTop: '2px !custom',
    },
    // A generated private key on its card, shown once.
    // The key gets its own full-width row, lined up under the card's title.
    '& .as-item:has(.as-item-secret)': {
      flexWrap: 'wrap',
      rowGap: tokens.spacing['1'],
    },
    '& .as-item .as-item-secret': {
      display: 'grid',
      flexBasis: '100%',
      gridTemplateColumns: 'minmax(0, 1fr) auto auto',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      minWidth: 0,
      // design-exception: Indents past the 16px icon and its 10px gap to line up with the title.
      paddingInlineStart: '26px !custom',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    '& .as-item .as-item-secret .as-item-secret-value': {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      color: tokens.color.foreground,
      fontFamily: tokens.fontFamily.mono,
      fontSize: tokens.fontSize.xs,
      textOverflow: 'ellipsis',
      userSelect: 'all',
    },
    '& .as-item .as-item-secret-note': {
      flexShrink: 0,
      fontFamily: tokens.fontFamily.sans,
      whiteSpace: 'nowrap',
    },
    '& :is(.as-item-controls, .as-column-head) .as-stepper button': {
      width: '26px',
      height: '26px',
    },
    '& :is(.as-item-controls, .as-column-head) .as-stepper-value': {
      minWidth: tokens.spacing['14'],
      fontSize: tokens.fontSize.xs,
    },
    // Add signer and Add access key: a ghost card under the column.
    '& .as-state-columns .as-add': {
      justifySelf: 'stretch',
      justifyContent: 'center',
      minHeight: '44px',
      borderRadius: tokens.radius.lg,
    },
    '& .as-state-columns .as-add:has(select:disabled)': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '& .as-weight': {
      flexShrink: 0,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      fontVariantNumeric: 'tabular-nums',
    },
    '& .as-limit': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      marginTop: tokens.spacing['1'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      fontVariantNumeric: 'tabular-nums',
    },
    '& .as-limit-bar': {
      flexShrink: 0,
      width: tokens.spacing['16'],
      height: tokens.spacing['1'],
      overflow: 'hidden',
      borderRadius: tokens.radius.xs,
      backgroundColor: tokens.color.line,
    },
    '& .as-limit-bar span': {
      display: 'block',
      height: '100%',
      backgroundColor: tokens.color.muted,
    },

    // Notices: short muted lines; only errors take color.
    '& .as-notices': {
      display: 'grid',
      gap: tokens.spacing['1'],
    },
    '& .as-notices li': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: tokens.spacing['2'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-notices li[data-tone="error"]': {
      color: tokens.color.red11,
    },
    '& .as-notices svg': {
      width: '14px',
      height: '14px',
    },

    // Actions panel
    '& .as-panel': {
      display: 'grid',
      gap: tokens.spacing['4'],
      paddingTop: tokens.spacing['5'],
      borderTopWidth: tokens.borderWidth.hairline,
      borderTopStyle: 'solid',
      borderTopColor: tokens.color.line,
    },
    '& .as-segmented': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      gap: tokens.spacing['0_5'],
      minWidth: 0,
      margin: 0,
      padding: tokens.spacing['0_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
    },
    '& .as-segmented button': {
      minHeight: '28px',
      paddingBlock: 0,
      paddingInline: tokens.spacing['3'],
      border: 0,
      borderRadius: tokens.radius.md,
      backgroundColor: 'transparent !custom',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      whiteSpace: 'nowrap',
    },
    '& .as-segmented button:hover': {
      color: tokens.color.foreground,
    },
    '& .as-segmented button[aria-pressed="true"]': {
      backgroundColor: tokens.color.container,
      color: tokens.color.foreground,
    },
    '& .as-panel-body': {
      display: 'grid',
      gap: tokens.spacing['4'],
    },
    '& .as-field': {
      display: 'grid',
      gridTemplateColumns: '112px minmax(0, 1fr)',
      alignItems: 'baseline',
      gap: tokens.spacing['3'],
    },
    // Centers the label on the first row of 32px controls.
    '& .as-field > .as-field-label': {
      display: 'flex',
      alignItems: 'center',
      minHeight: '32px',
    },
    '& .as-field-control': {
      display: 'grid',
      justifyItems: 'start',
      gap: tokens.spacing['2_5'],
      minWidth: 0,
    },
    '& .as-choices': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['2'],
    },
    '& .as-choice': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      minHeight: '32px',
      paddingBlock: 0,
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.md,
      backgroundColor: 'transparent !custom',
      fontSize: tokens.fontSize.compact,
    },
    '& .as-choice:hover': {
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
    },
    '& .as-choice[aria-pressed="true"]': {
      borderColor: tokens.color.foreground,
      backgroundColor: tokens.color.container,
    },
    '& .as-choice svg, & .as-button svg, & .as-add svg': {
      width: '14px',
      height: '14px',
    },
    '& .as-or': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    '& .as-amount': {
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: '32px',
      fontVariantNumeric: 'tabular-nums',
    },
    '& .as-outcome': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['3'],
    },
    '& .as-meter': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
    },
    '& .as-meter-bar': {
      display: 'inline-flex',
      gap: tokens.spacing['0_5'],
    },
    '& .as-meter-bar span': {
      width: tokens.spacing['4'],
      height: tokens.spacing['1_5'],
      borderRadius: tokens.radius.xs,
      backgroundColor: tokens.color.line,
    },
    '& .as-meter-bar span[data-on="true"]': {
      backgroundColor: tokens.color.foreground,
    },
    '& .as-meter-label': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    '& .as-result': {
      display: 'inline-flex',
      flex: 1,
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      minWidth: '160px',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-result[data-ok="false"]': {
      color: tokens.color.red11,
    },
    '& .as-result svg': {
      width: '14px',
      height: '14px',
    },
    '& .as-button': {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      minHeight: '32px',
      paddingBlock: 0,
      paddingInline: tokens.spacing['3_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.md,
      backgroundColor: 'transparent !custom',
      fontSize: tokens.fontSize.compact,
      whiteSpace: 'nowrap',
    },
    '& .as-button:hover:not(:disabled)': {
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
    },
    '& .as-button-primary': {
      borderColor: tokens.color.foreground,
      backgroundColor: tokens.color.foreground,
      color: tokens.color.background,
    },
    '& .as-button-primary:hover:not(:disabled)': {
      backgroundColor: tokens.color.foreground,
      opacity: 0.88,
    },
    // Rows of a signer or key with its controls, aligned without rules between them.
    '& .as-edit-list': {
      display: 'grid',
      gap: tokens.spacing['2'],
    },
    // The name sits in the field label column, its controls beside it.
    '& .as-edit-list li': {
      display: 'grid',
      gridTemplateColumns: '112px auto auto',
      justifyContent: 'start',
      alignItems: 'center',
      gap: tokens.spacing['3'],
      minHeight: '32px',
    },
    '& .as-edit-name': {
      minWidth: 0,
      overflowWrap: 'anywhere',
    },
    '& .as-link': {
      padding: 0,
      border: 0,
      backgroundColor: 'transparent !custom',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      textDecoration: 'underline',
      textDecorationColor: tokens.color.lineStrong,
      textUnderlineOffset: '3px',
    },
    '& .as-link:hover': {
      color: tokens.color.foreground,
      textDecorationColor: tokens.color.foreground,
    },
    '& .as-stepper': {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.md,
    },
    '& .as-stepper button': {
      display: 'grid',
      width: '30px',
      height: '30px',
      placeItems: 'center',
      border: 0,
      borderRadius: tokens.radius.md,
      backgroundColor: 'transparent !custom',
      color: tokens.color.muted,
    },
    '& .as-stepper button:hover:not(:disabled)': {
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
      color: tokens.color.foreground,
    },
    '& .as-stepper svg': {
      width: '12px',
      height: '12px',
    },
    '& .as-stepper-value': {
      minWidth: tokens.spacing['16'],
      fontSize: tokens.fontSize.compact,
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'center',
    },
    '& .as-add': {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifySelf: 'start',
      gap: tokens.spacing['1_5'],
      minHeight: '32px',
      paddingBlock: 0,
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.md,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      cursor: 'pointer',
    },
    '& .as-add:hover': {
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
      color: tokens.color.foreground,
    },
    '& .as-add select': {
      position: 'absolute',
      inset: 0,
      width: '100%',
      opacity: 0,
      cursor: 'pointer',
    },
    // The backup chooser, opened from the no-backup notice.
    '& .as-backup': {
      display: 'grid',
      justifyItems: 'start',
      gap: tokens.spacing['2'],
    },
    '& .as-fund, & .as-upgrade': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['3'],
    },
    // A sent payment, in place of the send row.
    '& .as-success': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['3'],
      paddingBlock: tokens.spacing['3'],
      paddingInline: tokens.spacing['3_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.card,
    },
    '& .as-success > svg': {
      color: tokens.color.muted,
    },
    '& .as-success-text': {
      display: 'grid',
      flex: 1,
      gap: tokens.spacing['0_5'],
      minWidth: 0,
    },
    '& .as-success-text strong': {
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-success-text span': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },

    // History: a ledger, newest first.
    '& .as-history summary': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      listStyle: 'none',
      cursor: 'pointer',
      userSelect: 'none',
    },
    '& .as-history summary::-webkit-details-marker': {
      display: 'none',
    },
    '& .as-history summary:hover': {
      color: tokens.color.foreground,
    },
    '& .as-history-chevron': {
      width: '14px',
      height: '14px',
      transition: 'transform 150ms ease',
    },
    '& .as-history[open] .as-history-chevron': {
      transform: 'rotate(90deg)',
    },
    '& .as-history-count': {
      fontVariantNumeric: 'tabular-nums',
    },
    '& .as-ledger': {
      display: 'grid',
      marginTop: tokens.spacing['2'],
    },
    '& .as-ledger li': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing['3'],
      minHeight: '40px',
      paddingBlock: tokens.spacing['2'],
    },
    '& .as-ledger li + li': {
      borderTopWidth: tokens.borderWidth.hairline,
      borderTopStyle: 'solid',
      borderTopColor: tokens.color.line,
    },
    '& .as-ledger-text': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      columnGap: tokens.spacing['2'],
      minWidth: 0,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-ledger-title': {
      color: tokens.color.foreground,
    },
    '& .as-ledger-detail': {
      color: tokens.color.muted,
    },

    // Network
    '& .as-lock': {
      display: 'contents',
    },
    '& .as-tx': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['0_5'],
      color: tokens.color.muted,
      fontFamily: tokens.fontFamily.mono,
      fontSize: tokens.fontSize.xs,
      whiteSpace: 'nowrap',
    },
    '& .as-tx code': {
      padding: 0,
      border: 0,
      backgroundColor: 'transparent !custom',
      color: 'inherit !custom',
      font: 'inherit',
    },
    '& .as-tx button': {
      display: 'grid',
      width: '20px',
      height: '20px',
      padding: 0,
      placeItems: 'center',
      border: 0,
      borderRadius: tokens.radius.sm,
      backgroundColor: 'transparent !custom',
      color: 'inherit !custom',
    },
    '& .as-tx button:hover': {
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
      color: tokens.color.foreground,
    },
    '& .as-tx svg': {
      width: '12px',
      height: '12px',
    },
    // A hash chip in the ledger.
    '& .as-ledger .as-tx': {
      flexShrink: 0,
      paddingBlock: tokens.spacing['0_5'],
      paddingInlineStart: tokens.spacing['2'],
      paddingInlineEnd: tokens.spacing['0_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.full,
    },

    // A generated private key, shown once.
    '& .as-secret': {
      display: 'grid',
      gap: tokens.spacing['1_5'],
    },
    '& .as-secret .as-tx': {
      display: 'flex',
      gap: tokens.spacing['1'],
    },
    '& .as-secret input': {
      flex: 1,
      minWidth: 0,
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['2_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      color: tokens.color.foreground,
      font: 'inherit',
      textOverflow: 'ellipsis',
    },

    // Shown instead of the sandbox when this page can't reach devnet.
    '& .as-gate': {
      // design-exception: reserves the empty builder's height so the page doesn't jump when devnet connects.
      minHeight: '238px !custom',
      display: 'grid',
      placeItems: 'center',
      paddingBlock: tokens.spacing['6'],
      paddingInline: 0,
      color: tokens.color.muted,
      textAlign: 'center',
    },
    // Last, so a just-changed value steps up from muted to the foreground color.
    '& [data-changed="true"]': {
      color: tokens.color.foreground,
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& :is(.as-badge, .as-balance)[data-pending="true"]': {
        animation: 'none',
      },
    },
  },
  '@media (width <= 640px)': {
    selectors: {
      '& .as-state-columns': {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
      '& .as-field': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['1_5'],
      },
      '& .as-field > .as-field-label': {
        minHeight: 0,
      },
      '& .as-item-detail': {
        whiteSpace: 'normal',
      },
      '& .as-edit-list li': {
        gridTemplateColumns: 'minmax(0, 1fr) auto auto',
      },
      // On a phone, a card with controls keeps its detail on one line beside them.
      '& .as-item:has(.as-item-controls) .as-item-detail': {
        whiteSpace: 'nowrap',
      },
    },
  },
})

/** A key's remaining limit, as the fill of its limit bar. */
export const accountSandboxLimitFill = style((values: { width: `${number}%` }) => ({
  width: values.width,
}))
