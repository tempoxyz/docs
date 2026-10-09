import { defineConfig } from 'zyzz'
import { design } from './contract'

// Existing scoped selectors retain their unlayered cascade priority.
export const { style, variants } = defineConfig({
  id: 'tempo-scoped',
  vars: design,
  // Zyzz requires literal mappings; check:styles verifies these against contract.ts.
  mappings: {
    spacing: [
      'gap',
      'rowGap',
      'columnGap',
      'padding',
      'paddingBlock',
      'paddingInline',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
      'paddingBlockStart',
      'paddingBlockEnd',
      'paddingInlineStart',
      'paddingInlineEnd',
      'margin',
      'marginBlock',
      'marginInline',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
      'marginBlockStart',
      'marginBlockEnd',
      'marginInlineStart',
      'marginInlineEnd',
    ],
    zIndex: ['zIndex'],
  },
  layers: [
    'reset',
    'properties',
    'vocs_theme',
    'theme',
    'base',
    'vocs_base',
    'vocs_components',
    'components',
    'vocs_utilities',
    'utilities',
  ],
})
