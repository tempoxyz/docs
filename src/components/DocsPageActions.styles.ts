import { global } from 'zyzz/web'
import { inherited } from '../styles/inherited'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  '[data-layout]:has(.docs-page-actions) [data-v-copy-for-ai]': {
    display: 'none',
  },
})

export const docsPageActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  paddingTop: tokens.spacing['1'],
  paddingBottom: tokens.spacing['6'],

  marginBottom: tokens.spacing['8'],
  fontFamily: tokens.fontFamily.sansFallback,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.normal,
  selectors: {
    '& :is(a, button)': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      minHeight: '32px',
      paddingBlock: tokens.spacing['1_5'],
      paddingInline: tokens.spacing['3'],
      borderWidth: tokens.borderWidth.hairline,
      borderStyle: 'solid',
      borderColor: tokens.color.lineStrong,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,

      color: tokens.color.foreground,
      fontFamily: 'inherit !custom',
      fontSize: 'inherit !custom',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'background-color 150ms, border-color 150ms, opacity 150ms',
    },
    '& :is(a, button):hover': {
      borderColor: inherited.color.colorMixInSrgbForeground65Transparent,
    },
    '& > button:first-child': {
      borderColor: 'transparent !custom',
      backgroundColor: inherited.color.backgroundColorInvert,

      color: inherited.color.textColorInvert,
    },
    '& > button:first-child:hover': {
      borderColor: 'transparent !custom',
      opacity: 0.9,
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& :is(a, button)': {
        transition: 'none',
      },
    },
  },
  '@media (width < 600px)': {
    marginBottom: tokens.spacing['6'],
    selectors: {
      // Three labeled buttons do not fit one phone-width row; keep the primary labeled and
      // collapse the secondary actions to icons with their labels still exposed to readers.
      '& > :is(a, button):not(:first-child)': {
        justifyContent: 'center',
        minWidth: '32px',
        paddingInline: tokens.spacing['2'],
      },
      '& > :is(a, button):not(:first-child) .docs-page-action-label': {
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
      },
    },
  },
})

export const docsPageActionsError = style({
  width: '100%',

  color: inherited.color.vocsTextColorMuted,
})
