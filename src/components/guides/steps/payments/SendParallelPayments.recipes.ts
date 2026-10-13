import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const transferResultLayout = style({
  display: 'flex',
  flexDirection: 'column',
})
export const transferResultLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
export const transferResultText = style({
  marginTop: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray9,
})
export const transferResultText2 = style({
  marginTop: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,

  color: inherited.color.colorRed500,
})
export const transferResultLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: tokens.spacing['3'],

  rowGap: tokens.spacing['1'],
  paddingInlineStart: tokens.spacing['2'],
  fontSize: tokens.fontSize.tiny,
  color: tokens.color.gray9,
})
export const transferResultText3 = style({
  animation: 'var(--animate-pulse)',
})

export const sendParallelPaymentsLayout3 = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  gap: tokens.spacing['3'],
})
export const sendParallelPaymentsLayout4 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
})

export const sendParallelPaymentsInput = style({
  height: '34px',
  borderRadius: tokens.radius.pill,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  paddingInline: tokens.spacing.controlInset,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
  color: tokens.color.black,
  selectors: {
    '&::placeholder': {
      color: tokens.color.gray9,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '60%',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: tokens.color.white,
      },
  },
})
export const sendParallelPaymentsLayout5 = style({
  display: 'flex',
  alignItems: 'flex-start',
})
export const sendParallelPaymentsLayout6 = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',

  gap: tokens.spacing['1'],
})
