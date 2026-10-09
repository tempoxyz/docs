import { defineConfig } from 'zyzz'

// Shared layout and typography scales. Recipes reference typed CSS variables.
export const { vars: metrics } = defineConfig({
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
  vars: {
    spacing: {
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '14': '56px',
      '16': '64px',
      '18': '72px',
      '20': '80px',
      '24': '96px',
      '28': '112px',
      '36': '144px',
      '40': '160px',
      '44': '176px',
      '48': '192px',
      '56': '224px',
      '1_5': '6px',
      '3_5': '14px',
      '2_5': '10px',
      '0_5': '2px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    radius: {
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
    fontSize: {
      sm: '14px',
      xs: '12px',
    },
  },
})
