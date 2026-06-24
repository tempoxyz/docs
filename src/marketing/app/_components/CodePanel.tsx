// biome-ignore-all lint/a11y/noSvgWithoutTitle: Copy-state SVGs are decorative inside labelled buttons.

'use client'

import { useState } from 'react'
import DotCanvas from './DotCanvas'

const COLOR = {
  keyword: 'var(--code-token-keyword)',
  fn: 'var(--code-token-function)',
  string: 'var(--code-token-string)',
  number: 'var(--code-token-number)',
  comment: 'var(--code-token-comment)',
  punct: 'var(--code-token-punctuation)',
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'const',
  'let',
  'var',
  'async',
  'await',
  'return',
  'new',
  'function',
  'if',
  'else',
  'for',
  'of',
  'in',
  'true',
  'false',
  'null',
  'undefined',
])

type Token = { text: string; color?: string; start: number }
type TokenRun = Token & { boxed: boolean }

function uniqueKey(base: string, counts: Map<string, number>) {
  const count = counts.get(base) ?? 0
  counts.set(base, count + 1)
  return count === 0 ? base : `${base}:${count}`
}

// Lightweight TS tokenizer — good enough for short, controlled snippets.
function tokenize(line: string): Token[] {
  const tokens: Token[] = []
  const re =
    /(\/\/[^\n]*)|(`[^`]*`|"[^"]*"|'[^']*')|(\b\d[\d_]*n?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\s])/g
  let match: RegExpExecArray | null
  while (true) {
    match = re.exec(line)
    if (match === null) break

    const [text, comment, str, num, ident, ws, punct] = match
    const start = match.index
    if (comment) tokens.push({ text, color: COLOR.comment, start })
    else if (str) tokens.push({ text, color: COLOR.string, start })
    else if (num) tokens.push({ text, color: COLOR.number, start })
    else if (ident) {
      if (KEYWORDS.has(ident)) tokens.push({ text, color: COLOR.keyword, start })
      else if (/^\s*\(/.test(line.slice(re.lastIndex)))
        tokens.push({ text, color: COLOR.fn, start })
      else tokens.push({ text, start })
    } else if (ws) tokens.push({ text, start })
    else if (punct) tokens.push({ text, color: COLOR.punct, start })
  }
  return tokens
}

// Char ranges in `line` covered by any of the highlight substrings.
function highlightRanges(line: string, highlight: string[]): [number, number][] {
  const ranges: [number, number][] = []
  for (const needle of highlight) {
    let from = line.indexOf(needle)
    while (from !== -1) {
      ranges.push([from, from + needle.length])
      from = line.indexOf(needle, from + needle.length)
    }
  }
  return ranges
}

function splitTokenByHighlights(token: Token, ranges: [number, number][]): TokenRun[] {
  const tokenStart = token.start
  const tokenEnd = token.start + token.text.length
  const bounds = new Set([tokenStart, tokenEnd])

  for (const [start, end] of ranges) {
    const from = Math.max(start, tokenStart)
    const to = Math.min(end, tokenEnd)
    if (from < to) {
      bounds.add(from)
      bounds.add(to)
    }
  }

  return [...bounds]
    .sort((a, b) => a - b)
    .slice(0, -1)
    .map((from, index, sorted) => {
      const to = sorted[index + 1] ?? tokenEnd
      return {
        ...token,
        text: token.text.slice(from - tokenStart, to - tokenStart),
        start: from,
        boxed: ranges.some(([start, end]) => from < end && to > start),
      }
    })
    .filter((run) => run.text.length > 0)
}

function renderCode(code: string[], highlight?: string[]) {
  const lineCounts = new Map<string, number>()

  return code.map((line) => {
    const lineKey = uniqueKey(line || 'blank-line', lineCounts)
    const tokens = tokenize(line)
    if (tokens.length === 0) return <div key={lineKey}>{'\u00A0'}</div>

    const ranges = highlight?.length ? highlightRanges(line, highlight) : []
    // Group adjacent tokens that share the same highlight state so each run of
    // emphasized code gets a single boxed container.
    const groups: { boxed: boolean; toks: TokenRun[] }[] = []
    for (const tok of tokens) {
      for (const run of splitTokenByHighlights(tok, ranges)) {
        const last = groups[groups.length - 1]
        if (last && last.boxed === run.boxed) last.toks.push(run)
        else groups.push({ boxed: run.boxed, toks: [run] })
      }
    }

    return (
      <div key={lineKey}>
        {groups.map((group) => {
          const groupStart = group.toks[0]?.start ?? 0
          const groupKey = `${group.boxed ? 'boxed' : 'plain'}:${groupStart}`
          const inner = group.toks.map((tok) => (
            <span
              key={`${tok.start}:${tok.text}`}
              style={tok.color ? { color: tok.color } : undefined}
            >
              {tok.text}
            </span>
          ))
          return group.boxed ? (
            <span
              key={groupKey}
              className="-mx-1 -my-0.5 rounded-[4px] bg-foreground/[0.07] px-1 py-0.5 ring-1 ring-foreground/10"
            >
              {inner}
            </span>
          ) : (
            <span key={groupKey}>{inner}</span>
          )
        })}
      </div>
    )
  })
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="5.25"
        y="5.25"
        width="8.5"
        height="8.5"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M10.75 3.25V3C10.75 1.9 9.85 1 8.75 1H3C1.9 1 1 1.9 1 3V8.75C1 9.85 1.9 10.75 3 10.75H3.25"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8.5L6.5 12L13 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy code"
      className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-[6px] border border-line bg-foreground/[0.04] px-2.5 py-1.5 font-mono text-[12px] text-foreground/55 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-foreground/[0.08] hover:text-foreground group-hover:opacity-100"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function CodePanel({
  code,
  sizer,
  highlight,
  inline,
  bare,
}: {
  code: string[]
  // Longest line across all of the row's snippets; locks the panel width so the
  // centered block never re-positions as snippets swap (font is monospaced).
  sizer?: string
  // Substrings of `code` to wrap in an emphasis container.
  highlight?: string[]
  // Mobile variant: a self-sizing, horizontally-scrollable code block (no dot
  // canvas) for use inside the accordion under a selected item.
  inline?: boolean
  // Drop the inline variant's own border for callers that frame the panel
  // themselves (e.g. window chrome on the API page).
  bare?: boolean
}) {
  if (inline) {
    return (
      <div
        className={`code-scroll min-h-0 flex-1 overflow-auto bg-surface-block p-4 ${
          bare ? '' : 'border border-line'
        }`}
      >
        <pre className="w-fit font-mono text-[12px] text-foreground/80 leading-[1.7]">
          <code>{renderCode(code, highlight)}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="relative flex-1">
      <DotCanvas />
      <div className="theme-preserve-dark group absolute inset-5 z-10 flex items-center justify-center bg-surface-onyx p-6">
        <CopyButton text={code.join('\n')} />
        <div className="grid">
          {sizer !== undefined && (
            <pre
              aria-hidden
              className="invisible h-0 overflow-hidden whitespace-pre font-mono text-[13px] leading-[1.7] [grid-area:1/1]"
            >
              {sizer}
            </pre>
          )}
          <pre className="font-mono text-[13px] text-foreground/80 leading-[1.7] [grid-area:1/1]">
            <code>{renderCode(code, highlight)}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
