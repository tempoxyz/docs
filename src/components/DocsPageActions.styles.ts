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
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  gap: '12px 22px !custom',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  paddingBlock: '4px 22px !custom',

  marginBottom: tokens.spacing['8'],
  fontFamily: tokens.fontFamily.sansFallback,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.normal,
  selectors: {
    '& :is(a, button)': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing['1_5'],
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      padding: '3px 0 !custom',

      color: inherited.color.colorMixInSrgbForeground65Transparent,
      textDecoration: 'none',
      cursor: 'pointer',
    },
    '& :is(a, button):hover': {
      color: tokens.color.foreground,
    },
  },
  '@media (width < 600px)': {
    // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
    gap: '8px 18px !custom',
    marginBottom: tokens.spacing['6'],
  },
})

export const docsPageActionsError = style({
  width: '100%',

  color: inherited.color.vocsTextColorMuted,
})
