import { defineConfig } from 'zyzz'
import { design } from './contract'

// Reference the existing theme variables so Vocs and the marketing theme toggle
// remain the single authority for light, dark, and system preferences.
export const { style, variants, vars } = defineConfig({
  id: 'tempo-theme',
  vars: design,
  // Keep server-rendered class lists compact; cx still resolves composed overrides.
  cssOutput: 'grouped',
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
  defaultLayer: 'components',
})
