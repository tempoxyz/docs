import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { style as instanceStyle } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'
export const tempoLogoText = style({
  display: 'block',
  backgroundColor: 'currentcolor !custom',
})
export const activeSquareIcon = style({
  width: '11px',
  height: '11px',
  flexShrink: 0,

  color: inherited.color.colorMixInOklabForeground70Transparent,
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
  color: inherited.color.colorMixInOklabForeground60Transparent,
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
  color: inherited.color.colorMixInOklabForeground55Transparent,
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
  color: inherited.color.colorMixInOklabForeground55Transparent,
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
export const anchor = style({
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

  color: inherited.color.colorMixInOklabForeground55Transparent,
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

  color: inherited.color.colorMixInOklabForeground60Transparent,
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
  paddingInlineStart: tokens.spacing['3'],
})
export const agentsPanelDescription = style({
  paddingInline: tokens.spacing['3'],
  paddingTop: tokens.spacing['2'],
  paddingBottom: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.normal,

  color: inherited.color.colorMixInOklabForeground55Transparent,
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
export const agentsPanelDescription2 = style({
  paddingInline: tokens.spacing['2_5'],

  paddingBlock: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.xs,

  color: inherited.color.colorMixInOklabForeground60Transparent,
})
export const anchor2 = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginInline: 'calc(var(--spacing) * -2) !custom',
  display: 'flex',
  minHeight: tokens.spacing['8'],
  alignItems: 'center',
  gap: tokens.spacing['2'],
  // SB3 in the drawer: the desktop sidebar's smoothed radius and hover motion.
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  paddingInline: tokens.spacing['2'],

  paddingBlock: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionTimingFunction: 'var(--tempo-ease)',
  transitionDuration: 'var(--tempo-exit)',
  selectors: {
    '&:hover': { transitionDuration: 'var(--tempo-enter)' },
  },
})
// SB1 in the drawer: the current page does not change on hover.
export const anchor3 = style({
  fontWeight: tokens.fontWeight.medium,
  color: tokens.color.foreground,
})
// SB2 in the drawer: entries use the primary color.
export const anchor4 = style({
  color: tokens.color.foreground,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground4Transparent,
      },
    },
  },
})
export const arrowUpRight2 = style({
  marginTop: tokens.spacing['0_5'],
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
})
export const sidebarDisclosureDetails = style({
  marginTop: tokens.spacing['1'],
})
export const sidebarDisclosureSummary = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginInline: 'calc(var(--spacing) * -2) !custom',
  display: 'flex',
  minHeight: tokens.spacing['8'],
  cursor: 'pointer',
  listStyleType: 'none',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  paddingInline: tokens.spacing['2'],

  paddingBlock: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.normal,

  color: tokens.color.foreground,
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionTimingFunction: 'var(--tempo-ease)',
  transitionDuration: 'var(--tempo-exit)',
  selectors: {
    '&:hover': {
      transitionDuration: 'var(--tempo-enter)',
      '@media (hover: hover)': {
        backgroundColor: inherited.color.colorMixInOklabForeground4Transparent,
      },
    },
    '&::-webkit-details-marker': {
      display: 'none',
    },
  },
})
export const sidebarDisclosureLayout = style({
  marginTop: tokens.spacing['1'],
  marginInlineStart: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['0'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInlineStart: tokens.spacing['3'],
})
export const sidebarNodesLayout = style({
  marginTop: tokens.spacing['5'],
  selectors: {
    '&:first-child': {
      marginTop: tokens.spacing['0'],
    },
  },
})
export const sidebarNodesLayout2 = style({
  marginTop: tokens.spacing['3'],
})
// SB2 in the drawer: group labels take the entry type in the secondary color.
export const sidebarNodesDescription = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginInline: 'calc(var(--spacing) * -2) !custom',
  paddingInline: tokens.spacing['2'],
  paddingBlock: tokens.spacing['1'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.normal,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.normal,

  color: tokens.color.muted,
})
// SB2 in the drawer: a single-section sidebar's header is the title, set like "On this page".
export const sidebarNodesTitle = style({
  // design-exception: Derive this layout value from the existing responsive CSS variables.
  marginInline: 'calc(var(--spacing) * -2) !custom',
  paddingInline: tokens.spacing['2'],
  paddingBottom: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.book,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.compact,
  fontWeight: tokens.fontWeight.medium,
  letterSpacing: tokens.letterSpacing.normal,

  color: tokens.color.muted,
})
export const sidebarNodesLayout3 = style({
  marginInlineStart: tokens.spacing['2'],
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['0'],
  borderInlineStartStyle: 'solid',
  borderInlineStartWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingInlineStart: tokens.spacing['3'],
})
export const sidebarNodesLayout4 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['0'],
})
export const tempoLogo = style({
  height: '18px',
  width: '80px',
})
export const arrowUpRight3 = style({
  width: tokens.spacing['4'],
  height: tokens.spacing['4'],
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
  // design-exception: Preserve the inherited component/framework scope at the point of use.
  paddingInlineStart: 'var(--tempo-paddingLeft) !custom',
}))
export const sidebarDisclosureDetailsAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-paddingLeft': values.value0,
  // design-exception: Preserve the inherited component/framework scope at the point of use.
  paddingInlineStart: 'var(--tempo-paddingLeft) !custom',
}))
