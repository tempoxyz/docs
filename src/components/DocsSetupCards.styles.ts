import { style } from 'zyzz'

export const docsSetupGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px',
  marginBlock: '24px',
  '@media (width < 640px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
})

export const docsSetupCard = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: '24px',
  borderRadius: '16px',
  background: 'var(--color-surface-block)',
  color: 'var(--color-foreground)',
  selectors: {
    '& h3': {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: 0,
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    '& svg': {
      flexShrink: 0,
    },
    '& p': {
      margin: '12px 0 24px',
      color: 'color-mix(in srgb, var(--color-foreground) 65%, transparent)',
      fontSize: '14px',
      lineHeight: 1.6,
    },
  },
})

export const docsSetupLinks = style({
  display: 'grid',
  gap: '4px',
  marginTop: 'auto',
  selectors: {
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      minHeight: '36px',
      padding: '6px 8px',
      marginInline: '-8px',
      borderRadius: '6px',
      color: 'inherit',
      fontSize: '14px',
      lineHeight: 1.5,
      textDecoration: 'none',
    },
    '& a:hover': {
      background: 'color-mix(in srgb, var(--color-foreground) 6%, transparent)',
    },
    '& a:focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: '2px',
    },
  },
})
