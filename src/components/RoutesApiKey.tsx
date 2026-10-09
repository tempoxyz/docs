'use client'

import { useEffect, useRef, useState } from 'react'
import LucideKeyRound from '~icons/lucide/key-round'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'
import * as Demo from './guides/Demo'
import { note, input as textInput } from './RoutesControls'

/**
 * The project API key as a header pill that opens a small panel. Quotes are public, so
 * the panel stays out of the way until a reader wants their own routes or reaches creation.
 */
export function ApiKeyPill({
  apiKey,
  open,
  onOpenChange,
  onSave,
  locked,
}: {
  apiKey: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (apiKey: string) => void
  locked: boolean
}) {
  const [draft, setDraft] = useState(apiKey)
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) return
    setDraft(apiKey)
    input.current?.focus()
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) onOpenChange(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open, apiKey, onOpenChange])
  const save = (value: string) => {
    onSave(value)
    onOpenChange(false)
  }

  return (
    <div ref={root} {...anchor()}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="routes-api-key-panel"
        onClick={() => onOpenChange(!open)}
        {...pill()}
      >
        {apiKey ? (
          <>
            <span aria-hidden="true" {...keyDot()} />
            API key
            <span {...keySuffix()}>••••{apiKey.slice(-4)}</span>
          </>
        ) : (
          <>
            <LucideKeyRound aria-hidden="true" {...keyIcon()} />
            Add API key
          </>
        )}
      </button>
      {open && (
        <form
          id="routes-api-key-panel"
          onSubmit={(e) => {
            e.preventDefault()
            save(draft.trim())
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onOpenChange(false)
          }}
          {...panel()}
        >
          <label htmlFor="routes-api-key" {...panelLabel()}>
            Project API key
          </label>
          <input
            id="routes-api-key"
            ref={input}
            type="password"
            autoComplete="off"
            spellCheck={false}
            {...textInput()}
            value={draft}
            disabled={locked}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="routes:read and routes:write"
          />
          <p {...note()}>
            Add your API key from the{' '}
            <a
              href="https://console.tempo.xyz/?to=/:org/api-keys"
              target="_blank"
              rel="noreferrer"
              {...noteLink()}
            >
              Tempo API Console
            </a>{' '}
            to create transfers and deposit addresses using your organization's pricing.
          </p>
          {!locked && (
            <div {...panelActions()}>
              {apiKey && (
                <Demo.Button type="button" onClick={() => save('')}>
                  Remove
                </Demo.Button>
              )}
              <Demo.Button
                variant="accent"
                type="submit"
                disabled={!draft.trim() || draft.trim() === apiKey}
              >
                Use key
              </Demo.Button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}

const anchor = style({ position: 'relative' })
const pill = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: tokens.spacing['1_5'],
  borderRadius: tokens.radius.full,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  paddingInline: tokens.spacing['2_5'],
  paddingBlock: tokens.spacing['0_5'],
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.xs,
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '@media (hover: hover)': { ':hover': { backgroundColor: inherited.color.surfacePanel } },
  selectors: { '&[aria-expanded="true"]': { backgroundColor: inherited.color.surfacePanel } },
})
const keyDot = style({
  width: '6px',
  height: '6px',
  borderRadius: tokens.radius.full,
  backgroundColor: tokens.color.green9,
})
const keySuffix = style({ color: tokens.color.gray10, fontFamily: tokens.fontFamily.code })
const keyIcon = style({ width: '14px', height: '14px', color: tokens.color.gray10 })

const panel = style({
  position: 'absolute',
  insetBlockStart: '100%',
  insetInlineEnd: 0,
  // Above the route canvas and API log; `floating` (40) is the nearest shared layer to the old 30.
  zIndex: tokens.zIndex.floating,
  marginBlockStart: tokens.spacing['2'],
  width: 'min(22rem, calc(100vw - 5rem))',
  borderRadius: tokens.radius.lg,
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  backgroundColor: tokens.color.card,
  padding: tokens.spacing['4'],
  // design-exception: Lift the API key popover off the demo header with a soft drop shadow.
  boxShadow: '0 8px 24px rgb(0 0 0 / 0.12) !custom',
  selectors: {
    ':where(& > :not(:last-child))': {
      marginBlockStart: 0,
      marginBlockEnd: tokens.spacing['3'],
    },
  },
})
const panelLabel = style({
  display: 'block',
  color: inherited.color.textColorPrimary,
  fontSize: tokens.fontSize.compact,
  fontWeight: tokens.fontWeight.medium,
})
const noteLink = style({
  color: tokens.color.gray11,
  textDecorationLine: 'underline',
  textUnderlineOffset: '2px',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '@media (hover: hover)': { ':hover': { color: inherited.color.textColorPrimary } },
})
const panelActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: tokens.spacing['2'],
})
