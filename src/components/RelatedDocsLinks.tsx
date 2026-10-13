'use client'

import relatedDocsManifest from 'virtual:graphite-related-docs'
import { Link, useRouter } from 'waku'
import { docsSections, docsUtilitySections, normalizeDocsSectionPath } from '../lib/docs-sections'
import { relatedDocsForRoute } from '../lib/graphite-related-docs'
import * as ui from './RelatedDocsLinks.recipes'

// Landing pages already provide curated paths into their section.
const curatedLandingRoutes = new Set([
  '/',
  '/docs/build',
  '/docs/development',
  '/docs/network',
  '/docs/payments',
  ...docsSections.map((section) => section.href),
  ...docsUtilitySections.map((section) => section.href),
])

export default function RelatedDocsLinks() {
  const { path } = useRouter()
  const route = normalizeDocsSectionPath(path ?? '/')
  if (curatedLandingRoutes.has(route)) return null

  const links = relatedDocsForRoute(relatedDocsManifest, route)
  if (links.length === 0) return null

  return (
    <section aria-labelledby="related-documentation" {...ui.relatedDocsLinksSection()}>
      <h2 {...ui.relatedDocsLinksHeading()} id="related-documentation">
        Related documentation
      </h2>
      <ul {...ui.relatedDocsLinksList()}>
        {links.map((link) => (
          <li {...ui.relatedDocsLinksItem()} key={link.href}>
            <Link
              className={ui.link({ className: 'group' }).className}
              to={link.href}
              unstable_prefetchOnEnter
              unstable_prefetchOnView={false}
            >
              <span {...ui.relatedDocsLinksText()}>{link.title}</span>
              {link.description && <span {...ui.relatedDocsLinksText2()}>{link.description}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
