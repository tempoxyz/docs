import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { vars as tokens } from '../../../styles/theme'
export const codeWindowLayout = style({
  display: 'flex',
  minHeight: '0',
})
export const codeWindowLayout2 = style({
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: tokens.radius.lg,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.block,
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
})
export const codeWindowLayout3 = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,

  backgroundColor: inherited.color.surfacePanel,
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['3'],
})
export const codeWindowText = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
  flexShrink: 0,
  borderRadius: tokens.radius.full,
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#FF5F57 !custom',
})
export const codeWindowText2 = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
  flexShrink: 0,
  borderRadius: tokens.radius.full,
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#FEBC2E !custom',
})
export const codeWindowText3 = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
  flexShrink: 0,
  borderRadius: tokens.radius.full,
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#28C840 !custom',
})
export const codeWindowText4 = style({
  pointerEvents: 'none',
  position: 'absolute',
  insetInline: '0',
  textAlign: 'center',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  letterSpacing: tokens.letterSpacing.wider,

  color: inherited.color.colorMixInOklabForeground35Transparent,
})
export const codeWindowLayout4 = style({
  display: 'flex',
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.block,
})
export const codeWindowButton = style({
  height: tokens.spacing['11'],
  borderInlineEndStyle: 'solid',
  borderInlineEndWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['4'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
  letterSpacing: tokens.letterSpacing.label,
  textTransform: 'uppercase',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:last-child': {
      borderInlineEndStyle: 'solid',
      borderInlineEndWidth: tokens.borderWidth.none,
    },
  },
})
export const codeWindowButton2 = style({
  backgroundColor: tokens.color.elevated,
  color: tokens.color.foreground,
})
export const codeWindowButton3 = style({
  color: inherited.color.colorMixInOklabForeground40Transparent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: tokens.color.card,

        color: inherited.color.colorMixInOklabForeground70Transparent,
      },
    },
  },
})
export const codeWindowLayout5 = style({
  display: 'grid',
  minHeight: '0',
  flex: '1 1 0%',
})
export const codeWindowLayout6 = style({
  display: 'flex',
  minHeight: '0',
  backgroundColor: tokens.color.block,
  gridArea: '1/1',
})
export const codeWindowLayout7 = style({
  visibility: 'hidden',
})
