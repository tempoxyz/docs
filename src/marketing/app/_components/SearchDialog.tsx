'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx as composeStyles } from 'zyzz'
import { loadSearchIndex, type SearchResult, searchDocs } from '../../search'
import { developersPath } from '../_lib/developersPaths'
import * as ui from './SearchDialog.recipes'

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
      aria-hidden="true"
      {...ui.searchIconIcon()}
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
      aria-hidden="true"
      {...ui.pageIconIcon()}
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
      aria-hidden="true"
      {...ui.pageIconIcon()}
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
      {...composeStyles(
        ui.resultRowLayout({ className: 'group' }),
        !!selected && ui.resultRowLayout2(),
      )}
    >
      {result.type === 'page' ? <PageIcon /> : <HashIcon />}
      <span {...ui.resultRowText()}>
        {breadcrumb ? <span {...ui.resultRowText2()}>{breadcrumb}</span> : null}
        <span {...ui.resultRowText3()}>{result.title}</span>
        {result.text ? <span {...ui.resultRowText4()}>{result.text}</span> : null}
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
      return <div {...ui.searchDialogLayout()}>Couldn’t load search. Please try again.</div>
    }
    if (!query.trim()) {
      return <div {...ui.searchDialogLayout()}>Start typing to search docs and blog posts…</div>
    }
    if (results.length === 0) {
      return <div {...ui.searchDialogLayout()}>No results found</div>
    }
    return (
      <div ref={listRef} role="listbox" aria-label="Search results" {...ui.searchDialogLayout2()}>
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
    <div {...ui.searchDialogLayout3()} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        {...ui.searchDialogLayout4()}
      >
        <div {...ui.searchDialogLayout5()}>
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
            placeholder="Search docs and blog posts…"
            value={query}
            onChange={(event) => runQuery(event.target.value)}
            {...ui.searchDialogInput()}
          />
          <kbd {...ui.kbd()}>Esc</kbd>
        </div>
        <div id="marketing-search-results" {...ui.searchDialogLayout6()}>
          {body}
        </div>
      </div>
    </div>,
    document.body,
  )
}
