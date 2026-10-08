'use client'

import type { PropsWithChildren } from 'react'
import { useRouter } from 'waku'
import DocsLayout from '../pages/docs/_layout'

/** Give the documentation entry pages the same shell as the guides. */
export default function DocsEntryLayout({ children }: PropsWithChildren) {
  const { path } = useRouter()
  const pathname = (path ?? '/').replace(/^\/developers(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  if (pathname === '/' || pathname === '/get-started') {
    return <DocsLayout path={pathname}>{children}</DocsLayout>
  }
  return children
}
