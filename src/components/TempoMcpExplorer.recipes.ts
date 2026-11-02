import { inherited } from '../styles/inherited'
import { style } from '../styles/recipes'
import { vars as tokens } from '../styles/theme'
export const resultViewLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['3'],
    },
  },
})
export const article = style({
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray5,
  padding: tokens.spacing['3'],
})
export const resultViewLayout2 = style({
  marginBottom: tokens.spacing['2'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: tokens.spacing['3'],

  rowGap: tokens.spacing['1'],
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray10,
})
export const resultViewLink = style({
  display: 'inline-flex',
  alignItems: 'center',

  gap: tokens.spacing['1'],

  color: inherited.color.textColorAccent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const lucideExternalLink = style({
  height: tokens.spacing['3'],
  width: tokens.spacing['3'],
})
export const resultViewDescription = style({
  overflow: 'hidden',
  // Legacy box layout is required by the cross-browser line-clamp implementation.
  '--tempo-clamp-display': '-webkit-box',
  display: 'var(--tempo-clamp-display)',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 6,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.spacing['5'],
  whiteSpace: 'pre-wrap',
  color: tokens.color.gray12,
})
export const resultViewLayout3 = style({
  overflowX: 'auto',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
})
export const table = style({
  minWidth: '100%',
  textAlign: 'left',
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const thead = style({
  backgroundColor: tokens.color.gray2,
  color: tokens.color.gray11,
})
export const th = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['3'],
  fontWeight: tokens.fontWeight.medium,
})
export const tr = style({
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray5,
})
export const td = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
})
export const td2 = style({
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.code,
  color: tokens.color.gray11,
})
export const pre = style({
  maxHeight: '360px',
  overflow: 'auto',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  // G4: the fill differs from the page, so no border.
  borderWidth: tokens.borderWidth.none,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['3'],
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.spacing['5'],
  whiteSpace: 'pre-wrap',
  color: tokens.color.gray12,
})
export const form = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['5'],
    },
  },
})
export const tempoMcpExplorerLayout = style({
  display: 'grid',
  gap: tokens.spacing['4'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) auto',
  },
})
export const label = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const tempoMcpExplorerText = style({
  marginBottom: tokens.spacing['2'],
  display: 'block',
  color: tokens.color.gray11,
})
// AI1: TDS Platform NativeSelect spacing. Text sits 16px in; the select keeps
// 24px clear of a 16x16 chevron placed 16px from its inline end. The fields
// share this recipe, so the inputs take the same 16px inset and stay aligned.
// The chevron is TDS ChevronDown in content primary, drawn as a background so
// the explorer's markup is unchanged.
export const select = style({
  width: '100%',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
  backgroundColor: tokens.color.gray1,
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['2'],
  color: tokens.color.gray12,
  selectors: {
    '&:is(select)': {
      appearance: 'none',
      paddingInlineEnd: tokens.spacing['10'],
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23000' d='M11.9804 6.1464C12.1757 5.9514 12.4923 5.95122 12.6875 6.1464C12.8823 6.3416 12.8823 6.65827 12.6875 6.85343L8.82516 10.7157C8.36974 11.1709 7.63132 11.1707 7.17574 10.7157L3.31344 6.85343C3.11818 6.65816 3.11818 6.34166 3.31344 6.1464C3.50871 5.95124 3.82524 5.95117 4.02047 6.1464L7.88277 10.0087C7.94782 10.0731 8.05324 10.0734 8.11813 10.0087L11.9804 6.1464Z'/%3E%3C/svg%3E\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 16px center',
      backgroundSize: '16px 16px',
    },
    ':root[data-vocs-theme="dark"] &:is(select)': {
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23fff' d='M11.9804 6.1464C12.1757 5.9514 12.4923 5.95122 12.6875 6.1464C12.8823 6.3416 12.8823 6.65827 12.6875 6.85343L8.82516 10.7157C8.36974 11.1709 7.63132 11.1707 7.17574 10.7157L3.31344 6.85343C3.11818 6.65816 3.11818 6.34166 3.31344 6.1464C3.50871 5.95124 3.82524 5.95117 4.02047 6.1464L7.88277 10.0087C7.94782 10.0731 8.05324 10.0734 8.11813 10.0087L11.9804 6.1464Z'/%3E%3C/svg%3E\")",
    },
    ':dir(rtl) &:is(select)': {
      backgroundPosition: 'left 16px center',
    },
  },
})
export const tempoMcpExplorerLayout2 = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  gap: tokens.spacing['2'],
})
export const tempoMcpExplorerButton = style({
  display: 'inline-flex',
  height: tokens.spacing['10'],
  width: tokens.spacing['10'],
  alignItems: 'center',
  justifyContent: 'center',
  // G8: a secondary (gray) icon button, no outline.
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  borderWidth: tokens.borderWidth.none,
  backgroundColor: tokens.color.container,
  color: tokens.color.foreground,
  transitionProperty: 'color, background-color, border-color, opacity, transform',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover': {
      transitionDuration: 'var(--tempo-enter)',
      '@media (hover: hover)': {
        backgroundColor: tokens.color.containerStrong,
      },
    },
  },
})
export const lucideRotateCcw = style({
  height: tokens.spacing['4'],
  width: tokens.spacing['4'],
})
export const tempoMcpExplorerButton2 = style({
  display: 'inline-flex',
  height: tokens.spacing['10'],
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  // G8: primary actions are the inverted button, smoothed md radius.
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,

  backgroundColor: inherited.color.backgroundColorInvert,
  paddingInline: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: inherited.color.textColorInvert,
  transitionProperty: 'opacity',
  transitionDuration: 'var(--tempo-exit)',
  transitionTimingFunction: 'var(--tempo-ease)',
  selectors: {
    '&:hover:not(:disabled)': {
      opacity: 0.9,
      transitionDuration: 'var(--tempo-enter)',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '50%',
    },
  },
})
export const lucidePlay = style({
  height: tokens.spacing['3_5'],
  width: tokens.spacing['3_5'],
})
export const label2 = style({
  display: 'block',
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const tempoMcpExplorerLayout3 = style({
  display: 'grid',
  gap: tokens.spacing['3'],
  '@media (width >= 48rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const tempoMcpExplorerInput = style({
  width: '100%',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
  backgroundColor: tokens.color.gray1,
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['2'],
  fontFamily: tokens.fontFamily.code,
  color: tokens.color.gray12,
})
export const tempoMcpExplorerLayout4 = style({
  display: 'grid',
  gap: tokens.spacing['5'],
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'minmax(0,0.85fr) minmax(0,1.15fr)',
  },
})
export const tempoMcpExplorerLayout5 = style({
  paddingInline: tokens.spacing['1'],

  paddingBottom: tokens.spacing['1'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.gray11,
})
export const pre2 = style({
  maxHeight: '360px',
  overflow: 'auto',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  // G4: the fill differs from the page, so no border.
  borderWidth: tokens.borderWidth.none,
  backgroundColor: tokens.color.gray2,
  padding: tokens.spacing['3'],
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.spacing['5'],
  color: tokens.color.gray12,
})
export const tempoMcpExplorerLayout6 = style({
  display: 'flex',
  minHeight: tokens.spacing['5'],
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],

  paddingInline: tokens.spacing['1'],

  paddingBottom: tokens.spacing['1'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
})
export const tempoMcpExplorerText2 = style({
  color: tokens.color.gray11,
})
export const tempoMcpExplorerLayout7 = style({
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.red6,
  backgroundColor: tokens.color.red2,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.red11,
})
export const tempoMcpExplorerLayout8 = style({
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  // G4: the fill differs from the page, so no border.
  borderWidth: tokens.borderWidth.none,
  backgroundColor: tokens.color.gray2,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.gray11,
})
