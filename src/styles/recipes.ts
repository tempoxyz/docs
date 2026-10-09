import { defineConfig } from 'zyzz'

// Component-local layout recipes override Vocs, while semantic component recipes
// live in the components layer. No runtime class parsing or stylesheet injection.
export const { style, variants } = defineConfig({
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
