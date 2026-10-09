import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/recipes'
import { style as instanceStyle } from '../../../styles/scoped'
import { vars as tokens } from '../../../styles/theme'
export const activeSquareIcon = style({
  width: '11px',
  height: '11px',
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground70Transparent,
})
export const searchIconIcon = style({
  flexShrink: 0,
})
export const gearIconIcon = style({
  flexShrink: 0,
})
export const chevronIcon = style({
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground50Transparent,
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '200ms',
})
export const chevronIcon2 = style({
  rotate: '180deg',
})
export const claudeLogo = style({
  width: tokens.spacing['3_5'],
  height: tokens.spacing['3_5'],
  flexShrink: 0,
})
export const commandTabsLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.spacing['1_5'],
})
export const commandTabsButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  borderRadius: tokens.radius.sm,
  paddingInline: tokens.spacing['2_5'],
  paddingBlock: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.xs,
  letterSpacing: tokens.letterSpacing.normal,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const commandTabsButton2 = style({
  backgroundColor: inherited.color.colorMixInOklabForeground6Transparent,
  color: tokens.color.foreground,
})
export const commandTabsButton3 = style({
  color: inherited.color.colorMixInOklabForeground40Transparent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground3Transparent,

        color: inherited.color.colorMixInOklabForeground70Transparent,
      },
    },
  },
})
export const commandSnippetButton = style({
  display: 'flex',
  minHeight: '48px',
  width: '100%',
  alignItems: 'flex-start',
  gap: tokens.spacing['3'],
  borderRadius: tokens.radius.sm,

  backgroundColor: inherited.color.colorMixInOklabForeground35000000000000004Transparent,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2_5'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground6Transparent,
      },
    },
  },
})
export const code = style({
  display: 'grid',
  minWidth: '0',
  flex: '1 1 0%',
  gridTemplateColumns: 'auto minmax(0,1fr)',
  gap: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,

  lineHeight: tokens.lineHeight.normal,
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  color: tokens.color.foreground,
})
export const commandSnippetText = style({
  color: inherited.color.colorMixInOklabForeground35Transparent,
  WebkitUserSelect: 'none',
  userSelect: 'none',
})
export const commandSnippetText2 = style({
  minWidth: '0',
})
export const commandSnippetText3 = style({
  marginTop: tokens.spacing['1'],
  flexShrink: 0,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const commandSnippetText4 = style({
  color: tokens.color.foreground,
})
export const commandSnippetText5 = style({
  color: inherited.color.colorMixInOklabForeground35Transparent,
  selectors: {
    '&:is(:where(.group\\/copy):hover *)': {
      '@media (hover: hover)': {
        color: inherited.color.colorMixInOklabForeground70Transparent,
      },
    },
  },
})
export const agentCommandSectionLayout = style({
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
export const agentCommandSectionLayout2 = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: tokens.spacing['3'],
})
export const agentCommandSectionText = style({
  display: 'grid',
  width: '34px',
  height: '34px',
  flexShrink: 0,
  placeItems: 'center',

  backgroundColor: inherited.color.surfaceInput,
  color: tokens.color.foreground,
})
export const agentCommandSectionLink = style({
  position: 'relative',
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: tokens.spacing['0_5'],
  paddingInlineEnd: tokens.spacing['5'],
})
export const arrowUpRight = style({
  position: 'absolute',
  top: tokens.spacing['0_5'],
  insetInlineEnd: '0',
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
export const agentCommandSectionText2 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const agentCommandSectionText3 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.snug,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground45Transparent,
})
export const agentCommandSectionLayout3 = style({
  marginTop: tokens.spacing['3'],

  marginInlineStart: tokens.spacing['12'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['3'],
    },
  },
})
export const agentsPanelLayout = style({
  width: '520px',
  padding: tokens.spacing['3'],
})
export const agentsPanelLayout2 = style({
  paddingBottom: tokens.spacing['4'],
})
export const agentsPanelDescription = style({
  paddingInline: tokens.spacing['3'],
  paddingTop: tokens.spacing['2'],
  paddingBottom: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground35Transparent,
})
export const agentsPanelLayout3 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['1'],
    },
  },
})
export const headerHeader = style({
  position: 'relative',
  zIndex: tokens.zIndex.overlay,
  borderBottomStyle: 'solid',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const nav = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingInline: tokens.spacing['5'],
  paddingBlock: tokens.spacing['4'],
})
export const link = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
export const tempoLogo = style({
  height: '18px',
  width: '80px',
  color: tokens.color.foreground,
})
export const headerList = style({
  display: 'none',
  alignItems: 'center',
  gap: tokens.spacing['16'],
  '@media (width >= 64rem)': {
    position: 'absolute',
    top: 'calc(1 / 2 * 100%)',
    insetInlineStart: 'calc(1 / 2 * 100%)',
    display: 'flex',
    '--tempo-style-translate-x': 'calc(calc(1 / 2 * 100%) * -1)',
    translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
    '--tempo-style-translate-y': 'calc(calc(1 / 2 * 100%) * -1)',
  },
})
export const headerText = style({
  position: 'absolute',
  top: 'calc(1 / 2 * 100%)',
  insetInlineStart: 'calc(17px * -1)',
  '--tempo-style-translate-y': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
})
export const headerIcon = style({
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground40Transparent,
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
})
export const headerButton = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
  transitionProperty: 'opacity',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        opacity: '70%',
      },
    },
  },
})
export const headerLayout = style({
  display: 'none',
  alignItems: 'center',
  gap: tokens.spacing['3'],
  '@media (width >= 64rem)': {
    display: 'flex',
  },
})
export const headerButton2 = style({
  display: 'grid',
  width: tokens.spacing['9'],
  height: tokens.spacing['9'],
  placeItems: 'center',
  borderRadius: tokens.radius.sm,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,

  color: inherited.color.colorMixInOklabForeground60Transparent,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground4Transparent,
        color: tokens.color.foreground,
      },
    },
  },
})
export const headerButton3 = style({
  display: 'flex',
  height: tokens.spacing['9'],
  alignItems: 'center',
  gap: tokens.spacing['2'],
  borderRadius: tokens.radius.sm,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInline: tokens.spacing['4'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
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
export const headerLayout2 = style({
  display: 'flex',
  alignItems: 'center',

  gap: tokens.spacing['1'],
  '@media (width >= 64rem)': {
    display: 'none',
  },
})
export const headerButton4 = style({
  display: 'grid',
  width: tokens.spacing['8'],
  height: tokens.spacing['8'],
  placeItems: 'center',
  color: tokens.color.foreground,
})
export const searchIcon = style({
  width: '18px',
  height: '18px',
})
export const headerLayout3 = style({
  pointerEvents: 'none',
  position: 'absolute',
  top: '100%',
  insetInlineStart: '0',
  zIndex: tokens.zIndex.sectionNav,
  display: 'none',
  width: '100%',
  '@media (width >= 64rem)': {
    display: 'block',
  },
})
export const headerLayout4 = style({
  position: 'absolute',
  top: '0',
  insetInlineStart: '0',
  width: 'max-content',
  transitionProperty: 'opacity',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const headerLayout5 = style({
  opacity: '100%',
})
export const headerLayout6 = style({
  pointerEvents: 'none',
  opacity: '0%',
})
export const headerLayout7 = style({
  position: 'fixed',
  insetInline: '0',
  bottom: '0',
  zIndex: tokens.zIndex.floating,
  overflowY: 'auto',
  backgroundColor: tokens.color.background,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
  '@media (width >= 64rem)': {
    display: 'none',
  },
})
export const headerLayout8 = style({
  pointerEvents: 'auto',
  '--tempo-style-translate-y': '0',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  opacity: '100%',
})
export const headerLayout9 = style({
  pointerEvents: 'none',
  '--tempo-style-translate-y': 'calc(var(--spacing) * -2)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  opacity: '0%',
})
export const headerLayout10 = style({
  display: 'flex',
  flexDirection: 'column',
  paddingInline: tokens.spacing['5'],
  paddingBottom: tokens.spacing['5'],
})
export const headerLayout11 = style({
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
})
export const headerButton5 = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBlock: tokens.spacing['4'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const headerText2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
})
export const headerLayout12 = style({
  display: 'grid',
  overflow: 'hidden',
  transitionProperty: 'grid-template-rows',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '300ms',
})
export const headerLayout13 = style({
  gridTemplateRows: '1fr',
})
export const headerLayout14 = style({
  gridTemplateRows: '0fr',
})
export const headerLayout15 = style({
  minHeight: '0',
  overflow: 'hidden',
})
export const headerLayout16 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  paddingBottom: tokens.spacing['4'],
  paddingInlineStart: tokens.spacing['3'],
})
export const link2 = style({
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
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
export const headerLink = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.bodySmall,
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
export const arrowUpRight2 = style({
  marginTop: tokens.spacing['0_5'],
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
})
export const headerLink2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingBlock: tokens.spacing['4'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.body,
  letterSpacing: tokens.letterSpacing.normal,
  color: tokens.color.foreground,
})
export const headerLayoutState = style({
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
  willChange: 'opacity,transform,filter',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const headerLayoutState2 = style({
  '--tempo-style-translate-y': '0',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  opacity: '100%',
  filter: 'blur(0px)',
})
export const headerLayoutState3 = style({
  '--tempo-style-translate-y': 'calc(var(--spacing) * -2)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  opacity: '0%',
  filter: 'blur(8px)',
})
export const headerLayoutState4 = style({
  width: 'max-content',
  paddingTop: tokens.spacing['3'],
})
export const headerLayoutState5 = style({
  pointerEvents: 'auto',
})
export const headerLayoutState6 = style({
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const headerLayoutState7 = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,

  backgroundColor: inherited.color.surfacePage,
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  // design-exception: Preserve this surface's layered artwork or focus treatment.
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
})
export const headerLayoutState8 = style({
  transitionProperty: 'width,height',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
  '@media (prefers-reduced-motion: reduce)': {
    transitionProperty: 'none',
  },
})
export const headerLayoutAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-transform': values.value0,
  transform: 'var(--tempo-transform)',
}))
export const headerLayoutAppearance3 = instanceStyle((values: { value0: `${number}px` }) => ({
  top: values.value0,
}))
export const headerLayoutAppearance2 = instanceStyle(
  (values: { value0: string; value1: string }) => ({
    '--tempo-width': values.value0,
    width: 'var(--tempo-width)',
    '--tempo-height': values.value1,
    height: 'var(--tempo-height)',
  }),
)
