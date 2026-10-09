import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const activeSquareIcon = style({
  width: '11px',
  height: '11px',
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
})
export const searchIconIcon = style({
  flexShrink: 0,
})
export const gearIconIcon = style({
  flexShrink: 0,
})
export const chevronIcon = style({
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '200ms',
})
export const chevronIcon2 = style({
  rotate: '180deg',
})
export const claudeLogo = style({
  width: metrics.spacing['3_5'],
  height: metrics.spacing['3_5'],
  flexShrink: 0,
})
export const commandTabsLayout = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: metrics.spacing['1_5'],
})
export const commandTabsButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  borderRadius: '4px',
  paddingInline: metrics.spacing['2_5'],
  paddingBlock: metrics.spacing['1_5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '12px',
  letterSpacing: '0',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const commandTabsButton2 = style({
  backgroundColor: 'color-mix(in oklab, var(--foreground) 6%, transparent)',
  color: 'var(--foreground)',
})
export const commandTabsButton3 = style({
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 3%, transparent)',
        color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
      },
    },
  },
})
export const commandSnippetButton = style({
  display: 'flex',
  minHeight: '48px',
  width: '100%',
  alignItems: 'flex-start',
  gap: metrics.spacing['3'],
  borderRadius: '4px',
  backgroundColor: 'color-mix(in oklab, var(--foreground) 3.5000000000000004%, transparent)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2_5'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 6%, transparent)',
      },
    },
  },
})
export const code = style({
  display: 'grid',
  minWidth: '0',
  flex: '1 1 0%',
  gridTemplateColumns: 'auto minmax(0,1fr)',
  gap: metrics.spacing['2'],
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  lineHeight: 1.55,
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  color: 'var(--foreground)',
})
export const commandSnippetText = style({
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
  WebkitUserSelect: 'none',
  userSelect: 'none',
})
export const commandSnippetText2 = style({
  minWidth: '0',
})
export const commandSnippetText3 = style({
  marginTop: 'var(--spacing)',
  flexShrink: 0,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const commandSnippetText4 = style({
  color: 'var(--foreground)',
})
export const commandSnippetText5 = style({
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
  selectors: {
    '&:is(:where(.group\\/copy):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
      },
    },
  },
})
export const agentCommandSectionLayout = style({
  borderRadius: '4px',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2_5'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
      },
    },
  },
})
export const agentCommandSectionLayout2 = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: metrics.spacing['3'],
})
export const agentCommandSectionText = style({
  display: 'grid',
  width: '34px',
  height: '34px',
  flexShrink: 0,
  placeItems: 'center',
  backgroundColor: 'var(--surface-input)',
  color: 'var(--foreground)',
})
export const agentCommandSectionLink = style({
  position: 'relative',
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: metrics.spacing['0_5'],
  paddingRight: metrics.spacing['5'],
})
export const arrowUpRight = style({
  position: 'absolute',
  top: metrics.spacing['0_5'],
  right: '0',
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:is(:where(.group\\/item):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
      },
    },
  },
})
export const agentCommandSectionText2 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const agentCommandSectionText3 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '13px',
  lineHeight: 1.4,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
})
export const agentCommandSectionLayout3 = style({
  marginTop: metrics.spacing['3'],
  marginLeft: '52px',
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 3) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 3) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const agentsPanelLayout = style({
  width: '520px',
  padding: metrics.spacing['3'],
})
export const agentsPanelLayout2 = style({
  paddingBottom: metrics.spacing['4'],
})
export const agentsPanelDescription = style({
  paddingInline: metrics.spacing['3'],
  paddingTop: metrics.spacing['2'],
  paddingBottom: metrics.spacing['1_5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '13px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 35%, transparent)',
})
export const agentsPanelLayout3 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(var(--spacing) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd: 'calc(var(--spacing) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const headerHeader = style({
  position: 'relative',
  zIndex: 20,
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
})
export const nav = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['4'],
})
export const link = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['3'],
})
export const tempoLogo = style({
  height: '18px',
  width: '80px',
  color: 'var(--foreground)',
})
export const headerList = style({
  display: 'none',
  alignItems: 'center',
  gap: metrics.spacing['16'],
  '@media (width >= 64rem)': {
    position: 'absolute',
    top: 'calc(1 / 2 * 100%)',
    left: 'calc(1 / 2 * 100%)',
    display: 'flex',
    '--tempo-style-translate-x': 'calc(calc(1 / 2 * 100%) * -1)',
    translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
    '--tempo-style-translate-y': 'calc(calc(1 / 2 * 100%) * -1)',
  },
})
export const headerText = style({
  position: 'absolute',
  top: 'calc(1 / 2 * 100%)',
  left: 'calc(17px * -1)',
  '--tempo-style-translate-y': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
})
export const headerIcon = style({
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'var(--ease-out)',
  transitionDuration: '200ms',
})
export const headerButton = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'var(--foreground)',
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
  gap: metrics.spacing['3'],
  '@media (width >= 64rem)': {
    display: 'flex',
  },
})
export const headerButton2 = style({
  display: 'grid',
  width: metrics.spacing['9'],
  height: metrics.spacing['9'],
  placeItems: 'center',
  borderRadius: '4px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
        color: 'var(--foreground)',
      },
    },
  },
})
export const headerButton3 = style({
  display: 'flex',
  height: metrics.spacing['9'],
  alignItems: 'center',
  gap: metrics.spacing['2'],
  borderRadius: '4px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['4'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'var(--foreground)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
      },
    },
  },
})
export const headerLayout2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing)',
  '@media (width >= 64rem)': {
    display: 'none',
  },
})
export const headerButton4 = style({
  display: 'grid',
  width: metrics.spacing['8'],
  height: metrics.spacing['8'],
  placeItems: 'center',
  color: 'var(--foreground)',
})
export const searchIcon = style({
  width: '18px',
  height: '18px',
})
export const headerLayout3 = style({
  pointerEvents: 'none',
  position: 'absolute',
  top: '100%',
  left: '0',
  zIndex: 50,
  display: 'none',
  width: '100%',
  '@media (width >= 64rem)': {
    display: 'block',
  },
})
export const headerLayout4 = style({
  position: 'absolute',
  top: '0',
  left: '0',
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
  zIndex: 40,
  overflowY: 'auto',
  backgroundColor: 'var(--background)',
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
  paddingInline: metrics.spacing['5'],
  paddingBottom: metrics.spacing['5'],
})
export const headerLayout11 = style({
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
})
export const headerButton5 = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBlock: metrics.spacing['4'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const headerText2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['2'],
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
  gap: metrics.spacing['3'],
  paddingBottom: metrics.spacing['4'],
  paddingLeft: metrics.spacing['3'],
})
export const link2 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
export const headerLink = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: metrics.spacing['1_5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
})
export const arrowUpRight2 = style({
  marginTop: metrics.spacing['0_5'],
  width: metrics.spacing['3'],
  height: metrics.spacing['3'],
})
export const headerLink2 = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
  paddingBlock: metrics.spacing['4'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  letterSpacing: '0',
  color: 'var(--foreground)',
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
  paddingTop: metrics.spacing['3'],
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
  borderRadius: metrics.radius.md,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-page)',
  '--tempo-style-shadow': '0 25px 50px -12px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.25))',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
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
