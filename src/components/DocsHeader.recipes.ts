import { style as instanceStyle } from 'zyzz'
import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const tempoLogoText = style({
  display: 'block',
  backgroundColor: 'currentcolor',
})
export const activeSquareIcon = style({
  width: '11px',
  height: '11px',
  flexShrink: 0,
  color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
})
export const searchIconIcon = style({
  flexShrink: 0,
})
export const chevronIcon = style({
  flexShrink: 0,
  opacity: '60%',
  transitionProperty: 'transform, translate, scale, rotate',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '200ms',
})
export const chevronIcon2 = style({
  rotate: '180deg',
})
export const codexLogo = style({
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
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
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
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
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
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
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
export const anchor = style({
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
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
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
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
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
  paddingLeft: metrics.spacing['3'],
})
export const agentsPanelDescription = style({
  paddingInline: metrics.spacing['3'],
  paddingTop: metrics.spacing['2'],
  paddingBottom: metrics.spacing['1_5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '13px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
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
export const agentsPanelDescription2 = style({
  paddingInline: metrics.spacing['2_5'],
  paddingBlock: 'var(--spacing)',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '12px',
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
})
export const anchor2 = style({
  marginInline: 'calc(var(--spacing) * -2)',
  display: 'flex',
  minHeight: metrics.spacing['8'],
  alignItems: 'center',
  gap: metrics.spacing['2'],
  borderRadius: '6px',
  paddingInline: metrics.spacing['2'],
  paddingBlock: 'var(--spacing)',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const anchor3 = style({
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--foreground)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
      },
    },
  },
})
export const anchor4 = style({
  color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
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
export const sidebarDisclosureDetails = style({
  marginTop: 'var(--spacing)',
})
export const sidebarDisclosureSummary = style({
  marginInline: 'calc(var(--spacing) * -2)',
  display: 'flex',
  minHeight: metrics.spacing['8'],
  cursor: 'pointer',
  listStyleType: 'none',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '6px',
  paddingInline: metrics.spacing['2'],
  paddingBlock: 'var(--spacing)',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 65%, transparent)',
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
    '&::-webkit-details-marker': {
      display: 'none',
    },
  },
})
export const sidebarDisclosureLayout = style({
  marginTop: 'var(--spacing)',
  marginLeft: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
  borderLeftStyle: 'solid',
  borderLeftWidth: '1px',
  borderColor: 'var(--line)',
  paddingLeft: metrics.spacing['3'],
})
export const sidebarNodesLayout = style({
  marginTop: metrics.spacing['5'],
  selectors: {
    '&:first-child': {
      marginTop: '0',
    },
  },
})
export const sidebarNodesLayout2 = style({
  marginTop: metrics.spacing['3'],
})
export const sidebarNodesDescription = style({
  marginInline: 'calc(var(--spacing) * -2)',
  paddingInline: metrics.spacing['2'],
  paddingBottom: metrics.spacing['2'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '13px',
  lineHeight: 1.3,
  fontWeight: metrics.fontWeight.normal,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 60%, transparent)',
})
export const sidebarNodesLayout3 = style({
  marginLeft: metrics.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
  borderLeftStyle: 'solid',
  borderLeftWidth: '1px',
  borderColor: 'var(--line)',
  paddingLeft: metrics.spacing['3'],
})
export const sidebarNodesLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
})
export const tempoLogo = style({
  height: '18px',
  width: '80px',
})
export const docsHeaderText = style({
  display: 'flex',
  minWidth: '0',
  alignItems: 'center',
  gap: metrics.spacing['2_5'],
})
export const docsHeaderText2 = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
export const searchIcon = style({
  width: '18px',
  height: '18px',
})
export const arrowUpRight3 = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
})
export const tempoLogoTextAppearance = instanceStyle(
  (values: { value0: string; value1: string }) => ({
    aspectRatio: '102.461 / 23.2394',
    '--tempo-maskImage': values.value0,
    maskImage: 'var(--tempo-maskImage)',
    maskRepeat: 'no-repeat',
    maskSize: 'contain',
    maskPosition: 'center',
    '--tempo-WebkitMaskImage': values.value1,
    WebkitMaskImage: 'var(--tempo-WebkitMaskImage)',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskSize: 'contain',
    WebkitMaskPosition: 'center',
  }),
)
export const sidebarLeafAnchorAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-paddingLeft': values.value0,
  paddingLeft: 'var(--tempo-paddingLeft)',
}))
export const sidebarDisclosureDetailsAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-paddingLeft': values.value0,
  paddingLeft: 'var(--tempo-paddingLeft)',
}))
