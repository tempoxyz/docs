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
export const select = style({
  width: '100%',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.gray6,
  backgroundColor: tokens.color.gray1,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  color: tokens.color.gray12,
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
  borderRadius: tokens.radius.md,

  backgroundColor: inherited.color.backgroundColorAccent,
  paddingInline: tokens.spacing['3'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.textSmLineHeight,
  color: tokens.color.white,
  selectors: {
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
  paddingInline: tokens.spacing['3'],
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
