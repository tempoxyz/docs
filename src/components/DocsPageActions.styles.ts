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
  '@media (width < 600px)': {
    marginBottom: tokens.spacing['6'],
  },
})

// One quiet control group: a labeled secondary copy action, then icon buttons whose
// labels stay available to assistive technology and as tooltips.
export const docsPageActionsGroup = style({
  display: 'inline-flex',
  alignItems: 'stretch',
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.hairline,
  borderRadius: tokens.radius.md,
  '--corner-radius': tokens.radius.md,
  selectors: {
    '& > :is(a, button)': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing['1_5'],
      minWidth: '32px',
      minHeight: '30px',
      paddingBlock: tokens.spacing['1'],
      paddingInline: tokens.spacing['2'],
      border: 0,
      borderRadius: tokens.radius.none,
      backgroundColor: 'transparent !custom',

      color: tokens.color.foreground,
      fontFamily: 'inherit !custom',
      fontSize: 'inherit !custom',
      textDecoration: 'none',
      cursor: 'pointer',
      transitionProperty: 'color, background-color, border-color, opacity, transform',
      transitionDuration: 'var(--tempo-exit)',
      transitionTimingFunction: 'var(--tempo-ease)',
    },
    '& > button:first-child': {
      paddingInline: tokens.spacing['3'],
    },
    '& > :is(a, button) + :is(a, button)': {
      borderInlineStartWidth: tokens.borderWidth.hairline,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: tokens.color.hairline,
    },
    '& > :first-child': {
      borderStartStartRadius: tokens.radius.md,
      borderEndStartRadius: tokens.radius.md,
    },
    '& > :last-child': {
      borderStartEndRadius: tokens.radius.md,
      borderEndEndRadius: tokens.radius.md,
    },
    '& > :is(a, button):hover': {
      backgroundColor: tokens.color.containerSubtle,
      transitionDuration: 'var(--tempo-enter)',
    },
    '& .docs-page-action-label': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& > :is(a, button)': {
        transition: 'none',
      },
    },
  },
})

export const docsPageActionsError = style({
  width: '100%',

  color: inherited.color.vocsTextColorMuted,
})
