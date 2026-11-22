import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'

// The outline card the setup cards use: page fill plus a hairline.
export const startBuildingSection = style({
  marginTop: tokens.spacing['10'],
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  borderRadius: tokens.radius.lg,
  padding: tokens.spacing['6'],
  color: tokens.color.foreground,
})
export const startBuildingHeading = style({
  marginBottom: tokens.spacing['4'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,
  fontWeight: tokens.fontWeight.medium,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.foreground,
})
export const startBuildingList = style({
  display: 'grid',
  gap: tokens.spacing['2'],
  listStyleType: 'decimal',
  margin: tokens.spacing['0'],
  paddingInlineStart: tokens.spacing['5'],
})
export const startBuildingItem = style({
  margin: tokens.spacing['0'],
  fontSize: tokens.fontSize.bodySmall,
  lineHeight: tokens.spacing['6'],
})
export const startBuildingCode = style({
  borderRadius: tokens.radius.sm,
  backgroundColor: tokens.color.block,
  paddingInline: tokens.spacing['1'],
  paddingBlock: tokens.spacing['0'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.sm,
})
export const startBuildingLink = style({
  color: tokens.color.foreground,
  textDecorationLine: 'underline',
})
