import { style } from '../../../../styles/recipes'
export const img = style({
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        display: 'none',
      },
  },
})
export const img2 = style({
  display: 'none',
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        display: 'block',
      },
  },
})
