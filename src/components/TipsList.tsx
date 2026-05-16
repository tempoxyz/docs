'use client'

import { useState } from 'react'
import { Link } from 'vocs'
import FileText from '~icons/lucide/file-text'
import Search from '~icons/lucide/search'

const modules = import.meta.glob('../pages/protocol/tips/tip-*.mdx', {
  eager: true,
}) as Record<
  string,
  {
    frontmatter?: {
      id?: string
      title?: string
      description?: string
      status?: string
      searchable?: boolean
    }
  }
>

const tips = Object.entries(modules)
  .map(([path, mod]) => ({
    path: path.replace('../pages', '').replace(/\.mdx?$/, ''),
    ...mod.frontmatter,
  }))
  .filter((t) => t.searchable !== false && t.id && t.title)
  .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))

export function TipsList() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = q
    ? tips.filter(
        (tip) =>
          tip.id?.toLowerCase().includes(q) ||
          tip.title?.toLowerCase().includes(q) ||
          tip.description?.toLowerCase().includes(q) ||
          tip.status?.toLowerCase().includes(q),
      )
    : tips

  return (
    <div className="vocs:flex vocs:flex-col vocs:gap-3">
      <div className="vocs:relative">
        <Search className="vocs:pointer-events-none vocs:absolute vocs:left-3 vocs:top-1/2 vocs:-translate-y-1/2 vocs:size-4 vocs:text-secondary" />
        <input
          type="search"
          aria-label="Search TIPs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by number, name, or status…"
          className="vocs:w-full vocs:rounded-md vocs:border vocs:border-primary vocs:bg-surfaceTint/70 vocs:py-2 vocs:pl-9 vocs:pr-3 vocs:text-sm vocs:text-heading vocs:placeholder-secondary vocs:outline-none vocs:focus:border-link"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="vocs:text-secondary vocs:text-sm vocs:py-2">No TIPs found.</p>
      ) : (
        filtered.map((tip) => (
          <Link
            key={tip.id}
            to={tip.path}
            className="vocs:flex vocs:items-center vocs:gap-3 vocs:rounded-md vocs:border vocs:border-primary vocs:bg-surfaceTint/70 vocs:px-3 vocs:py-2.5 vocs:no-underline vocs:transition-colors vocs:hover:bg-surfaceTint"
          >
            <FileText className="vocs:size-4 vocs:shrink-0 vocs:text-secondary" />
            <div className="vocs:flex vocs:flex-col">
              <span className="vocs:font-medium vocs:text-heading vocs:text-sm">
                {tip.id}: {tip.title}
              </span>
              {tip.description && (
                <span className="vocs:line-clamp-1 vocs:text-secondary vocs:text-xs">
                  {tip.description}
                </span>
              )}
            </div>
          </Link>
        ))
      )}
    </div>
  )
}

export default TipsList
