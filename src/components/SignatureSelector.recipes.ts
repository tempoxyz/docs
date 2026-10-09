import { metrics } from '../styles/metrics'
import { style } from '../styles/recipes'
export const signatureSelectorLayout = style({
  position: 'relative',
})
export const signatureSelectorLayout2 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const label = style({
  display: 'block',
  fontSize: '13px',
  color: 'var(--color-gray11)',
})
export const signatureSelectorInput = style({
  ':focus': { '--tempo-style-ring-color': 'var(--accent-blue)' },
  minHeight: metrics.spacing['10'],
  width: '100%',
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  paddingInline: metrics.spacing['3'],
  fontSize: '13px',
  selectors: {
    '&:focus': {
      '--tempo-style-ring-shadow':
        'var(--tempo-style-ring-inset,) 0 0 0 calc(1px + var(--tempo-style-ring-offset-width)) var(--tempo-style-ring-color, currentcolor)',
      boxShadow:
        'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
      '--tempo-style-outline-style': 'none',
      outlineStyle: 'none',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '50%',
    },
  },
})
export const signatureSelectorButton = style({
  position: 'absolute',
  top: 'calc(1 / 2 * 100%)',
  right: metrics.spacing['2'],
  '--tempo-style-translate-y': 'calc(calc(1 / 2 * 100%) * -1)',
  translate: 'var(--tempo-style-translate-x) var(--tempo-style-translate-y)',
  fontSize: '11px',
  color: 'var(--color-gray9)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--color-gray12)',
      },
    },
  },
})
export const signatureSelectorLayout3 = style({
  position: 'absolute',
  zIndex: 10,
  marginTop: 'var(--spacing)',
  maxHeight: '400px',
  width: '100%',
  overflowY: 'auto',
  borderRadius: metrics.radius.lg,
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--color-gray1)',
  '--tempo-style-shadow':
    '0 10px 15px -3px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tempo-style-shadow-color, rgb(0 0 0 / 0.1))',
  boxShadow:
    'var(--tempo-style-inset-shadow), var(--tempo-style-inset-ring-shadow), var(--tempo-style-ring-offset-shadow), var(--tempo-style-ring-shadow), var(--tempo-style-shadow)',
})
export const signatureSelectorLayout4 = style({
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['4'],
  textAlign: 'center',
  fontSize: '13px',
  color: 'var(--color-gray9)',
})
export const signatureSelectorLayout5 = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--color-gray4)',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
})
export const signatureSelectorLayout6 = style({
  position: 'sticky',
  top: '0',
  zIndex: 10,
  backgroundColor: 'var(--color-gray2)',
  paddingInline: metrics.spacing['3'],
  paddingBlock: 'var(--spacing)',
  fontSize: '11px',
  fontWeight: metrics.fontWeight.medium,
  letterSpacing: 'var(--tracking-wide)',
  color: 'var(--color-gray10)',
  textTransform: 'uppercase',
})
export const signatureSelectorLayout7 = style({
  paddingBlock: metrics.spacing['0_5'],
})
export const signatureSelectorButton2 = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['1_5'],
  textAlign: 'left',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--color-gray3)',
      },
    },
  },
})
export const signatureSelectorInput2 = style({
  flexShrink: 0,
})
export const signatureSelectorText = style({
  flexShrink: 0,
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  color: 'var(--color-gray12)',
})
export const signatureSelectorText2 = style({
  minWidth: '0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  color: 'var(--color-gray9)',
})
export const signatureSelectorText3 = style({
  marginLeft: 'auto',
  display: 'flex',
  minHeight: metrics.spacing['6'],
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '0.25rem',
  paddingInline: metrics.spacing['1_5'],
  textAlign: 'center',
  fontSize: '12px',
  lineHeight: metrics.spacing['4'],
  fontWeight: metrics.fontWeight.medium,
})
export const signatureSelectorText4 = style({
  backgroundColor: 'var(--color-blue3)',
  color: 'var(--color-blue9)',
})
export const signatureSelectorLayout8 = style({
  marginTop: metrics.spacing['2'],
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
})
export const signatureSelectorLayout9 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--color-gray2)',
  padding: metrics.spacing['3'],
})
export const signatureSelectorLayout10 = style({
  fontSize: '12px',
  lineHeight: 'var(--leading-relaxed)',
  color: 'var(--color-gray11)',
})
export const signatureSelectorLayout11 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: metrics.spacing['2'],
})
export const code = style({
  borderRadius: '0.25rem',
  backgroundColor: 'var(--color-gray3)',
  paddingInline: metrics.spacing['2'],
  paddingBlock: 'var(--spacing)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  color: 'var(--color-gray11)',
})
export const signatureSelectorLayout12 = style({
  fontSize: '11px',
  color: 'var(--color-gray10)',
})
export const signatureSelectorLink = style({
  color: 'var(--text-color-accent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
export const signatureSelectorLayout13 = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--spacing)',
})
export const signatureSelectorLayout14 = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: metrics.spacing['1_5'],
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-gray4)',
  backgroundColor: 'var(--color-gray3)',
  paddingInline: metrics.spacing['2'],
  paddingBlock: 'var(--spacing)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
})
export const signatureSelectorText5 = style({
  width: metrics.spacing['2'],
  height: metrics.spacing['2'],
  flexShrink: 0,
  borderRadius: 'calc(infinity * 1px)',
})
export const signatureSelectorText6 = style({
  backgroundColor: 'var(--color-blue9)',
})
export const signatureSelectorText7 = style({
  maxWidth: '300px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: 'var(--color-gray11)',
})
export const signatureSelectorButton3 = style({
  lineHeight: 1,
  color: 'var(--color-gray9)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        color: 'var(--color-gray12)',
      },
    },
  },
})
export const signatureSelectorLayout15 = style({
  borderColor: 'var(--color-amber6)',
  backgroundColor: 'var(--color-amber3)',
  color: 'var(--color-amber11)',
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  paddingInline: metrics.spacing['3'],
  paddingBlock: metrics.spacing['2'],
  fontSize: '12px',
  lineHeight: 'var(--leading-normal)',
})
export const signatureSelectorLayout16 = style({
  selectors: {
    ':where(& > :not(:last-child))': {
      '--tempo-style-space-y-reverse': '0',
      marginBlockStart: 'calc(calc(var(--spacing) * 2) * var(--tempo-style-space-y-reverse))',
      marginBlockEnd:
        'calc(calc(var(--spacing) * 2) * calc(1 - var(--tempo-style-space-y-reverse)))',
    },
  },
  borderRadius: '0.25rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--color-blue4)',
  backgroundColor: 'var(--color-blue2)',
  padding: metrics.spacing['3'],
})
export const signatureSelectorLayout17 = style({
  fontSize: '11px',
  fontWeight: metrics.fontWeight.medium,
  color: 'var(--color-blue11)',
})
export const code2 = style({
  borderRadius: '0.25rem',
  backgroundColor: 'var(--color-blue3)',
  paddingInline: metrics.spacing['2'],
  paddingBlock: 'var(--spacing)',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '11px',
  color: 'var(--color-blue11)',
})
export const signatureSelectorLayout18 = style({
  fontSize: '11px',
  lineHeight: 'var(--leading-relaxed)',
  color: 'var(--color-blue9)',
})
export const functionTag = style({
  backgroundColor: 'var(--color-violet3)',
  color: 'var(--color-violet9)',
})
export const functionIndicator = style({ backgroundColor: 'var(--color-violet9)' })
