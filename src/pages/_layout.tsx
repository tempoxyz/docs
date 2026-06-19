'use client'

import type { PropsWithChildren } from 'react'

export default function Layout(
  props: PropsWithChildren<{
    path: string
    frontmatter?: { interactive?: boolean; mipd?: boolean }
  }>,
) {
  return <>{props.children}</>
}
