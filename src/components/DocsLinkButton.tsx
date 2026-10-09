import type * as React from 'react'
import { style } from '../styles/theme'

export function DocsLinkButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode
  className?: string
  href: string
}) {
  return (
    <a {...button({ className })} href={href}>
      {children}
    </a>
  )
}

const button = style({
  position: 'relative',
  marginBlock: '24px',
  display: 'flex',
  minHeight: '40px',
  width: 'fit-content',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  whiteSpace: 'nowrap',
  borderRadius: '6px',
  border: '1px solid currentColor',
  backgroundColor: 'var(--background-color-invert) !custom',
  color: 'var(--text-color-invert) !custom',
  padding: '8px 16px',
  fontWeight: 500,
  fontSize: '14px',
  textDecoration: 'none',
  transition: 'color 150ms, background-color 150ms, border-color 150ms, opacity 150ms',
  '@media (hover: hover)': { ':hover': { opacity: 0.9 } },
  ':focus-visible': { outline: '2px solid var(--accent-blue)', outlineOffset: '3px' },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})
