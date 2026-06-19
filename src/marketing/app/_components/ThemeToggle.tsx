// biome-ignore-all lint/a11y/noSvgWithoutTitle: Theme glyphs are decorative inside labelled radio buttons.
// biome-ignore-all lint/a11y/useSemanticElements: Segmented theme buttons expose radio state while applying changes immediately.

'use client'

import type { ReactNode } from 'react'
import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'vocs-theme'

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

function getServerTheme(): Theme {
  return 'system'
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const disableTransitionsCSS =
  '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  const html = document.documentElement

  const style = document.createElement('style')
  style.appendChild(document.createTextNode(disableTransitionsCSS))
  document.head.appendChild(style)

  html.setAttribute('data-vocs-theme', resolved)
  if (resolved === 'light') {
    html.dataset.theme = 'light'
  } else {
    delete html.dataset.theme
  }
  html.style.colorScheme = resolved

  window.getComputedStyle(document.body)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.head.removeChild(style)
    })
  })
}

function setStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // The visible theme should still change if storage is blocked.
  }
  window.dispatchEvent(new Event('tempo-theme-change'))
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('tempo-theme-change', onStoreChange)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemThemeChange = () => {
    if (getStoredTheme() === 'system') applyTheme('system')
  }
  mediaQuery.addEventListener('change', onSystemThemeChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('tempo-theme-change', onStoreChange)
    mediaQuery.removeEventListener('change', onSystemThemeChange)
  }
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getStoredTheme, getServerTheme)

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="flex w-fit items-center rounded-full border border-line-strong bg-surface-block p-0.5"
    >
      <Option label="Light theme" value="light" theme={theme}>
        <SunIcon />
      </Option>

      <Option label="Dark theme" value="dark" theme={theme}>
        <MoonIcon />
      </Option>

      <Option label="System theme" value="system" theme={theme}>
        <MonitorIcon />
      </Option>
    </div>
  )
}

function Option({
  children,
  label,
  value,
  theme,
}: {
  children: ReactNode
  label: string
  value: Theme
  theme: Theme
}) {
  const checked = theme === value

  return (
    <button
      type="button"
      role="radio"
      aria-label={label}
      aria-checked={checked}
      onClick={() => {
        setStoredTheme(value)
        applyTheme(value)
      }}
      className={`flex size-7 cursor-pointer items-center justify-center rounded-full border transition-all duration-150 ${
        checked
          ? 'border-line-strong bg-surface-shell text-foreground shadow-sm'
          : 'border-transparent text-foreground-secondary hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function SunIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2.5M12 19.5V22M4.93 4.93 6.7 6.7M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07 6.7 17.3M17.3 6.7l1.77-1.77"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 21h8M12 16v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
