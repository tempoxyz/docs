import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const connectWalletLayout = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.compact,
})
export const connectWalletLayout2 = style({
  display: 'flex',
  gap: tokens.spacing['2'],
})
export const connectWalletButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
})
export const img = style({
  width: tokens.spacing['5'],
  height: tokens.spacing['5'],
})
export const connectWalletLayout3 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
})
export const connectWalletButton2 = style({
  width: 'fit-content',
})
export const connectWalletLayout4 = style({
  display: 'flex',
  alignItems: 'center',
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
})
