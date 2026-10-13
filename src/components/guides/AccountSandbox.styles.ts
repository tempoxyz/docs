import { inherited } from '../../styles/inherited'
import { style } from '../../styles/scoped'
import { vars as tokens } from '../../styles/theme'

/**
 * Account sandbox: the account's state in one box, actions below it. The builder and the guide
 * demos share these semantic `as-*` hooks, so the rules stay scoped to the sandbox root.
 */
export const accountSandbox = style({
  display: 'grid',
  gap: tokens.spacing['4'],
  minWidth: 0,
  color: tokens.color.foreground,
  fontSize: tokens.fontSize.sm,
  // design-exception: The sandbox's dense rows keep their original 1.45 rhythm between scale steps.
  lineHeight: '1.45 !custom',
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
    '& .as-label': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-muted': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-bad': {
      color: tokens.color.red11,
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
      gap: tokens.spacing['3_5'],
    },
    '& .as-state-head': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['3'],
      minWidth: 0,
    },
    '& .as-state-name': {
      display: 'grid',
      flex: 1,
      minWidth: 0,
      fontSize: tokens.fontSize.body,
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-state-name code': {
      padding: 0,
      border: 0,
      backgroundColor: 'transparent !custom',
      color: tokens.color.muted,
      fontFamily: inherited.fontFamily.vocsFontFamilyMono,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.normal,
    },
    '& .as-address': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      rowGap: 0,
      columnGap: tokens.spacing['1_5'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.normal,
    },
    '& .as-badge::before': {
      content: '"· "',
    },
    '& .as-balance': {
      fontSize: tokens.fontSize.lead,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    '& .as-state-rule': {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr) auto',
      alignItems: 'baseline',
      rowGap: tokens.spacing['1'],
      columnGap: tokens.spacing['3'],
      paddingBlock: tokens.spacing['2_5'],
      paddingInline: 0,
      borderBlockWidth: tokens.borderWidth.hairline,
      borderBlockStyle: 'solid',
      borderBlockColor: tokens.color.line,
    },
    '& .as-state-rule ul': {
      display: 'grid',
      gap: tokens.spacing['0_5'],
    },
    '& .as-state-rule strong': {
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-version': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
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
      gap: tokens.spacing['1_5'],
    },
    '& .as-empty': {
      paddingBlock: tokens.spacing['2'],
      paddingInline: 0,
    },
    // Where the first signer or access key will appear.
    '& .as-slot': {
      display: 'grid',
      minHeight: '52px',
      placeItems: 'center',
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['2_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'dashed',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.lg,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      textAlign: 'center',
    },
    '& .as-item': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['2_5'],
      minWidth: 0,
      paddingBlock: tokens.spacing['2'],
      paddingInline: tokens.spacing['2_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.card,
    },
    '& .as-item:is([data-status="lost"], [data-status="expired"], [data-status="paused"])': {
      opacity: 0.6,
    },
    '& .as-item[data-change="added"]': {
      borderColor: tokens.color.green11,
    },
    '& .as-item[data-change="removed"]': {
      opacity: 0.6,
    },
    '& .as-item[data-change="removed"] :is(.as-item-name, .as-item-detail)': {
      textDecoration: 'line-through',
    },
    '& .as-item:is([data-change="lost"], [data-change="revoked"])': {
      borderColor: tokens.color.red11,
    },
    '& .as-item[data-change="spent"] .as-limit': {
      color: tokens.color.blue11,
    },
    '& .as-icon': {
      display: 'grid',
      flexShrink: 0,
      width: '20px',
      placeItems: 'center',
      color: tokens.color.muted,
    },
    // Brand marks in their brand colors; Apple's mark stays in the text color.
    '& .as-icon[data-kind="google"]': {
      // design-exception: Google's mark keeps its published brand blue in both themes.
      color: '#4285f4 !custom',
    },
    '& .as-icon[data-kind="sms"]': {
      // design-exception: The SMS mark keeps the Messages brand green in both themes.
      color: '#34c759 !custom',
    },
    '& .as-icon[data-kind="apple"]': {
      color: tokens.color.foreground,
    },
    '& .as-item-text': {
      display: 'grid',
      flex: 1,
      // design-exception: Signer name and detail read as one unit with a 1px gap between lines.
      gap: '1px !custom',
      minWidth: 0,
    },
    '& .as-item-name': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-item-detail': {
      overflow: 'hidden',
      color: tokens.color.muted,
      // design-exception: Signer details sit between the 12px and 13px steps to fit one line.
      fontSize: '12.5px !custom',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& .as-tag': {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.normal,
    },
    '& .as-tag[data-tone="added"]': {
      color: tokens.color.green11,
    },
    '& .as-tag:is([data-tone="removed"], [data-tone="lost"], [data-tone="revoked"], [data-tone="expired"])':
      {
        color: tokens.color.red11,
      },
    '& .as-tag[data-tone="paused"]': {
      color: tokens.color.amber11,
    },
    '& .as-weight': {
      flexShrink: 0,
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      fontVariantNumeric: 'tabular-nums',
    },
    '& .as-limit': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      justifySelf: 'start',
      // design-exception: Optical offset that seats the limit bar under the key detail line.
      marginTop: '3px !custom',
      paddingBlock: 0,
      paddingInline: tokens.spacing['0_5'],
    },
    '& .as-limit-bar': {
      width: '72px',
      height: '4px',
      overflow: 'hidden',
      borderRadius: tokens.radius.xs,
      backgroundColor: tokens.color.lineStrong,
    },
    '& .as-limit-bar span': {
      display: 'block',
      height: '100%',
      backgroundColor: tokens.color.foreground,
    },

    // Notices
    '& .as-notices': {
      display: 'grid',
      gap: tokens.spacing['1_5'],
    },
    '& .as-notices li': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: tokens.spacing['2'],
      fontSize: tokens.fontSize.compact,
    },
    '& .as-notices li svg': {
      // design-exception: Optical offset that centers the icon on the first line of text.
      marginTop: '1px !custom',
    },
    '& .as-notices li[data-tone="ok"] svg': {
      color: tokens.color.green11,
    },
    '& .as-notices li[data-tone="warning"] svg': {
      color: tokens.color.amber11,
    },
    '& .as-notices li[data-tone="error"] svg': {
      color: tokens.color.red11,
    },

    // Actions panel
    '& .as-panel': {
      display: 'grid',
      gap: tokens.spacing['3_5'],
      paddingTop: tokens.spacing['4'],
      borderTopWidth: tokens.borderWidth.hairline,
      borderTopStyle: 'solid',
      borderTopColor: tokens.color.line,
    },
    '& .as-tabs': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing['2_5'],
    },
    '& .as-tabs fieldset, & .as-segmented': {
      display: 'inline-flex',
      flexWrap: 'wrap',
      minWidth: 0,
      margin: 0,
      // design-exception: The segmented control's 3px inset matches its 3px gap between options.
      padding: '3px !custom',
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.lg,
      // design-exception: The segmented control's 3px gap matches its 3px inset.
      gap: '3px !custom',
    },
    '& .as-tabs fieldset button, & .as-segmented button': {
      minHeight: '30px',
      paddingBlock: 0,
      paddingInline: tokens.spacing['3'],
      border: 0,
      // design-exception: Options nest inside the 8px control radius minus its 3px inset.
      borderRadius: '5px !custom',
      backgroundColor: 'transparent !custom',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      whiteSpace: 'nowrap',
    },
    '& .as-tabs fieldset button:hover, & .as-segmented button:hover': {
      color: tokens.color.foreground,
    },
    '& .as-tabs fieldset button[aria-pressed="true"], & .as-segmented button[aria-pressed="true"]':
      {
        backgroundColor: tokens.color.foreground,
        color: tokens.color.background,
      },
    '& .as-panel-body': {
      display: 'grid',
      gap: tokens.spacing['3_5'],
    },
    '& .as-field': {
      display: 'grid',
      gridTemplateColumns: '120px minmax(0, 1fr)',
      alignItems: 'center',
      gap: tokens.spacing['3'],
    },
    '& .as-field-label': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-choices': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
    },
    '& .as-choice': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      minHeight: '32px',
      paddingBlock: 0,
      paddingInline: tokens.spacing['2_5'],
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
      backgroundColor: tokens.color.foreground,
      color: tokens.color.background,
    },
    '& .as-choice[aria-pressed="true"] .as-weight': {
      color: 'inherit !custom',
    },
    '& .as-choice svg': {
      width: '13px',
      height: '13px',
    },
    '& .as-or': {
      paddingBlock: 0,
      paddingInline: tokens.spacing['1'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.xs,
    },
    '& .as-outcome': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['3'],
      paddingTop: tokens.spacing['3_5'],
      borderTopWidth: tokens.borderWidth.hairline,
      borderTopStyle: 'solid',
      borderTopColor: tokens.color.line,
    },
    '& .as-meter': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
    },
    '& .as-meter-bar': {
      display: 'inline-flex',
      // design-exception: Meter segments sit 3px apart, tighter than the 4px spacing step.
      gap: '3px !custom',
    },
    '& .as-meter-bar span': {
      width: '20px',
      height: '8px',
      borderRadius: tokens.radius.xs,
      backgroundColor: tokens.color.lineStrong,
    },
    '& .as-meter-bar span[data-on="true"]': {
      backgroundColor: tokens.color.foreground,
    },
    '& .as-meter[data-ok="true"] .as-meter-bar span[data-on="true"]': {
      backgroundColor: tokens.color.green11,
    },
    '& .as-meter-label': {
      fontSize: tokens.fontSize.compact,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    '& .as-result': {
      display: 'inline-flex',
      flex: 1,
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      minWidth: '180px',
      color: tokens.color.muted,
    },
    '& .as-result[data-ok="true"]': {
      color: tokens.color.green11,
    },
    '& .as-result[data-ok="false"]': {
      color: tokens.color.red11,
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
    '& .as-button svg': {
      width: '13px',
      height: '13px',
    },
    '& .as-edit-list': {
      display: 'grid',
      gap: tokens.spacing['1_5'],
    },
    '& .as-edit-list li': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['2_5'],
      paddingBlock: tokens.spacing['1_5'],
      paddingInline: 0,
      borderBottomWidth: tokens.borderWidth.hairline,
      borderBottomStyle: 'solid',
      borderBottomColor: tokens.color.line,
    },
    '& .as-edit-list li[data-lost="true"] .as-edit-name': {
      color: tokens.color.muted,
      textDecoration: 'line-through',
    },
    '& .as-edit-name': {
      flex: 1,
      minWidth: '120px',
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-link': {
      padding: 0,
      border: 0,
      backgroundColor: 'transparent !custom',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
    },
    '& .as-link:hover': {
      color: tokens.color.foreground,
    },
    '& .as-notices .as-link': {
      fontSize: 'inherit !custom',
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
      width: '28px',
      height: '28px',
      placeItems: 'center',
      border: 0,
      backgroundColor: 'transparent !custom',
    },
    '& .as-stepper button:hover:not(:disabled)': {
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
    },
    '& .as-stepper svg': {
      width: '12px',
      height: '12px',
    },
    '& .as-stepper-value': {
      minWidth: '30px',
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
    '& .as-add svg': {
      width: '13px',
      height: '13px',
    },
    '& .as-add select': {
      position: 'absolute',
      inset: 0,
      width: '100%',
      opacity: 0,
      cursor: 'pointer',
    },
    '& .as-switch': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['2'],
      cursor: 'pointer',
    },
    '& .as-switch input': {
      width: '16px',
      height: '16px',
      accentColor: tokens.color.foreground,
    },
    '& .as-note': {
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },

    // Guided demo
    '& .as-step-body': {
      display: 'grid',
      gap: tokens.spacing['3'],
      marginTop: tokens.spacing['3'],
      // design-exception: Aligns step content with the step title, past the 28px badge and its gap.
      paddingInlineStart: '42px !custom',
    },
    '& .as-step-note': {
      marginTop: tokens.spacing['1_5'],
      // design-exception: Aligns step content with the step title, past the 28px badge and its gap.
      paddingInlineStart: '42px !custom',
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-compare': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      rowGap: tokens.spacing['3'],
      columnGap: tokens.spacing['4'],
    },
    '& .as-changes': {
      display: 'grid',
      gap: tokens.spacing['0_5'],
      fontSize: tokens.fontSize.compact,
    },
    '& .as-changes li[data-tone="add"]': {
      color: tokens.color.green11,
    },
    '& .as-changes li[data-tone="remove"]': {
      color: tokens.color.red11,
    },
    '& .as-changes li[data-tone="change"]': {
      color: tokens.color.blue11,
    },

    // History: a timeline, newest first
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
      minWidth: '20px',
      // design-exception: The count pill's 1px block inset keeps it the height of the summary text.
      paddingBlock: '1px !custom',
      paddingInline: tokens.spacing['1_5'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.full,
      fontFamily: inherited.fontFamily.vocsFontFamilyMono,
      fontSize: tokens.fontSize.caption,
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'center',
    },
    '& .as-timeline': {
      display: 'grid',
      marginTop: tokens.spacing['3_5'],
    },
    '& .as-timeline li': {
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '24px minmax(0, 1fr) auto',
      alignItems: 'start',
      gap: tokens.spacing['3'],
      paddingBottom: tokens.spacing['3_5'],
    },
    '& .as-timeline li:last-child': {
      paddingBottom: 0,
    },
    // The rail between markers.
    '& .as-timeline li:not(:last-child)::before': {
      position: 'absolute',
      top: '26px',
      bottom: '2px',
      insetInlineStart: '11.5px',
      width: '1px',
      backgroundColor: tokens.color.lineStrong,
      content: '""',
    },
    '& .as-timeline-marker': {
      display: 'grid',
      width: '24px',
      height: '24px',
      placeItems: 'center',
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.full,
      backgroundColor: inherited.color.surfacePanel,
      color: tokens.color.muted,
    },
    '& .as-timeline-marker svg': {
      width: '12px',
      height: '12px',
    },
    '& .as-timeline li:is([data-kind="config"], [data-kind="key"]) .as-timeline-marker': {
      '--as-marker': tokens.color.blue11,
    },
    '& .as-timeline li[data-kind="payment"] .as-timeline-marker': {
      '--as-marker': tokens.color.green11,
    },
    '& .as-timeline li:is([data-kind="config"], [data-kind="key"], [data-kind="payment"]) .as-timeline-marker':
      {
        // design-exception: Tints the marker ring with its entry's color, set per kind above.
        borderColor: 'color-mix(in srgb, var(--as-marker) 45%, transparent) !custom',
        // design-exception: Tints the marker fill with its entry's color over the panel surface.
        backgroundColor: 'color-mix(in srgb, var(--as-marker) 12%, var(--surface-panel)) !custom',
        // design-exception: The marker icon takes its entry's color, set per kind above.
        color: 'var(--as-marker) !custom',
      },
    '& .as-timeline-text': {
      display: 'grid',
      gap: tokens.spacing['0_5'],
      minWidth: 0,
      // design-exception: Optical offset that centers the first line on the 24px marker.
      paddingTop: '3px !custom',
    },
    '& .as-timeline-title': {
      color: tokens.color.foreground,
      // design-exception: Timeline titles sit between the 13px and 14px steps beside 12px markers.
      fontSize: '13.5px !custom',
      // design-exception: Timeline rows keep their original tight 1.35 line height.
      lineHeight: '1.35 !custom',
    },
    '& .as-timeline li:first-child .as-timeline-title': {
      fontWeight: tokens.fontWeight.medium,
    },
    '& .as-timeline-detail': {
      overflow: 'hidden',
      color: tokens.color.muted,
      // design-exception: Timeline details match the 12.5px signer details.
      fontSize: '12.5px !custom',
      // design-exception: Timeline rows keep their original tight 1.35 line height.
      lineHeight: '1.35 !custom',
      textOverflow: 'ellipsis',
    },

    // Network
    '& .as-lock': {
      display: 'contents',
    },
    '& .as-badge[data-network="devnet"]': {
      borderColor: tokens.color.green11,
      color: tokens.color.green11,
    },
    '& .as-tx': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['0_5'],
      color: tokens.color.muted,
      fontFamily: inherited.fontFamily.vocsFontFamilyMono,
      // design-exception: Monospace hashes run slightly under the 12px step to fit beside labels.
      fontSize: '11.5px !custom',
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
    '& .as-version .as-tx': {
      marginInlineStart: tokens.spacing['1_5'],
    },

    // Devnet sign-in prompt: outside the locked controls, so it stays clickable while devnet waits.
    '& .as-signin': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      rowGap: tokens.spacing['2'],
      columnGap: tokens.spacing['3'],
      paddingBlock: tokens.spacing['2_5'],
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.lineStrong,
      // design-exception: The sign-in prompt keeps its original 10px radius between scale steps.
      borderRadius: '10px !custom',
      backgroundColor: inherited.color.surfacePanel,
      fontSize: tokens.fontSize.compact,
    },
    '& .as-signin > svg': {
      flex: 'none',
      color: tokens.color.muted,
    },
    '& .as-signin > span': {
      flex: '1 1 16rem',
    },

    // A generated private key, shown once.
    '& .as-secret': {
      display: 'grid',
      gap: tokens.spacing['1'],
    },
    '& .as-secret .as-tx': {
      display: 'flex',
      gap: tokens.spacing['1'],
    },
    '& .as-secret input': {
      flex: 1,
      minWidth: 0,
      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['2'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.line,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      color: tokens.color.foreground,
      font: 'inherit',
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
    // An account created from scratch: where its address came from.
    '& .as-genesis': {
      fontSize: tokens.fontSize.xs,
    },
    '& .as-choice-reason': {
      fontSize: tokens.fontSize.xs,
      opacity: 0.85,
    },
    // A single payment amount, shown as text instead of a one-option control.
    '& .as-amount': {
      fontSize: tokens.fontSize.sm,
      fontVariantNumeric: 'tabular-nums',
    },
    // The backup chooser, opened from the no-backup warning.
    '& .as-backup': {
      display: 'grid',
      justifyItems: 'start',
      gap: tokens.spacing['1_5'],
      paddingBottom: tokens.spacing['3'],
      borderBottomWidth: tokens.borderWidth.hairline,
      borderBottomStyle: 'solid',
      borderBottomColor: tokens.color.line,
    },
    // Test funds from the devnet faucet.
    '& .as-fund': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      rowGap: tokens.spacing['2'],
      columnGap: tokens.spacing['3'],
    },
    // A sent payment: one clear confirmation in place of the send row.
    '& .as-success': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing['3'],
      paddingBlock: tokens.spacing['3_5'],
      paddingInline: tokens.spacing['4'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.green11,
      borderRadius: tokens.radius.lg,
    },
    '& .as-success > svg': {
      width: '22px',
      height: '22px',
      color: tokens.color.green11,
    },
    '& .as-success-text': {
      display: 'grid',
      flex: 1,
      gap: tokens.spacing['0_5'],
      minWidth: 0,
    },
    '& .as-success-text strong': {
      color: tokens.color.green11,
      fontSize: tokens.fontSize.body,
      fontWeight: tokens.fontWeight.semibold,
    },
    '& .as-success-text span': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: tokens.spacing['1'],
      color: tokens.color.muted,
      fontSize: tokens.fontSize.compact,
    },
    // A plain key account: its one primary action, and what a chooser option means.
    '& .as-upgrade': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      rowGap: tokens.spacing['2'],
      columnGap: tokens.spacing['3'],
    },
    '& .as-upgrade > .as-note:first-child': {
      flexBasis: '100%',
    },
    // Transaction hashes in the history timeline, after the base .as-tx rules.
    '& .as-timeline .as-tx': {
      // design-exception: Optical offset that aligns the hash pill with the entry title.
      marginTop: '1px !custom',
      // design-exception: The hash pill hugs its text with a 1px block inset.
      paddingBlock: '1px !custom',
      paddingInlineEnd: tokens.spacing['0_5'],
      paddingInlineStart: tokens.spacing['2'],
      borderRadius: tokens.radius.full,
      backgroundColor: inherited.color.colorMixInSrgbForeground5Transparent,
      opacity: 0.85,
    },
    '& .as-timeline li:hover .as-tx': {
      opacity: 1,
    },
    // Last, so a changed value's color wins over its element's muted color.
    '& [data-changed="true"]': {
      color: tokens.color.blue11,
    },
  },
  '@media (width <= 640px)': {
    selectors: {
      '& .as-state-columns': {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
      '& .as-state-rule': {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
      '& .as-field': {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: tokens.spacing['1_5'],
      },
      '& .as-item-detail': {
        whiteSpace: 'normal',
      },
      '& .as-step-body, & .as-step-note': {
        paddingInlineStart: 0,
      },
      '& .as-timeline li': {
        gridTemplateColumns: '24px minmax(0, 1fr)',
      },
      '& .as-timeline .as-tx': {
        gridColumn: 2,
        paddingTop: 0,
      },
    },
  },
})

/** A key's remaining limit, as the fill of its limit bar. */
export const accountSandboxLimitFill = style((values: { width: `${number}%` }) => ({
  width: values.width,
}))
