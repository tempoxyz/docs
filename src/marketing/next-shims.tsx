import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react'

export type Metadata = Record<string, unknown>

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children?: ReactNode
}

const prefetchedPaths = new Set<string>()

function prefetchPath(href: string) {
  if (typeof document === 'undefined') return
  if (!href.startsWith('/') || prefetchedPaths.has(href)) return
  prefetchedPaths.add(href)

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  link.as = 'document'
  document.head.appendChild(link)
}

export default function Link({ href, children, onFocus, onPointerEnter, ...props }: LinkProps) {
  return (
    <a
      {...props}
      href={href}
      onFocus={(event) => {
        prefetchPath(href)
        onFocus?.(event)
      }}
      onPointerEnter={(event) => {
        prefetchPath(href)
        onPointerEnter?.(event)
      }}
    >
      {children}
    </a>
  )
}

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  fill?: boolean
}

export function Image({ priority: _priority, fill: _fill, alt, ...props }: ImageProps) {
  return <img alt={alt} {...props} />
}

export function usePathname() {
  return typeof window === 'undefined' ? '/' : window.location.pathname
}

export function notFound(): never {
  throw new Error('Not found')
}
