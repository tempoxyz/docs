import { inherited } from '../../../../styles/inherited'
import { style } from '../../../../styles/scoped'
import { vars as tokens } from '../../../../styles/theme'

export const blogMicroHeader = style({
  position: 'fixed',
  zIndex: tokens.zIndex.floating,
  bottom: 'max(18px, env(safe-area-inset-bottom))',
  insetInlineStart: '50%',
  display: 'flex',
  width: 'min(560px, calc(100% - 32px))',
  alignItems: 'center',
  gap: tokens.spacing['3_5'],
  overflow: 'hidden',
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: inherited.color.colorMixInSrgbColorForeground14Transparent,
  borderRadius: tokens.radius.md,

  paddingTop: tokens.spacing['2'],
  paddingInlineEnd: tokens.spacing['2_5'],
  paddingBottom: tokens.spacing['2_5'],
  paddingInlineStart: tokens.spacing['4'],
  transform: 'translateX(-50%)',
  backgroundColor: inherited.color.colorSurfacePage,
  color: tokens.color.foreground,
  fontFamily: tokens.fontFamily.system,
  selectors: {
    '&[hidden]': {
      display: 'none',
    },
  },
  '@media (width < 480px)': {
    gap: tokens.spacing['2_5'],
    paddingInlineStart: tokens.spacing['3'],
  },
})

export const blogMicroSection = style({
  flex: 1,
  minWidth: 0,
  selectors: {
    '& select': {
      width: '100%',
      minWidth: 0,
      border: 0,

      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['0'],
      overflow: 'hidden',
      backgroundColor: inherited.color.colorSurfacePage,
      color: 'inherit !custom',
      font: 'inherit',
      fontSize: tokens.fontSize.xs,
      textOverflow: 'ellipsis',
      cursor: 'pointer',
    },
  },
})

export const blogMicroPostTitle = style({
  flex: 1,
  overflow: 'hidden',
  fontSize: tokens.fontSize.xs,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const blogMicroReadtime = style({
  color: inherited.color.colorMixInSrgbColorForeground65Transparent,
  fontSize: tokens.fontSize.caption,
  whiteSpace: 'nowrap',
  '@media (width < 480px)': {
    fontSize: tokens.fontSize.tiny,
  },
})

export const blogMicroTop = style({
  display: 'grid',
  width: '32px',
  height: '32px',
  flexShrink: 0,
  placeItems: 'center',
  border: 0,
  borderRadius: tokens.radius.xs,
  backgroundColor: 'transparent !custom',
  color: 'inherit !custom',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: inherited.color.colorMixInSrgbColorForeground10Transparent,
    },
  },
})

export const blogMicroProgress = style({
  position: 'absolute',
  bottom: 0,
  insetInlineStart: 0,
  width: '100%',
  height: '2px',
  appearance: 'none',
  border: 0,
  backgroundColor: inherited.color.colorMixInSrgbColorForeground8Transparent,
  color: tokens.color.foreground,
  selectors: {
    '&::-webkit-progress-bar': {
      backgroundColor: inherited.color.colorMixInSrgbColorForeground8Transparent,
    },
    '&::-webkit-progress-value': {
      backgroundColor: tokens.color.foreground,
    },
    '&::-moz-progress-bar': {
      backgroundColor: tokens.color.foreground,
    },
  },
})
