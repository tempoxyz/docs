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
      border: 0,
      // G8: secondary actions use the Platform gray fill; one radius, smoothed.
      borderRadius: tokens.radius.md,
      '--corner-radius': tokens.radius.md,
      backgroundColor: tokens.color.container,

      color: tokens.color.foreground,
      fontFamily: 'inherit !custom',
      fontSize: 'inherit !custom',
      textDecoration: 'none',
      cursor: 'pointer',
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& :is(a, button):hover': {
      backgroundColor: tokens.color.containerStrong,
      transitionDuration: 'var(--tempo-enter)',
    },
    '& > button:first-child': {
      backgroundColor: inherited.color.backgroundColorInvert,

      color: inherited.color.textColorInvert,
    },
    '& > button:first-child:hover': {
      backgroundColor: inherited.color.backgroundColorInvert,
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
