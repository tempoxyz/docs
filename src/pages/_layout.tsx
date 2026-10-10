import '@tempoxyz/ds/platform.css'
import type { PropsWithChildren } from 'react'
import DocsEntryLayout from '../components/DocsEntryLayout'
import '../styles/globals'
import { normalizeProxiedRscFetch } from '../lib/rsc-route-normalization'

export { normalizeProxiedRscFetch } from '../lib/rsc-route-normalization'

export default function Layout(
  props: PropsWithChildren<{
    path: string
    frontmatter?: { interactive?: boolean; mipd?: boolean }
  }>,
) {
  return (
    <>
      <meta name="twitter:site" content="@tempo" />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static bootstrap must run before the RSC client bundle. */}
      <script dangerouslySetInnerHTML={{ __html: normalizeProxiedRscFetch }} />
      <DocsEntryLayout>{props.children}</DocsEntryLayout>
    </>
  )
}
