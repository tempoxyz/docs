'use client'

import { useEffect } from 'react'

const dialogSelector = '[data-base-ui-portal] > [role="dialog"]'

/**
 * S3: the Vocs search dialog grows and shrinks to fit its results. CSS cannot
 * transition a content-driven height, so this measures the dialog's natural
 * height and binds it to --tempo-search-height; styles/docsSearch.ts transitions
 * `height` to it (instantly under reduced motion). The dialog is Vocs' own markup,
 * so it is found when its search input takes focus.
 */
export function SearchDialogMotion() {
  useEffect(() => {
    let dialog: HTMLElement | null = null
    let frame = 0

    function measure() {
      frame = 0
      if (!dialog?.isConnected) {
        detach()
        return
      }
      const style = getComputedStyle(dialog)
      let height =
        Number.parseFloat(style.borderTopWidth) +
        Number.parseFloat(style.borderBottomWidth) +
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom)
      for (const child of dialog.children) {
        if (!(child instanceof HTMLElement)) continue
        const childStyle = getComputedStyle(child)
        if (childStyle.display === 'none' || childStyle.position === 'absolute') continue
        // The results list scrolls; its scroll height is its full content.
        height += childStyle.overflowY === 'auto' ? child.scrollHeight : child.offsetHeight
      }
      // Stop at Vocs' max height so the visible change takes the whole transition.
      const max = Number.parseFloat(style.maxHeight)
      if (max > 0) height = Math.min(height, max)
      dialog.style.setProperty('--tempo-search-height', `${Math.ceil(height)}px`)
    }

    function queue() {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    const resize = new ResizeObserver(queue)
    const mutations = new MutationObserver(() => {
      observeContent()
      queue()
    })

    function observeContent() {
      if (!dialog) return
      resize.disconnect()
      for (const child of dialog.querySelectorAll(':scope > div, :scope > div > *'))
        resize.observe(child)
    }

    function detach() {
      resize.disconnect()
      mutations.disconnect()
      dialog = null
    }

    function attach(next: HTMLElement) {
      if (next === dialog) return
      detach()
      dialog = next
      mutations.observe(next, { childList: true, subtree: true, characterData: true })
      observeContent()
      queue()
    }

    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLInputElement)) return
      if (event.target.getAttribute('role') !== 'combobox') return
      const next = event.target.closest<HTMLElement>(dialogSelector)
      if (next) attach(next)
    }

    document.addEventListener('focusin', onFocus)
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('focusin', onFocus)
      window.removeEventListener('resize', queue)
      detach()
    }
  }, [])

  return null
}
