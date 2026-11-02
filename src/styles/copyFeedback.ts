import { global, keyframes } from 'zyzz/web'
import { inherited } from './inherited'

// G7: copy controls share one feedback. Our controls cross-fade both icons
// (CopyIconSwap); Vocs copy buttons remount their icon, so it scales and fades in.
// Every check uses content primary, never green.
const iconIn = keyframes({
  from: { opacity: 0, scale: 0.6 },
})

global({
  '.tempo-agent-start-copy, .docs-header-agent-panel, .docs-header-mobile-agents': {
    '--tempo-check-color': 'var(--vocs-text-color-primary)',
  },
  '.tempo-icon-swap': {
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  '.tempo-icon-swap > [data-icon]': {
    display: 'inline-flex',
    gridArea: '1 / 1',
    transitionProperty: 'opacity, scale',
    transitionDuration: 'var(--tempo-exit)',
    transitionTimingFunction: 'var(--tempo-ease)',
  },
  // Content primary of the surface: the page's on plain controls, the button's
  // own (inverse) color inside an inverted primary button.
  '.tempo-icon-swap > [data-icon="done"]': {
    // design-exception: Controls on the page set this to content primary; inverted buttons keep currentColor.
    color: 'var(--tempo-check-color, currentColor) !custom',
    opacity: 0,
    scale: 0.6,
  },
  '.tempo-icon-swap[data-copied] > [data-icon="idle"]': {
    opacity: 0,
    scale: 0.6,
  },
  '.tempo-icon-swap[data-copied] > [data-icon="done"]': {
    opacity: 1,
    scale: 1,
    transitionDuration: 'var(--tempo-enter)',
  },
  '@layer vocs_utilities': {
    'pre[data-v] > button[data-copied] > svg, [data-v-shell-copy] > svg, [data-v-copy-for-ai] > svg, [data-v-openapi-action-icon]':
      {
        animation: `${iconIn} var(--tempo-enter) var(--tempo-ease)`,
      },
    'pre[data-v] > button[data-copied="true"], [data-v-shell-copy][data-copied="true"], [data-v-copy-for-ai] > svg[class~="vocs:text-accent"], [data-v-openapi-action-icon][data-copied]':
      {
        color: inherited.color.vocsTextColorPrimary,
      },
    // Vocs keeps "Copy page for AI" while copied; show "Copied" like every other control.
    '[data-v-copy-for-ai]:has(> svg[class~="vocs:text-accent"]) > span': {
      display: 'none',
    },
    '[data-v-copy-for-ai]:has(> svg[class~="vocs:text-accent"])::after': {
      content: '"Copied"',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.tempo-icon-swap > [data-icon]': {
      scale: 1,
    },
    'pre[data-v] > button[data-copied] > svg, [data-v-shell-copy] > svg, [data-v-copy-for-ai] > svg, [data-v-openapi-action-icon]':
      {
        animation: 'none',
      },
  },
})
