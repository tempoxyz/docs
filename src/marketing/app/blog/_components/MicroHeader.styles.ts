import { style } from 'zyzz'

export const blogMicroHeader = style({
  position: 'fixed',
  zIndex: 40,
  bottom: 'max(18px, env(safe-area-inset-bottom))',
  left: '50%',
  display: 'flex',
  width: 'min(560px, calc(100% - 32px))',
  alignItems: 'center',
  gap: '14px',
  overflow: 'hidden',
  border: '1px solid color-mix(in srgb, var(--color-foreground) 14%, transparent)',
  borderRadius: '6px',
  padding: '8px 10px 10px 16px',
  transform: 'translateX(-50%)',
  background: 'var(--color-surface-page)',
  color: 'var(--color-foreground)',
  fontFamily: 'var(--font-pilat-book), ui-sans-serif, system-ui, sans-serif',
  selectors: {
    '&[hidden]': {
      display: 'none',
    },
  },
  '@media (width < 480px)': {
    gap: '10px',
    paddingLeft: '12px',
  },
})

export const blogMicroSection = style({
  flex: 1,
  minWidth: 0,
  selectors: {
    '& select': {
      width: '100%',
      minWidth: 0,
      border: 0,
      padding: '6px 0',
      overflow: 'hidden',
      background: 'var(--color-surface-page)',
      color: 'inherit',
      font: 'inherit',
      fontSize: '12px',
      textOverflow: 'ellipsis',
      cursor: 'pointer',
    },
  },
})

export const blogMicroPostTitle = style({
  flex: 1,
  overflow: 'hidden',
  fontSize: '12px',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const blogMicroReadtime = style({
  color: 'color-mix(in srgb, var(--color-foreground) 65%, transparent)',
  fontSize: '11px',
  whiteSpace: 'nowrap',
  '@media (width < 480px)': {
    fontSize: '10px',
  },
})

export const blogMicroTop = style({
  display: 'grid',
  width: '32px',
  height: '32px',
  flexShrink: 0,
  placeItems: 'center',
  border: 0,
  borderRadius: '2px',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      background: 'color-mix(in srgb, var(--color-foreground) 10%, transparent)',
    },
  },
})

export const blogMicroProgress = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '2px',
  appearance: 'none',
  border: 0,
  background: 'color-mix(in srgb, var(--color-foreground) 8%, transparent)',
  color: 'var(--color-foreground)',
  selectors: {
    '&::-webkit-progress-bar': {
      background: 'color-mix(in srgb, var(--color-foreground) 8%, transparent)',
    },
    '&::-webkit-progress-value': {
      background: 'var(--color-foreground)',
    },
    '&::-moz-progress-bar': {
      background: 'var(--color-foreground)',
    },
  },
})
