import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const signatureSelectorLayout = style({
  position: 'relative',
})
export const signatureSelectorLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
})
export const label = style({
  display: 'block',
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray11,
})
export const signatureSelectorInput = style({
  ':focus': { '--tempo-style-ring-color': 'var(--accent-blue)' },
  minHeight: tokens.spacing['10'],
  width: '100%',
  borderRadius: tokens.radius.lg,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  paddingInline: tokens.spacing['3'],
  fontSize: tokens.fontSize.compact,
  selectors: {
    '&:focus': {
      '--tempo-style-ring-shadow':
        'var(--tempo-style-ring-inset,) 0 0 0 calc(1px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
      // design-exception: Preserve this surface's layered artwork or focus treatment.
      boxShadow:
        'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '50%',
    },
  },
})
export const signatureSelectorButton = style({
  position: 'absolute',
  top: 'calc(1 / 2 * 100%)',
  insetInlineEnd: tokens.spacing['2'],
  '--tempo-style-translate-y': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray9,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.gray12,
      },
    },
  },
})
export const signatureSelectorLayout3 = style({
  position: 'absolute',
  zIndex: tokens.zIndex.raised,

  marginTop: tokens.spacing['1'],
  maxHeight: '400px',
  width: '100%',
  overflowY: 'auto',
  borderRadius: tokens.radius.lg,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  backgroundColor: tokens.color.gray1,
  '--tempo-style-shadow':
    '0 10px 15px -3px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1))',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
})
export const signatureSelectorLayout4 = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['4'],
  textAlign: 'center',
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray9,
})
export const signatureSelectorLayout5 = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: tokens.borderWidth.none,
    },
  },
})
export const signatureSelectorLayout6 = style({
  position: 'sticky',
  top: '0',
  zIndex: tokens.zIndex.raised,
  backgroundColor: tokens.color.gray2,
  paddingInline: tokens.spacing['3'],

  paddingBlock: tokens.spacing['1'],
  fontSize: tokens.fontSize.caption,
  fontWeight: tokens.fontWeight.medium,

  letterSpacing: inherited.letterSpacing.trackingWide,
  color: tokens.color.gray10,
  textTransform: 'uppercase',
})
export const signatureSelectorLayout7 = style({
  paddingBlock: tokens.spacing['0_5'],
})
export const signatureSelectorButton2 = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['1_5'],
  textAlign: 'left',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.gray3,
      },
    },
  },
})
export const signatureSelectorInput2 = style({
  flexShrink: 0,
})
export const signatureSelectorText = style({
  flexShrink: 0,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray12,
})
export const signatureSelectorText2 = style({
  minWidth: '0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray9,
})
export const signatureSelectorText3 = style({
  marginInlineStart: 'auto !custom',
  display: 'flex',
  minHeight: tokens.spacing['6'],
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: tokens.radius.smRem,
  paddingInline: tokens.spacing['1_5'],
  textAlign: 'center',
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.spacing['4'],
  fontWeight: tokens.fontWeight.medium,
})
export const signatureSelectorText4 = style({
  backgroundColor: tokens.color.blue3,
  color: tokens.color.blue9,
})
export const signatureSelectorLayout8 = style({
  marginTop: tokens.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
})
export const signatureSelectorLayout9 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
  borderRadius: tokens.radius.smRem,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['3'],
})
export const signatureSelectorLayout10 = style({
  fontSize: tokens.fontSize.xs,

  lineHeight: inherited.lineHeight.leadingRelaxed,
  color: tokens.color.gray11,
})
export const signatureSelectorLayout11 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.spacing['2'],
})
export const code = style({
  borderRadius: tokens.radius.smRem,
  backgroundColor: tokens.color.gray3,
  paddingInline: tokens.spacing['2'],

  paddingBlock: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray11,
})
export const signatureSelectorLayout12 = style({
  fontSize: tokens.fontSize.caption,
  color: tokens.color.gray10,
})
export const signatureSelectorLink = style({
  color: inherited.color.textColorAccent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const signatureSelectorLayout13 = style({
  display: 'flex',
  flexWrap: 'wrap',

  gap: tokens.spacing['1'],
})
export const signatureSelectorLayout14 = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  borderRadius: tokens.radius.smRem,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  backgroundColor: tokens.color.gray3,
  paddingInline: tokens.spacing['2'],

  paddingBlock: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
})
export const signatureSelectorText5 = style({
  width: tokens.spacing['2'],
  height: tokens.spacing['2'],
  flexShrink: 0,
  borderRadius: tokens.radius.full,
})
export const signatureSelectorText6 = style({
  backgroundColor: tokens.color.blue9,
})
export const signatureSelectorText7 = style({
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: tokens.color.gray11,
})
export const signatureSelectorButton3 = style({
  lineHeight: tokens.lineHeight.none,
  color: tokens.color.gray9,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.gray12,
      },
    },
  },
})
export const signatureSelectorLayout15 = style({
  borderColor: tokens.color.amber6,
  backgroundColor: tokens.color.amber3,
  color: tokens.color.amber11,
  borderRadius: tokens.radius.smRem,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.xs,

  lineHeight: inherited.lineHeight.leadingNormal,
})
export const signatureSelectorLayout16 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
  borderRadius: tokens.radius.smRem,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.blue4,
  backgroundColor: tokens.color.blue2,
  padding: tokens.spacing['3'],
})
export const signatureSelectorLayout17 = style({
  fontSize: tokens.fontSize.caption,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.blue11,
})
export const code2 = style({
  borderRadius: tokens.radius.smRem,
  backgroundColor: tokens.color.blue3,
  paddingInline: tokens.spacing['2'],

  paddingBlock: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  color: tokens.color.blue11,
})
export const signatureSelectorLayout18 = style({
  fontSize: tokens.fontSize.caption,

  lineHeight: inherited.lineHeight.leadingRelaxed,
  color: tokens.color.blue9,
})
export const functionTag = style({
  backgroundColor: tokens.color.violet3,
  color: tokens.color.violet9,
})
export const functionIndicator = style({ backgroundColor: tokens.color.violet9 })
