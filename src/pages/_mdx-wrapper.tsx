'use client'

/**
 * MDX page wrapper — wraps every MDX page rendered by Vocs.
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
 * - `interactive` — loads the Wagmi/QueryClient provider tree. Required for
 *   any page that uses wallet hooks, Demo components, or guide steps.
 * - `mipd` — enables Multi Injected Provider Discovery (auto-detects browser
 *   extension wallets like MetaMask). Implies `interactive`. Only needed on
 *   pages where users connect external wallets.
 */

import type React from 'react'
import { Layout, MdxPageContext } from 'vocs'
import Providers from '../components/Providers'

export default function MDXWrapper({ children }: { children: React.ReactNode }) {
  const context = MdxPageContext.use()
  const frontmatter = context.frontmatter as Record<string, unknown> | undefined
  const needsProviders = Boolean(frontmatter?.interactive || frontmatter?.mipd)

  return (
    <Layout>
      {needsProviders ? (
        <Providers mipd={frontmatter?.mipd as boolean | undefined}>{children}</Providers>
      ) : (
        children
      )}
    </Layout>
  )
}
