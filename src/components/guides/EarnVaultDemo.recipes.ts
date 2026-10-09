import { inherited } from '../../styles/inherited'
import { style } from '../../styles/recipes'
import { vars as tokens } from '../../styles/theme'
export const earnVaultDemoText = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
})
export const earnVaultDemoText2 = style({
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const earnVaultDemoLayout = style({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
})
export const earnVaultDemoLink = style({
  color: inherited.color.textColorAccent,
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const earnVaultDemoLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['6'],
    },
  },
})
export const earnVaultDemoLayout3 = style({
  marginTop: tokens.spacing['3'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3'],
})
export const earnVaultDemoDescription = style({
  marginTop: tokens.spacing['3'],
  fontSize: tokens.fontSize.compact,

  color: inherited.color.textColorDestructive,
})
export const earnVaultDemoLayout4 = style({
  marginTop: tokens.spacing['3'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const label = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: tokens.spacing['0'],
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  margin: '-1px !custom',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  borderWidth: tokens.borderWidth.none,
})
export const select = style({
  width: '100%',
})
export const earnVaultDemoLayout5 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',

      marginBlockStart: 0,

      marginBlockEnd: tokens.spacing['4'],
    },
  },
})
export const dl = style({
  display: 'grid',
  minWidth: '0',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  columnGap: tokens.spacing['6'],
  rowGap: tokens.spacing['4'],
  borderTopStyle: 'solid',
  borderTopWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.line,
  paddingTop: tokens.spacing['4'],
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const earnVaultDemoText3 = style({
  marginTop: tokens.spacing['1'],
  display: 'block',
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',
  color: tokens.color.gray10,
})
export const earnVaultDemoText4 = style({
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  wordBreak: 'break-all',
})
export const earnVaultDemoLayout6 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['3'],
})
export const earnVaultDemoDescription2 = style({
  marginTop: tokens.spacing['3'],
  fontSize: tokens.fontSize.compact,
  color: tokens.color.gray10,
})
export const fieldLayout = style({
  minWidth: '0',
})
export const dt = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.color.gray10,
})
export const dd = style({
  marginTop: tokens.spacing['1'],
  fontSize: tokens.fontSize.sm,

  color: inherited.color.textColorPrimary,
})
export const earnVaultDemoStateState = style({
  ':focus-visible': { '--tempo-style-ring-color': 'var(--accent-blue)' },
  minHeight: tokens.spacing['10'],
  maxWidth: '100%',
  minWidth: '0',
  borderRadius: tokens.radius.md,
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.hairline,
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2'],
  fontSize: tokens.fontSize.sm,

  color: inherited.color.textColorPrimary,
  selectors: {
    '&:focus-visible': {
      '--tempo-style-ring-shadow':
        'var(--tempo-style-ring-inset,) 0 0 0 calc(2px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
      // design-exception: Preserve this surface's layered artwork or focus treatment.
      boxShadow:
        'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow) !custom',
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
  },
})
