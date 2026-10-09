import { defineConfig } from 'zyzz'

// Shared control recipes sit below caller-owned layout recipes in the cascade.
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
  defaultLayer: 'components',
})

export const button = variants({
  base: {
    position: 'relative',
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    borderRadius: '6px',
    border: '1px solid transparent',
    fontWeight: 500,
    transition: 'color 150ms, background-color 150ms, border-color 150ms, opacity 150ms',
    ':focus-visible': { outline: '2px solid var(--accent-blue)', outlineOffset: '3px' },
    ':disabled': { pointerEvents: 'none', cursor: 'default', opacity: 0.5 },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  defaultVariants: { size: 'default', variant: 'default' },
  variants: {
    size: {
      default: { minHeight: '40px', padding: '8px 16px', fontSize: '14px', lineHeight: '20px' },
    },
    disabled: { false: {}, true: { pointerEvents: 'none', opacity: 0.5 } },
    static: { false: {}, true: { pointerEvents: 'none', cursor: 'default' } },
    variant: {
      accent: {
        backgroundColor: 'var(--background-color-invert)',
        color: 'var(--text-color-invert)',
        '@media (hover: hover)': { ':hover': { opacity: 0.9 } },
      },
      default: {
        borderColor: 'var(--line-strong)',
        backgroundColor: 'var(--surface-card)',
        color: 'var(--text-color-primary)',
        '@media (hover: hover)': { ':hover': { backgroundColor: 'var(--surface-panel)' } },
      },
      destructive: {
        backgroundColor: 'var(--background-color-destructiveTint)',
        color: 'var(--text-color-destructive)',
        '@media (hover: hover)': { ':hover': { opacity: 0.9 } },
      },
    },
  },
})
