import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const relatedDocsLinksSection = style({
  marginTop: tokens.spacing['10'],
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingTop: tokens.spacing['8'],
})
export const relatedDocsLinksHeading = style({
  marginBottom: tokens.spacing['4'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.subheading,
  fontWeight: tokens.fontWeight.medium,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.foreground,
})
export const relatedDocsLinksList = style({
  display: 'grid',
  listStyleType: 'none',
  gap: tokens.spacing['3'],
  padding: tokens.spacing['0'],
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const relatedDocsLinksItem = style({
  margin: tokens.spacing['0'],
})
export const link = style({
  '@media (hover: hover)': { ':hover': { backgroundColor: tokens.color.block } },
  display: 'block',
  height: '100%',
  borderRadius: tokens.radius.lg,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  padding: tokens.spacing['4'],
  color: tokens.color.foreground,
  textDecorationLine: 'none',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const relatedDocsLinksText = style({
  display: 'block',
  fontSize: tokens.fontSize.bodySmall,
  lineHeight: tokens.spacing['5'],
  fontWeight: tokens.fontWeight.medium,
})
export const relatedDocsLinksText2 = style({
  marginTop: tokens.spacing['1_5'],
  display: 'block',
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.spacing['5'],

  color: inherited.color.colorMixInOklabForeground60Transparent,
})
