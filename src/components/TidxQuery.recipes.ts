import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const renderValueText = style({
  color: tokens.color.gray9,
  fontStyle: 'italic',
})
export const tidxQueryHeading = style({
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.none,
  fontWeight: tokens.fontWeight.normal,
  color: tokens.color.gray12,
})
export const tidxQueryButton = style({
  borderRadius: tokens.radius.md,

  backgroundColor: inherited.color.backgroundColorAccent,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['1_5'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.white,
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '50%',
    },
  },
})
export const tidxQueryLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const tidxQueryLayout2 = style({
  display: 'grid',
  gap: tokens.spacing['3'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const label = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1'],
    },
  },
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const tidxQueryText = style({
  color: tokens.color.gray11,
})
export const select = style({
  width: '100%',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
  backgroundColor: tokens.color.gray1,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  color: tokens.color.gray12,
})
export const tidxQueryDescription = style({
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.gray11,
})
export const label2 = style({
  display: 'block',
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1'],
    },
  },
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const tidxQueryInput = style({
  width: '100%',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
  backgroundColor: tokens.color.gray1,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.code,
  color: tokens.color.gray12,
})
export const tidxQueryLayout3 = style({
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.red6,
  backgroundColor: tokens.color.red2,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.red11,
})
export const tidxQueryLayout4 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['3'],
    },
  },
})
export const tidxQueryLayout5 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.xs,

  lineHeight: inherited.lineHeight.textXsLineHeight,
  color: tokens.color.gray11,
})
export const tidxQueryLayout6 = style({
  overflowX: 'auto',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
})
export const table = style({
  minWidth: '100%',
  textAlign: 'left',
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const thead = style({
  backgroundColor: tokens.color.gray2,
  color: tokens.color.gray11,
})
export const th = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontWeight: tokens.fontWeight.medium,
})
export const tr = style({
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray5,
})
export const td = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.code,
})
