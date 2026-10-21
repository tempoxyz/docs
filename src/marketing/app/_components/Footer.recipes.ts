import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const footerFooter = style({
  position: 'relative',
  borderBlockStyle: 'solid',
  borderBlockWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const footerLayout = style({
  display: 'grid',
  gap: tokens.spacing['12'],
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['12'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'minmax(220px,1fr) 2fr',
    gap: tokens.spacing['16'],
    paddingInline: tokens.spacing['8'],
    paddingBlock: tokens.spacing['16'],
  },
})
export const footerLayout2 = style({
  display: 'flex',
  maxWidth: '320px',
  flexDirection: 'column',
  gap: tokens.spacing['4'],
})
export const link = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
export const tempoLogo = style({
  height: '18px',
  width: '80px',
  color: tokens.color.foreground,
})
export const footerDescription = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
  lineHeight: tokens.lineHeight.relaxed,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground55Transparent,
})
export const footerLayout3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: tokens.spacing['4'],
  rowGap: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
})
export const link2 = style({
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
      },
    },
  },
})
export const footerLayout4 = style({
  marginTop: tokens.spacing['6'],
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['6'],
  '@media (width >= 64rem)': {
    marginTop: 'auto !custom',
    paddingTop: tokens.spacing['12'],
  },
})
export const nav = style({
  display: 'flex',
  height: tokens.spacing['9'],
  alignItems: 'center',
})
export const footerLayout5 = style({
  display: 'flex',
  alignItems: 'center',
})
export const footerText = style({
  marginInline: tokens.spacing['2'],
  height: tokens.spacing['4'],
  width: '1px',
  backgroundColor: tokens.color.line,
})
export const footerLink = style({
  display: 'flex',
  width: tokens.spacing['9'],
  height: tokens.spacing['9'],
  alignItems: 'center',
  justifyContent: 'center',

  color: inherited.color.colorMixInOklabForeground45Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
      },
    },
  },
})
export const icon = style({
  width: '19px',
  height: '19px',
})
export const nav2 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: tokens.spacing['8'],
  rowGap: tokens.spacing['10'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const footerLayout6 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['4'],
})
export const footerDescription2 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const footerList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
})
export const footerStateState = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground50Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.foreground,
      },
    },
  },
})
