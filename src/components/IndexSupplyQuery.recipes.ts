import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const renderCellValueText = style({
  color: tokens.color.gray9,
  fontStyle: 'italic',
})
export const renderCellValueLink = style({
  color: inherited.color.textColorAccent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const indexSupplyQueryHeading = style({
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.none,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray12,
})
export const indexSupplyQueryLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const indexSupplyQueryLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
})
export const indexSupplyQueryLayout3 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray11,
})
export const indexSupplyQueryLink = style({
  color: tokens.color.gray9,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.gray11,
      },
    },
  },
})
export const lucideExternalLink = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
})
export const indexSupplyQueryLayout4 = style({
  display: 'flex',
  flexWrap: 'wrap',

  gap: tokens.spacing['1'],
})
export const indexSupplyQueryLayout5 = style({
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
export const indexSupplyQueryText = style({
  width: tokens.spacing['2'],
  height: tokens.spacing['2'],
  flexShrink: 0,
  borderRadius: tokens.radius.full,
})
export const indexSupplyQueryText2 = style({
  backgroundColor: tokens.color.blue9,
})
export const indexSupplyQueryText3 = style({
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: tokens.color.gray11,
})
export const sqlEditor = style({
  width: '100%',
  borderRadius: tokens.radius.smRem,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  backgroundColor: tokens.color.gray2,
  fontFamily: tokens.fontFamily.code,
  selectors: {
    '&:focus': {
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '50%',
    },
  },
})
export const sqlEditor2 = style({
  fontSize: tokens.fontSize.caption,
  lineHeight: tokens.lineHeight.snug,
})
export const sqlEditor3 = style({
  fontSize: tokens.fontSize.compact,

  lineHeight: inherited.lineHeight.leadingNormal,
})
export const indexSupplyQueryLayout6 = style({
  borderRadius: tokens.radius.smRem,

  backgroundColor: inherited.color.backgroundColorDestructiveTint,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.leadingNormal,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,

  color: inherited.color.textColorDestructive,
})
export const indexSupplyQueryLayout7 = style({
  overflow: 'auto',
  borderRadius: tokens.radius.smRem,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
})
export const table = style({
  width: '100%',
  fontSize: tokens.fontSize.xs,
})
export const thead = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  backgroundColor: tokens.color.gray2,
})
export const th = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  textAlign: 'left',
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.gray12,
})
export const indexSupplyQueryLayout8 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['0_5'],
})
export const td = style({
  paddingBlock: tokens.spacing['4'],
  textAlign: 'center',
  color: tokens.color.gray9,
})
export const tr = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: tokens.borderWidth.none,
    },
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.gray2,
      },
    },
  },
})
export const td2 = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.code,
  color: tokens.color.gray11,
})
export const functionIndicator = style({ backgroundColor: tokens.color.violet9 })
