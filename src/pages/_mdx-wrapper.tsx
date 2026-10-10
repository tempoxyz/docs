'use client'

/**
 * MDX page wrapper: wraps every MDX page rendered by Vocs.
 *
 * ## Conditional Providers
 *
 * The Wagmi/QueryClient/DemoContext provider tree is only rendered on pages
 * that declare `interactive: true` in their frontmatter. Content-only pages
 * skip the provider tree entirely, avoiding wagmi config initialization.
 *
 * To make a page interactive (wallet connection, on-chain demos, etc.), add
 * to its frontmatter:
 *
 * ```yaml
 * ---
 * interactive: true
 * ---
 * ```
 *
 * ## Frontmatter flags
 *
 * - `interactive` loads the Wagmi/QueryClient provider tree. Required for
 *   any page that uses wallet hooks, Demo components, or guide steps.
 * - `mipd` enables Multi Injected Provider Discovery (auto-detects browser
 *   extension wallets like MetaMask). Implies `interactive`. Only needed on
 *   pages where users connect external wallets.
 * - `accessKey: false` connects Tempo Wallet without the guides' bounded access key: signing
 *   in only shares the address, and the wallet approves each transaction. Wallet connections, and
 *   the addresses in them, last only for the tab. Use it on pages that move real funds.
 */

import { lazy, type ReactNode, Suspense } from 'react'
import { Layout, MdxPageContext } from 'vocs'
import DocsPageActions from '../components/DocsPageActions'

const Providers = lazy(() => import('../components/Providers'))

export default function MDXWrapper({ children }: { children: ReactNode }) {
  const context = MdxPageContext.use()
  const frontmatter = context.frontmatter as Record<string, unknown> | undefined
  const needsProviders = Boolean(frontmatter?.interactive || frontmatter?.mipd)
  // The toolbar inserts its portal after the introduction. Mount it inside the
  // article's hydration boundary so it cannot change server HTML before React reads it.
  const content = (
    <>
      {children}
      <DocsPageActions key={String(frontmatter?.filePath ?? '')} />
    </>
  )

  return (
    <Layout>
      {needsProviders ? (
        <Suspense fallback={null}>
          <Providers
            mipd={frontmatter?.mipd as boolean | undefined}
            accessKey={frontmatter?.accessKey !== false}
          >
            {content}
          </Providers>
        </Suspense>
      ) : (
        content
      )}
    </Layout>
  )
}
