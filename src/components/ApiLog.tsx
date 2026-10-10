'use client'

import { type ReactNode, useState } from 'react'
import { type ApiRequest, type ApiResult, requestUrl } from '../lib/routes-execution'
import { inherited } from '../styles/inherited'
import { style, vars as tokens, variants } from '../styles/theme'
import * as Demo from './guides/Demo'

/** One API call in the log; repeated background reads fold into a single entry. */
export type ApiCall = {
  id: number
  request: ApiRequest
  result?: ApiResult
  repeats: number
  /** Whether the reader's key went with the request; quotes without one are public. */
  keyed: boolean
}

const json = (value: unknown) => JSON.stringify(value, null, 2)

const tokenPattern =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
/** Color JSON keys, strings, numbers and literals without a highlighting library. */
function highlight(text: string) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(tokenPattern)) {
    const start = match.index ?? 0
    if (start > last) parts.push(text.slice(last, start))
    const [token, string, colon] = match
    const kind = string ? (colon ? 'key' : 'string') : /^[tfn]/.test(token) ? 'literal' : 'number'
    parts.push(
      <span key={start} {...jsonToken({ kind })}>
        {string ?? token}
      </span>,
    )
    if (colon) parts.push(colon)
    last = start + token.length
  }
  parts.push(text.slice(last))
  return parts
}

function MethodBadge({ method }: { method: string }) {
  return <span {...methodBadge({ tone: method === 'GET' ? 'read' : 'write' })}>{method}</span>
}

function StatusCode({ result }: { result?: ApiResult }) {
  if (!result) return <span {...statusCode({ tone: 'pending' })}>…</span>
  const tone = result.status < 300 ? 'ok' : result.status < 500 ? 'warning' : 'error'
  return <span {...statusCode({ tone })}>{result.status || 'ERR'}</span>
}

export function CopyButton({ text }: { text: string }) {
  const [copied, copy] = Demo.useCopyToClipboard()
  return (
    <button type="button" onClick={() => void copy(text)} {...copyButton()}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

/** Every API call the demo makes, newest first, with the selected request or response. */
export function ApiLog({
  calls,
  busy,
  referenceHref = '/docs/api/routes/transfers',
}: {
  calls: ApiCall[]
  busy: boolean
  /** The API reference for the endpoints this flow calls. */
  referenceHref?: string
}) {
  const [selectedId, setSelectedId] = useState<number>()
  const [view, setView] = useState<'request' | 'response'>('response')
  const selected = calls.find((call) => call.id === selectedId) ?? calls[0]
  const text = !selected
    ? ''
    : view === 'request'
      ? json({
          url: requestUrl(selected.request),
          method: selected.request.method,
          headers: {
            ...(selected.keyed ? { 'tempo-api-key': '••••••••' } : {}),
            ...(selected.request.idempotencyKey
              ? { 'idempotency-key': selected.request.idempotencyKey }
              : {}),
          },
          ...(selected.request.body ? { body: selected.request.body } : {}),
        })
      : selected.result
        ? json(selected.result.data)
        : busy
          ? 'Waiting for response…'
          : 'No response received.'

  return (
    <section aria-label="API calls" {...panel()}>
      <header {...panelHeader()}>
        <span {...panelTitle()}>
          API calls
          {calls.length > 0 && <span {...callCount()}>{calls.length}</span>}
        </span>
        <a href={referenceHref} target="_blank" rel="noreferrer" {...referenceLink()}>
          API reference ↗
        </a>
      </header>
      {calls.length === 0 ? (
        <p {...emptyState()}>Every API request and response shows up here as you go.</p>
      ) : (
        <>
          <ul {...callList()}>
            {calls.map((call) => (
              <li key={call.id}>
                <button
                  type="button"
                  aria-pressed={call.id === selected?.id}
                  onClick={() => setSelectedId(call.id)}
                  {...callRow()}
                >
                  <MethodBadge method={call.request.method} />
                  <span {...callPath()}>{call.request.path}</span>
                  {call.repeats > 1 && <span {...callRepeats()}>×{call.repeats}</span>}
                  <StatusCode result={call.result} />
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <div {...detail()}>
              <div {...detailToolbar()}>
                <fieldset {...viewToggle()} aria-label="API panel view">
                  {(['request', 'response'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={view === value}
                      onClick={() => setView(value)}
                      {...viewToggleButton()}
                    >
                      {value === 'request' ? 'Request' : 'Response'}
                    </button>
                  ))}
                </fieldset>
                <CopyButton text={text} />
              </div>
              <pre {...detailBody()}>{highlight(text)}</pre>
            </div>
          )}
        </>
      )}
    </section>
  )
}

const jsonToken = variants({
  base: {},
  variants: {
    kind: {
      key: { color: tokens.color.blue11 },
      string: { color: tokens.color.jade11 },
      literal: { color: tokens.color.violet11 },
      number: { color: tokens.color.amber11 },
    },
  },
})

const methodBadge = variants({
  base: {
    display: 'inline-flex',
    width: '44px',
    flexShrink: 0,
    justifyContent: 'center',
    borderRadius: tokens.radius.sm,
    paddingInline: tokens.spacing['1'],
    paddingBlock: tokens.spacing['0_5'],
    fontFamily: tokens.fontFamily.code,
    fontSize: tokens.fontSize.tiny,
    fontWeight: tokens.fontWeight.medium,
  },
  variants: {
    tone: {
      read: { backgroundColor: tokens.color.blue3, color: tokens.color.blue11 },
      write: { backgroundColor: tokens.color.green3, color: tokens.color.green11 },
    },
  },
})

const statusCode = variants({
  base: { fontFamily: tokens.fontFamily.code, fontSize: tokens.fontSize.caption },
  variants: {
    tone: {
      pending: { color: tokens.color.gray10 },
      ok: { color: tokens.color.green11 },
      warning: { color: tokens.color.amber11 },
      error: { color: tokens.color.red11 },
    },
  },
})

const copyButton = style({
  flexShrink: 0,
  borderRadius: tokens.radius.md,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  paddingInline: tokens.spacing['2_5'],
  paddingBlock: tokens.spacing['1'],
  color: tokens.color.gray10,
  fontSize: tokens.fontSize.xs,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '@media (hover: hover)': {
    ':hover': {
      backgroundColor: inherited.color.surfacePanel,
      color: inherited.color.textColorPrimary,
    },
  },
})

const panel = style({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: tokens.radius.lg,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.line,
  backgroundColor: tokens.color.card,
  // The `.routes-tester` ancestor is the size container; side by side, the log follows the scroll.
  '@container (width >= 48rem)': {
    position: 'sticky',
    insetBlockStart: '96px',
    maxHeight: '40rem',
  },
})
const panelHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: tokens.color.line,
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['2_5'],
})
const panelTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.compact,
  fontWeight: tokens.fontWeight.medium,
})
const callCount = style({
  borderRadius: tokens.radius.full,
  backgroundColor: inherited.color.surfacePanel,
  paddingInline: tokens.spacing['1_5'],
  color: tokens.color.gray10,
  fontSize: tokens.fontSize.caption,
  fontVariantNumeric: 'tabular-nums',
})
const referenceLink = style({
  color: inherited.color.textColorAccent,
  fontSize: tokens.fontSize.xs,
  '@media (hover: hover)': { ':hover': { textDecorationLine: 'underline' } },
})
const emptyState = style({
  paddingInline: tokens.spacing['4'],
  paddingBlock: tokens.spacing['10'],
  textAlign: 'center',
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.sm,
})

