import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const arrowUpRight = style({
  position: 'absolute',
  top: tokens.spacing['2_5'],
  insetInlineEnd: tokens.spacing['3'],
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],

  color: inherited.color.colorMixInOklabForeground35Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group\\/item):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground60Transparent,
      },
    },
  },
})
export const megaItemText = style({
  display: 'grid',
  width: '34px',
  height: '34px',
  flexShrink: 0,
  placeItems: 'center',

  backgroundColor: inherited.color.surfaceInput,
  color: tokens.color.foreground,
})
export const megaItemText2 = style({
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: tokens.spacing['0_5'],
})
export const megaItemText3 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const megaItemText4 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const megaMenuLayout = style({
  width: '360px',
  padding: tokens.spacing['3'],
})
export const megaMenuList = style({
  display: 'flex',
  flexDirection: 'column',

  gap: tokens.spacing['1'],
})
export const megaMenuLayout2 = style({
  display: 'flex',
  width: 'max-content',

  gap: tokens.spacing['1'],
  padding: tokens.spacing['3'],
})
export const megaMenuLayout3 = style({
  width: '224px',
})
export const megaItemStateState = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  gap: tokens.spacing['3'],
  borderRadius: tokens.radius.sm,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2_5'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground4Transparent,
      },
    },
  },
})
