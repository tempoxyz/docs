'use client'

import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react'
import { style } from '../styles/recipes'

export type CopyButtonState = 'idle' | 'copying' | 'copied' | 'error'

type CopyButtonProps = Omit<ComponentProps<'button'>, 'children' | 'onClick' | 'type'> & {
  text: string | (() => string | Promise<string>)
  label?: string
  copyingLabel?: string
  icon?: ReactNode
  copiedIcon?: ReactNode
  resetAfter?: number
  onStateChange?: (state: CopyButtonState) => void
}

/** Copy supplied or asynchronously loaded text without changing the button's width. */
export function CopyButton({
  text,
  label = 'Copy',
  copyingLabel,
  icon,
  copiedIcon,
  resetAfter = 0,
  onStateChange,
  disabled,
  ...props
}: CopyButtonProps) {
  const [state, setState] = useState<CopyButtonState>('idle')
  const request = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      request.current += 1
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function copy() {
    const currentRequest = ++request.current
    if (timer.current) clearTimeout(timer.current)
    const update = (next: CopyButtonState) => {
      if (currentRequest !== request.current) return
      setState(next)
      onStateChange?.(next)
    }
    update('copying')
    try {
      const content = typeof text === 'function' ? await text() : text
      if (currentRequest !== request.current) return
      await navigator.clipboard.writeText(content)
      if (currentRequest !== request.current) return
      update('copied')
      if (resetAfter > 0) timer.current = setTimeout(() => update('idle'), resetAfter)
    } catch {
      update('error')
    }
  }

  return (
    <button {...props} type="button" disabled={disabled || state === 'copying'} onClick={copy}>
      {state === 'copied' ? (copiedIcon ?? icon) : icon}
      <span {...copyButtonLabel()}>
        {(copyingLabel ? [label, copyingLabel, 'Copied'] : [label, 'Copied']).map((label) => (
          <span key={label} aria-hidden="true">
            {label}
          </span>
        ))}
        <span>
          {state === 'copied' ? 'Copied' : state === 'copying' ? (copyingLabel ?? label) : label}
        </span>
      </span>
    </button>
  )
}

const copyButtonLabel = style({
  display: 'inline-grid',
  selectors: {
    '& > span': {
      gridArea: '1 / 1',
      whiteSpace: 'nowrap',
    },
    '& > [aria-hidden="true"]': {
      visibility: 'hidden',
    },
  },
})