const callList = style({
  maxHeight: '144px',
  flexShrink: 0,
  overflow: 'auto',
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: tokens.color.line,
  paddingBlock: tokens.spacing['1'],
})
const callRow = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: tokens.spacing['2'],
  paddingInline: tokens.spacing['3'],
  paddingBlock: tokens.spacing['1_5'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '@media (hover: hover)': { ':hover': { backgroundColor: inherited.color.surfacePanel } },
  selectors: { '&[aria-pressed="true"]': { backgroundColor: inherited.color.surfacePanel } },
})
const callPath = style({
  minWidth: 0,
  flex: '1 1 0%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: inherited.color.textColorPrimary,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
})
const callRepeats = style({
  color: tokens.color.gray10,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.caption,
})

const detail = style({ display: 'flex', minHeight: 0, flex: '1 1 0%', flexDirection: 'column' })
const detailToolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['2'],
  paddingInline: tokens.spacing['3'],
  paddingBlockStart: tokens.spacing['2_5'],
})
const viewToggle = style({
  display: 'inline-flex',
  borderRadius: tokens.radius.md,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  padding: tokens.spacing['0_5'],
})
const viewToggleButton = style({
  borderRadius: tokens.radius.sm,
  paddingInline: tokens.spacing['2'],
  paddingBlock: tokens.spacing['1'],
  color: tokens.color.gray10,
  fontSize: tokens.fontSize.xs,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  selectors: {
    '&[aria-pressed="true"]': {
      backgroundColor: inherited.color.surfacePanel,
      color: inherited.color.textColorPrimary,
    },
  },
})
const detailBody = style({
  minHeight: '160px',
  flex: '1 1 0%',
  overflow: 'auto',
  paddingInline: tokens.spacing['3'],
  paddingBlockStart: tokens.spacing['2'],
  paddingBlockEnd: tokens.spacing['3'],
  color: inherited.color.textColorPrimary,
  fontFamily: tokens.fontFamily.code,
  fontSize: tokens.fontSize.xs,
  lineHeight: inherited.lineHeight.leadingRelaxed,
})
