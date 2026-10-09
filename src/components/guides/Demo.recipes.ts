import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const explorerLinkLayout = style({
  display: 'inline-flex',
})
export const explorerLinkLayout2 = style({
  marginTop: tokens.spacing['1'],
})
export const explorerLinkLink = style({
  display: 'flex',
  alignItems: 'center',

  gap: tokens.spacing['1'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,

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
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
})
export const receiptHashLayout = style({
  marginTop: tokens.spacing['1'],
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,
  letterSpacing: tokens.letterSpacing.tight,
})
export const receiptHashText = style({
  color: tokens.color.gray9,
})
export const code = style({
  minWidth: '0',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',
  color: tokens.color.gray12,
})
export const receiptHashButton = style({
  flexShrink: 0,
  color: tokens.color.gray9,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: tokens.color.gray12,
      },
    },
  },
})
export const containerLayout = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
})
export const containerHeading = style({
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.none,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray12,
})
export const containerButton = style({
  display: 'flex',
  alignItems: 'center',

  gap: tokens.spacing['1'],

  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.none,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.gray9,
})
export const lucideRotateCcw = style({
  marginTop: tokens.spacing['0'],
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
  color: tokens.color.gray9,
})
export const containerLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const balancesFooterItemText = style({
  display: 'flex',

  gap: tokens.spacing['1'],
})
export const balancesFooterItemText2 = style({
  color: tokens.color.gray10,
})
export const balancesFooterLayout = style({
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  paddingBlock: tokens.spacing['2'],
  lineHeight: tokens.lineHeight.none,
})
export const balancesFooterLayout2 = style({
  display: 'grid',
  gridTemplateColumns: '7rem 1px minmax(0,1fr)',
  alignItems: 'center',
  columnGap: tokens.spacing['2'],

  rowGap: tokens.spacing['1'],
})
export const balancesFooterLayout3 = style({
  minHeight: tokens.spacing['5'],
  width: '1px',
  alignSelf: 'stretch',
  backgroundColor: tokens.color.gray4,
})
export const balancesFooterLayout4 = style({
  display: 'flex',
  minWidth: '0',
  flexDirection: 'column',
  gap: tokens.spacing['2'],
  '@media (width >= 40rem)': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: tokens.spacing['3'],
    rowGap: tokens.spacing['2'],
  },
})
export const sourceFooterLayout = style({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
})
export const sourceFooterLayout2 = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,

  letterSpacing: inherited.letterSpacing.trackingTight,

  color: inherited.color.textColorPrimary,
  '@media (width < 40rem)': {
    display: 'none',
  },
})
export const lucideCheck = style({
  width: tokens.spacing['3'],
  height: tokens.spacing['3'],
  color: tokens.color.gray10,
})
export const sourceFooterLayout3 = style({
  fontSize: tokens.fontSize.xs,

  letterSpacing: inherited.letterSpacing.trackingTight,

  color: inherited.color.textColorAccent,
})
export const sourceFooterLink = style({
  display: 'flex',
  alignItems: 'center',

  gap: tokens.spacing['1'],
})
export const lucideExternalLink2 = style({
  width: '12px',
  height: '12px',
})
export const stepHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['4'],
  '@media (width < 40rem)': {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
})
export const stepLayout = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['3_5'],
})
export const stepLayout2 = style({
  display: 'flex',
  width: tokens.spacing['7'],
  height: tokens.spacing['7'],
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: tokens.radius.full,
  textAlign: 'center',
  fontSize: tokens.fontSize.compact,
  color: tokens.color.black,
  '--tempo-style-numeric-spacing': 'tabular-nums',
  fontVariantNumeric:
    'var(--tempo-style-ordinal,) var(--tempo-style-slashed-zero,) var(--tempo-style-numeric-figure,) var(--tempo-style-numeric-spacing,) var(--tempo-style-numeric-fraction,)',
  opacity: '40%',
  selectors: {
    '&:is(:where(.group)[data-completed="true"] *)': {
      opacity: '100%',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: tokens.color.white,
      },
  },
})
export const stepLayout3 = style({
  backgroundColor: tokens.color.green3,
})
export const stepLayout4 = style({
  backgroundColor: tokens.color.gray4,
})
export const lucideCheck2 = style({
  color: tokens.color.green9,
})
export const stepLayout5 = style({
  fontSize: tokens.fontSize.sm,
  letterSpacing: tokens.letterSpacing.tight,
  color: tokens.color.black,
  selectors: {
    '&:is(:where(.group)[data-active="false"] *)': {
      opacity: '40%',
    },
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        color: tokens.color.white,
      },
  },
})
export const stepLayout6 = style({
  opacity: '40%',
  selectors: {
    '&:is(:where(.group)[data-active="true"] *)': {
      opacity: '100%',
    },
    '&:is(:where(.group)[data-completed="true"] *)': {
      opacity: '100%',
    },
  },
})
export const stepLayout7 = style({
  height: tokens.spacing['2'],
})
export const stepLayout8 = style({
  borderRadius: tokens.radius.smRem,

  backgroundColor: inherited.color.backgroundColorDestructiveTint,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,

  lineHeight: inherited.lineHeight.leadingNormal,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,

  color: inherited.color.textColorDestructive,
})
export const loginLayout = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['2'],
    },
  },
})
export const lucidePictureInPicture2 = style({
  marginTop: tokens.spacing['0'],
})
export const loginButton = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,
})
export const loginLayout2 = style({
  maxWidth: '22rem',
  borderRadius: tokens.radius.smRem,

  backgroundColor: inherited.color.backgroundColorDestructiveTint,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.compact,

  lineHeight: inherited.lineHeight.leadingNormal,
  fontWeight: tokens.fontWeight.normal,
  letterSpacing: tokens.letterSpacing.compact,

  color: inherited.color.textColorDestructive,
})
export const lucideCheck3 = style({
  marginTop: tokens.spacing['0'],
  color: tokens.color.gray9,
})
