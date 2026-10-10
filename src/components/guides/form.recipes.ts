import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'

// Shared visual structure for interactive payment, issuance, wallet, and exchange forms.
export const actionButton = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
})

export const stepBody = style({
  marginInline: tokens.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  paddingBottom: tokens.spacing['4'],
})

export const stepRail = style({
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.emphasis,
  borderColor: tokens.color.gray4,
  paddingInlineStart: tokens.spacing['5'],
})

export const fieldsRow = style({
  marginTop: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  paddingInlineEnd: tokens.spacing['8'],
  '@media (width >= 48rem)': {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
})

export const primaryField = style({
  display: 'flex',
  flex: '2 1 0%',
  flexDirection: 'column',
})

export const label = style({
  fontSize: tokens.fontSize.caption,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})

export const secondaryField = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
})

export const errorText = style({
  marginTop: tokens.spacing['1'],
  fontSize: tokens.fontSize.caption,

  color: inherited.color.colorRed500,
})
