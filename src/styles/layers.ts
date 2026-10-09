// Every compilation entry must declare the same order. Client-reference CSS can
// arrive before the shell during direct navigation to an interactive MDX page.
export const cascadeLayers = [
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
] as const
