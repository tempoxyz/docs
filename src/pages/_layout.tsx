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
      {/* Preload every face the docs paint above the fold, so `font-display: swap` doesn't flash a fallback. */}
      {[
        '/fonts/pilat/Pilat-Book.woff2',
        '/fonts/pilat/Pilat-Demi.woff2',
        '/fonts/tempo-jetbrains-mono/TempoJetBrainsMono-Regular.woff2',
      ].map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
      <meta name="twitter:site" content="@tempo" />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static bootstrap must run before the RSC client bundle. */}
      <script dangerouslySetInnerHTML={{ __html: normalizeProxiedRscFetch }} />
      <DocsEntryLayout>{props.children}</DocsEntryLayout>
    </>
  )
}
