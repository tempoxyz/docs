'use client'

import { useEffect, useId, useState } from 'react'
import './MicroHeader.css'

type Section = { id: string; title: string }

function sectionSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Reading controls sit below the article, clear of the shared developer header. */
export default function MicroHeader({ title }: { title: string }) {
  const selectId = useId()
  const [sections, setSections] = useState<Section[]>([])
  const [activeSection, setActiveSection] = useState('')
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [minutes, setMinutes] = useState(0)

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('[data-blog-article]')
    const content = document.querySelector<HTMLElement>('[data-blog-content]')
    const titleElement = document.querySelector<HTMLElement>('[data-blog-title]')
    if (!article || !content || !titleElement) return

    const headings = Array.from(content.querySelectorAll<HTMLHeadingElement>('h2'))
    const usedIds = new Set<string>()
    const nextSections = headings.map((heading, index) => {
      const base = heading.id || sectionSlug(heading.textContent ?? '') || `section-${index + 1}`
      let id = base
      let suffix = 2
      while (usedIds.has(id)) id = `${base}-${suffix++}`
      usedIds.add(id)
      heading.id = id
      return { id, title: heading.textContent?.trim() || `Section ${index + 1}` }
    })
    setSections(nextSections)
    const words = content.textContent?.trim().match(/\S+/g)?.length ?? 0
    setMinutes(Math.max(1, Math.ceil(words / 220)))

    let frame = 0
    const measure = () => {
      frame = 0
      const style = window.getComputedStyle(document.documentElement)
      const headerHeight =
        Number.parseFloat(style.getPropertyValue('--tempo-docs-primary-nav-height')) || 65
      const readingTop = headerHeight + 24
      setVisible(titleElement.getBoundingClientRect().bottom <= readingTop)
      const rect = content.getBoundingClientRect()
      const travel = Math.max(1, rect.height - (window.innerHeight - readingTop))
      setProgress(Math.max(0, Math.min(1, (readingTop - rect.top) / travel)))
      let current = ''
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= readingTop + 8) current = heading.id
      }
      setActiveSection(current)
    }
    const scheduleMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    const resize = new ResizeObserver(scheduleMeasure)
    resize.observe(article)
    window.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
    return () => {
      resize.disconnect()
      window.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      cancelAnimationFrame(frame)
    }
  }, [title])

  const scrollBehavior = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  return (
    <nav className="blog-micro-header" aria-label="Article navigation" hidden={!visible}>
      {sections.length > 0 ? (
        <div className="blog-micro-section">
          <label htmlFor={selectId} className="sr-only">
            Jump to article section
          </label>
          <select
            id={selectId}
            value={activeSection}
            onChange={(event) => {
              const id = event.target.value
              if (!id) {
                window.scrollTo({ top: 0, behavior: scrollBehavior() })
                return
              }
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
              window.history.replaceState(window.history.state, '', `#${id}`)
            }}
          >
            <option value="">{title}</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <span className="blog-micro-post-title">{title}</span>
      )}
      <span className="blog-micro-readtime">
        {progress >= 1 ? 'Read' : `${Math.max(1, Math.ceil(minutes * (1 - progress)))} min left`}
      </span>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
        aria-label="Back to top"
        className="blog-micro-top"
      >
        ↑
      </button>
      <progress
        className="blog-micro-progress"
        value={progress}
        max={1}
        aria-label="Article reading progress"
      />
    </nav>
  )
}
