import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const tokenListDemoButton = style({
  textDecorationLine: 'underline',
})
export const tokenListDemoList = style({
  display: 'grid',
  listStyleType: 'none',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: tokens.spacing['2'],
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const tokenListDemoLink = style({
  display: 'flex',
  height: '100%',
  minWidth: '0',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  borderRadius: tokens.radius.lg,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray4,
  padding: tokens.spacing['2'],
  textDecorationLine: 'none',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.gray2,
      },
    },
  },
})
export const img = style({
  width: tokens.spacing['7'],
  height: tokens.spacing['7'],
  flexShrink: 0,
})
export const tokenListDemoText = style({
  minWidth: '0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  fontWeight: tokens.fontWeight.medium,
})
