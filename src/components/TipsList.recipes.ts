import { style } from '../styles/recipes'
export const list = style({ display: 'flex', flexDirection: 'column', gap: '8px' })
export const card = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderRadius: '6px',
  border: '1px solid var(--vocs-border-color-primary)',
  backgroundColor: 'color-mix(in srgb, var(--surface-block) 70%, transparent)',
  padding: '10px 12px',
  textDecoration: 'none',
  transition: 'background-color 150ms',
  ':hover': { backgroundColor: 'var(--surface-block)' },
  ':focus-visible': { outline: '2px solid var(--accent-blue)', outlineOffset: '3px' },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
export const icon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  color: 'var(--vocs-text-color-secondary)',
})
export const copy = style({ display: 'flex', flexDirection: 'column', minWidth: 0 })
export const title = style({
  fontWeight: 500,
  fontSize: '14px',
  color: 'var(--vocs-text-color-heading)',
})
export const description = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: 'var(--vocs-text-color-secondary)',
  fontSize: '12px',
})
