import type { PropsWithChildren } from 'react'

export default function Layout(
  props: PropsWithChildren<{
    path: string
    frontmatter?: { interactive?: boolean; mipd?: boolean }
  }>,
) {
  return (
    <>
      <link
        rel="preload"
        href="/fonts/pilat/Pilat-Book.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {props.children}
    </>
  )
}
