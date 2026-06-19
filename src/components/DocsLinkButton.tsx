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
        'relative my-6 flex h-[32px] w-fit cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border bg-invert px-[14px] font-normal text-[14px] text-invert no-underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-dashed',
        className,
      )}
      href={href}
    >
      {children}
    </a>
  )
}
