import type * as React from 'react'
import { cx } from '../../cva.config'

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
    <a
      className={cx(
        'relative my-6 flex min-h-10 w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border bg-invert px-4 py-2 font-medium text-[14px] text-invert no-underline transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      href={href}
    >
      {children}
    </a>
  )
}
