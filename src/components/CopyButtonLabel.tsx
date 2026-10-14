import type { ReactNode } from 'react'
import { style } from '../styles/recipes'

/** Keep every label in layout so copy feedback cannot resize the button. */
export function CopyButtonLabel({ children, labels }: { children: ReactNode; labels: string[] }) {
  return (
    <span {...copyButtonLabel()}>
      {labels.map((label) => (
        <span key={label} aria-hidden="true">
          {label}
        </span>
      ))}
      <span>{children}</span>
    </span>
  )
}

const copyButtonLabel = style({
  display: 'inline-grid',
  selectors: {
    '& > span': {
      gridArea: '1 / 1',
      whiteSpace: 'nowrap',
    },
    '& > [aria-hidden="true"]': {
      visibility: 'hidden',
    },
  },
})
