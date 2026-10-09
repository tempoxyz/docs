import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { style as instanceStyle } from '../../../styles/scoped'
import { vars as tokens } from '../../../styles/theme'
export const renderCodeText = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginInline: 'calc(var(--spacing) * -1) !custom',
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginBlock: 'calc(var(--spacing) * -0.5) !custom',
  borderRadius: tokens.radius.sm,

  backgroundColor: inherited.color.colorMixInOklabForeground7000000000000001Transparent,

  paddingInline: tokens.spacing['1'],
  paddingBlock: tokens.spacing['0_5'],
  '--tempo-style-ring-shadow':
    'var(--tempo-style-ring-inset,) 0 0 0 calc(1px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
  '--tempo-style-ring-color': 'color-mix(in oklab, var(--foreground) 10%, transparent)',
})
export const copyButtonButton = style({
  position: 'absolute',
  top: tokens.spacing['3'],
  insetInlineEnd: tokens.spacing['3'],
  zIndex: tokens.zIndex.overlay,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,

  backgroundColor: inherited.color.colorMixInOklabForeground4Transparent,
  paddingInline: tokens.spacing['2_5'],
  paddingBlock: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,

  color: inherited.color.colorMixInOklabForeground55Transparent,
  opacity: '0%',
  '--tempo-style-backdrop-blur': 'blur(var(--blur-sm))',
  WebkitBackdropFilter:
    'var(--tempo-style-backdrop-blur,) var(--tempo-style-backdrop-brightness,) var(--tempo-style-backdrop-contrast,) var(--tempo-style-backdrop-grayscale,) var(--tempo-style-backdrop-hue-rotate,) var(--tempo-style-backdrop-invert,) var(--tempo-style-backdrop-opacity,) var(--tempo-style-backdrop-saturate,) var(--tempo-style-backdrop-sepia,)',
  backdropFilter:
    'var(--tempo-style-backdrop-blur,) var(--tempo-style-backdrop-brightness,) var(--tempo-style-backdrop-contrast,) var(--tempo-style-backdrop-grayscale,) var(--tempo-style-backdrop-hue-rotate,) var(--tempo-style-backdrop-invert,) var(--tempo-style-backdrop-opacity,) var(--tempo-style-backdrop-saturate,) var(--tempo-style-backdrop-sepia,)',
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '200ms',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        opacity: '100%',
      },
    },
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground8Transparent,
        color: tokens.color.foreground,
      },
    },
  },
})
export const codePanelLayout = style({
  minHeight: '0',
  flex: '1 1 0%',
  overflow: 'auto',
  backgroundColor: tokens.color.block,
  padding: tokens.spacing['4'],
})
export const codePanelLayout2 = style({
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const pre = style({
  width: 'fit-content',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.prose,

  color: inherited.color.colorMixInOklabForeground80Transparent,
})
export const codePanelLayout3 = style({
  position: 'relative',
  flex: '1 1 0%',
})
export const codePanelLayout4 = style({
  position: 'absolute',
  inset: tokens.spacing['5'],
  zIndex: tokens.zIndex.raised,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: tokens.color.onyx,
  padding: tokens.spacing['6'],
})
export const codePanelLayout5 = style({
  display: 'grid',
})
export const pre2 = style({
  visibility: 'hidden',
  height: '0',
  overflow: 'hidden',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.prose,
  whiteSpace: 'pre',
  gridArea: '1/1',
})
export const pre3 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.prose,

  color: inherited.color.colorMixInOklabForeground80Transparent,
  gridArea: '1/1',
})
export const renderCodeTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-color': values.value0,

  color: inherited.color.tempoColor,
}))
