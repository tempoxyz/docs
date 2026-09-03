'use client'

import relatedDocsManifest from 'virtual:graphite-related-docs'
import { Link, useRouter } from 'waku'
import { relatedDocsForRoute } from '../lib/graphite-related-docs'

export default function RelatedDocsLinks() {
  const { path } = useRouter()
  const links = relatedDocsForRoute(relatedDocsManifest, path ?? '/')
  if (links.length === 0) return null

  return (
    <section aria-labelledby="related-documentation" className="mt-10 border-line border-t pt-8">
      <h2
        className="mb-4 font-medium font-sans text-[20px] text-foreground tracking-[-0.01em]"
        id="related-documentation"
      >
        Related documentation
      </h2>
      <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
        {links.map((link) => (
          <li className="m-0" key={link.href}>
            <Link
              className="group block h-full rounded-lg border border-line p-4 text-foreground no-underline transition-colors hover:bg-surfaceTint"
              to={link.href}
              unstable_prefetchOnEnter
              unstable_prefetchOnView={false}
            >
              <span className="block font-medium text-[15px] leading-5">{link.title}</span>
              {link.description && (
                <span className="mt-1.5 block text-[14px] text-foreground/60 leading-5">
                  {link.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
