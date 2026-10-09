import { defineConfig } from 'zyzz'
import { palette } from './palette'

// Reference the existing theme variables so Vocs and the marketing theme toggle
// remain the single authority for light, dark, and system preferences.
export const { style, variants, vars } = defineConfig({
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
  vars: palette,
})
