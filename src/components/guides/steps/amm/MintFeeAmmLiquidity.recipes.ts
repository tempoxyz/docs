import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'

export const mintFeeAmmLiquidityLayout = style({
  marginInline: tokens.spacing['6'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  paddingBottom: tokens.spacing['4'],
})

export const mintFeeAmmLiquidityLayout3 = style({
  marginTop: tokens.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1'],
    },
  },
})
export const mintFeeAmmLiquidityLayout4 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
})
export const lucideCheck = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  color: tokens.color.green9,
})
export const lucideCircle = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
  color: tokens.color.gray9,
})
export const mintFeeAmmLiquidityText = style({
  width: tokens.spacing['20'],
  fontFamily: tokens.fontFamily.code,
})
export const mintFeeAmmLiquidityText2 = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginTop: 'calc(var(--spacing) * -1) !custom',
})
