// biome-ignore-all lint/a11y/noSvgWithoutTitle: Dialog SVGs are decorative; controls carry their own labels.

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { loadSearchIndex, type SearchResult, searchDocs } from '../../search'
import { developersPath } from '../_lib/developersPaths'

export function searchResultHref(href: string): string {
  return developersPath(href)
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function PageIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 shrink-0 text-foreground/40"
    >
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M5 3h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function HashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 shrink-0 text-foreground/40"
    >
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </svg>
  )
}

function breadcrumbFor(result: SearchResult): string | null {
  return [result.category, ...(result.titles ?? [])].filter(Boolean).join(' › ') || null
}

function ResultRow({
  result,
  selected,
  onSelect,
  onHover,
}: {
  result: SearchResult
  selected: boolean
  onSelect: () => void
  onHover: () => void
}) {
  const breadcrumb = breadcrumbFor(result)
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: rows are pointer affordances; Enter is handled on the dialog input.
    <div
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      data-selected={selected}
      onMouseMove={onHover}
      onClick={onSelect}
      className={`group flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors ${
        selected ? 'bg-foreground/[0.06]' : ''
      }`}
    >
      {result.type === 'page' ? <PageIcon /> : <HashIcon />}
      <span className="flex min-w-0 flex-col gap-0.5">
        {breadcrumb ? (
          <span className="truncate font-sans text-[12px] text-foreground/45 tracking-[0]">
            {breadcrumb}
          </span>
        ) : null}
        <span className="truncate font-sans text-[14px] text-foreground tracking-[0]">
          {result.title}
        </span>
        {result.text ? (
          <span className="line-clamp-2 font-sans text-[13px] text-foreground/45 leading-[1.4] tracking-[0]">
            {result.text}
          </span>
        ) : null}
      </span>
    </div>
  )
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const indexRef = useRef<Awaited<ReturnType<typeof loadSearchIndex>> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load the index the first time the dialog opens.
  useEffect(() => {
    if (!open || indexRef.current) return
    let cancelled = false
    loadSearchIndex()
      .then((index) => {
        if (cancelled) return
        indexRef.current = index
        // Re-run the current query against the freshly loaded index.
        setQuery((q) => {
          setResults(q.trim() ? searchDocs(index, q) : [])
          return q
        })
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  // Reset transient state whenever the dialog closes.
  useEffect(() => {
    if (open) return
    setQuery('')
    setResults([])
    setSelectedIndex(0)
  }, [open])

  // Focus the input and lock background scroll while open.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.body.style.overflow = prevOverflow
      cancelAnimationFrame(id)
    }
  }, [open])

  const runQuery = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(0)
    const index = indexRef.current
    setResults(index && value.trim() ? searchDocs(index, value) : [])
  }, [])

  const go = useCallback(
    (result: SearchResult | undefined) => {
      if (!result) return
      onClose()
      window.location.assign(searchResultHref(result.href))
    },
    [onClose],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : i))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((i) => (i > 0 ? i - 1 : i))
          break
        case 'Enter':
          event.preventDefault()
          go(results[selectedIndex])
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    },
    [results, selectedIndex, go, onClose],
  )

  // Keep the highlighted row in view during keyboard navigation.
  useEffect(() => {
    listRef.current?.children[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const body = useMemo(() => {
    if (loadError) {
      return (
        <div className="px-4 py-10 text-center font-sans text-[14px] text-foreground/45">
          Couldn’t load search. Please try again.
        </div>
      )
    }
    if (!query.trim()) {
      return (
        <div className="px-4 py-10 text-center font-sans text-[14px] text-foreground/45">
          Start typing to search the docs…
        </div>
      )
    }
    if (results.length === 0) {
      return (
        <div className="px-4 py-10 text-center font-sans text-[14px] text-foreground/45">
          No results found
        </div>
      )
    }
    return (
      <div ref={listRef} role="listbox" aria-label="Search results" className="py-2">
        {results.map((result, i) => (
          <ResultRow
            key={result.id}
            result={result}
            selected={i === selectedIndex}
            onSelect={() => go(result)}
            onHover={() => setSelectedIndex(i)}
          />
        ))}
      </div>
    )
  }, [loadError, query, results, selectedIndex, go])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is a standard modal affordance.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled on the input/dialog.
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="flex max-h-[70vh] w-full max-w-[600px] flex-col overflow-hidden rounded-md border border-line bg-surface-page shadow-2xl"
      >
        <div className="flex items-center gap-3 border-line border-b px-4 py-3 text-foreground/60">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="marketing-search-results"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search documentation…"
            value={query}
            onChange={(event) => runQuery(event.target.value)}
            className="flex-1 bg-transparent font-sans text-[15px] text-foreground tracking-[0] outline-none placeholder:text-foreground/40"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-sans text-[11px] text-foreground/40">
            Esc
          </kbd>
        </div>
        <div id="marketing-search-results" className="flex-1 overflow-y-auto">
          {body}
        </div>
      </div>
    </div>,
    document.body,
  )
}
