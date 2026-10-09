import { defineConfig } from 'zyzz'
import { design } from './contract'

// Component-local layout recipes override Vocs, while semantic component recipes
// live in the components layer. No runtime class parsing or stylesheet injection.
export const { style, variants } = defineConfig({
  id: 'tempo-recipes',
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
  // Literal data is required by Zyzz; checked against layers.ts by check:styles.
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
  defaultLayer: 'utilities',
})
