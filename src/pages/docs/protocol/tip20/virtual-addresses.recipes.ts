import { style } from '../../../../styles/recipes'
import { vars as tokens } from '../../../../styles/theme'
export const img = style({
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        display: 'none',
      },
  },
})
export const img2 = style({
  display: 'none',
  borderRadius: tokens.radius.lg,
  '--corner-radius': tokens.radius.lg,
  selectors: {
    '&:where( [data-vocs-theme="dark"], [data-vocs-theme="dark"] *, [style*="color-scheme: dark"], [style*="color-scheme: dark"] * )':
      {
        display: 'block',
      },
  },
})
