'use client'

import Link from 'next/link'
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import './MicroHeader.css'

type MicroHeaderLink = {
  href: string
  label: string
}

type Section = {
  id: string
  title: string
}

function sectionSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function ProgressRing({
  width: boxWidth,
  height: boxHeight,
  progress,
  uid,
  className,
  glow = 3.5,
  style,
}: {
  width: number
  height: number
  progress: number
  uid: string
  className: string
  glow?: number
  style?: CSSProperties
}) {
  const strokeWidth = 1.5
  const width = boxWidth - strokeWidth
  const height = boxHeight - strokeWidth
  const radius = height / 2
  const straight = Math.max(0, width - 2 * radius)
  const perimeter = 2 * straight + 2 * Math.PI * radius
  const startOffset = (straight / 2 / perimeter) * 100
  const visible = progress * 100
  const dash = `${visible} ${Math.max(0, 100 - visible) + 0.5}`
  const shared = {
    x: strokeWidth / 2,
    y: strokeWidth / 2,
    width,
    height,
    rx: radius,
    pathLength: 100,
    fill: 'none',
    stroke: `url(#${uid}-ink)`,
    strokeLinecap: 'round' as const,
    strokeDasharray: dash,
    strokeDashoffset: -startOffset,
  }

  return (
    <svg className={className} width={boxWidth} height={boxHeight} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-ink`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--vocs-color-accent)" stopOpacity={0.42} />
          <stop offset="100%" stopColor="var(--vocs-color-accent)" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={glow} />
        </filter>
        <mask
          id={`${uid}-mask`}
          maskUnits="userSpaceOnUse"
          x={-24}
          y={-24}
          width={boxWidth + 48}
          height={boxHeight + 48}
        >
          <rect x={-24} y={-24} width={boxWidth + 48} height={boxHeight + 48} fill="#fff" />
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={width}
            height={height}
            rx={radius}
            fill="#000"
          />
        </mask>
      </defs>
      <g mask={`url(#${uid}-mask)`}>
        <rect {...shared} strokeWidth={3.5} opacity={0.85} filter={`url(#${uid}-glow)`} />
      </g>
      <rect {...shared} strokeWidth={strokeWidth} />
    </svg>
  )
}

/**
 * Floating blog navigation adapted from tanishq.xyz's engineering MicroHeader.
 * It tracks the article's H2 sections and keeps reading progress available
 * after the primary site navigation has scrolled away.
 */
export default function MicroHeader({ title, links }: { title: string; links: MicroHeaderLink[] }) {
  const ringId = useId().replace(/:/g, '')
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [readMinutes, setReadMinutes] = useState(0)
  const [readTimeShown, setReadTimeShown] = useState(false)
  const [direction, setDirection] = useState(0)
  const [readBox, setReadBox] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [wash, setWash] = useState({ x: 0, width: 0, visible: false })

  const rootRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const readTimeRef = useRef<HTMLSpanElement>(null)
  const hoveredElementRef = useRef<HTMLElement | null>(null)
  const washFrameRef = useRef(0)
  const washRunningRef = useRef(false)
  const shownWashRef = useRef({ x: 0, width: 0 })
  const navigationLockRef = useRef(0)
  const lastIndexRef = useRef(-1)

  useEffect(() => {
    if (activeIndex === lastIndexRef.current) return
    setDirection(activeIndex > lastIndexRef.current ? 1 : -1)
    lastIndexRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    const header = rootRef.current
    if (!header) return

    const measure = () => {
      const readTime = readTimeRef.current
      if (!readTime) return
      const readTimeRect = readTime.getBoundingClientRect()
      const headerRect = header.getBoundingClientRect()
      setReadBox({
        x: readTimeRect.left - headerRect.left,
        y: readTimeRect.top - headerRect.top,
        width: readTimeRect.width,
        height: readTimeRect.height,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    if (readTimeRef.current) observer.observe(readTimeRef.current)
    return () => observer.disconnect()
  }, [readMinutes, readTimeShown])

  useEffect(() => {
    const content = document.querySelector<HTMLElement>('[data-blog-content]')
    if (!content) return

    let revealFrame = 0
    const syncContent = () => {
      const usedIds = new Set<string>()
      const headings = Array.from(content.querySelectorAll<HTMLHeadingElement>('h2'))
      const nextSections = headings.map((heading, index) => {
        const baseId =
          heading.id || sectionSlug(heading.textContent ?? '') || `section-${index + 1}`
        let id = baseId
        let suffix = 2
        while (usedIds.has(id)) {
          id = `${baseId}-${suffix}`
          suffix += 1
        }
        usedIds.add(id)
        heading.id = id
        return { id, title: heading.textContent?.trim() || `Section ${index + 1}` }
      })
      setSections(nextSections)

      const words = content.textContent?.trim().match(/\S+/g)?.length ?? 0
      const minutes = words > 0 ? Math.max(1, Math.round(words / 220)) : 0
      setReadMinutes(minutes)
      if (minutes > 0 && !revealFrame) {
        revealFrame = requestAnimationFrame(() => setReadTimeShown(true))
      }
    }

    syncContent()
    const observer = new MutationObserver(syncContent)
    observer.observe(content, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(revealFrame)
    }
  }, [title])

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('[data-blog-article]')
    const titleElement = document.querySelector<HTMLElement>('[data-blog-title]')
    if (!article || !titleElement) return

    let measureFrame = 0
    let progressFrame = 0
    let shownProgress = 0
    let targetProgress = 0

    const animateProgress = () => {
      const next = shownProgress + (targetProgress - shownProgress) * 0.14
      if (Math.abs(targetProgress - next) < 0.0008) {
        shownProgress = targetProgress
        setProgress(shownProgress)
        progressFrame = 0
        return
      }
      shownProgress = next
      setProgress(shownProgress)
      progressFrame = requestAnimationFrame(animateProgress)
    }

    const measure = () => {
      measureFrame = 0
      const titleHasPassed = titleElement.getBoundingClientRect().bottom <= 70
      setExpanded(titleHasPassed)

      const articleRect = article.getBoundingClientRect()
      const articleTop = window.scrollY + articleRect.top
      const progressEnd = Math.max(
        articleTop + 1,
        articleTop + articleRect.height - window.innerHeight * 0.72,
      )
      targetProgress = Math.max(
        0,
        Math.min(1, (window.scrollY - articleTop) / (progressEnd - articleTop)),
      )
      if (!progressFrame) progressFrame = requestAnimationFrame(animateProgress)

      if (Date.now() < navigationLockRef.current) return
      const headings = Array.from(
        document.querySelectorAll<HTMLHeadingElement>('[data-blog-content] h2'),
      )
      headings.forEach((heading, index) => {
        const section = sections[index]
        if (section) heading.id = section.id
      })
      let nextIndex = -1
      for (let index = 0; index < headings.length; index += 1) {
        if (headings[index].getBoundingClientRect().top <= 150) nextIndex = index
      }

      const pageBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
      if (pageBottom && headings.length > 0) nextIndex = headings.length - 1
      setActiveIndex(nextIndex)
    }

    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', scheduleMeasure, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
    return () => {
      window.removeEventListener('scroll', scheduleMeasure)
      window.removeEventListener('resize', scheduleMeasure)
      cancelAnimationFrame(measureFrame)
      cancelAnimationFrame(progressFrame)
    }
  }, [sections.length])

  useEffect(() => {
    if (!menuOpen) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const washTarget = () => {
    const hoveredElement = hoveredElementRef.current
    const header = rootRef.current
    if (!hoveredElement || !header) return null

    const segmentRect = hoveredElement.getBoundingClientRect()
    const headerRect = header.getBoundingClientRect()
    return { x: segmentRect.left - headerRect.left, width: segmentRect.width }
  }

  const followWash = (snap: boolean) => {
    if (snap) {
      const target = washTarget()
      if (target) shownWashRef.current = target
    }
    if (washRunningRef.current) return

    washRunningRef.current = true
    const tick = () => {
      const target = washTarget()
      if (!hoveredElementRef.current || !target) {
        washRunningRef.current = false
        return
      }

      const shown = shownWashRef.current
      const next = {
        x: shown.x + (target.x - shown.x) * 0.28,
        width: shown.width + (target.width - shown.width) * 0.28,
      }
      shownWashRef.current = next
      setWash({ ...next, visible: true })
      washFrameRef.current = requestAnimationFrame(tick)
    }
    washFrameRef.current = requestAnimationFrame(tick)
  }

  const moveWash = (event: ReactMouseEvent<HTMLElement>) => {
    const shouldSnap = hoveredElementRef.current === null
    hoveredElementRef.current = event.currentTarget
    followWash(shouldSnap)
  }

  useEffect(() => () => cancelAnimationFrame(washFrameRef.current), [])

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const backToTop = () => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const jumpToSection = (id: string) => {
    setMenuOpen(false)
    const index = sections.findIndex((section) => section.id === id)
    if (index >= 0) setActiveIndex(index)
    navigationLockRef.current = Date.now() + 900
    const headings = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('[data-blog-content] h2'),
    )
    const heading = document.getElementById(id) ?? (index >= 0 ? headings[index] : null)
    if (heading) heading.id = id
    heading?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const currentTitle = activeIndex >= 0 ? sections[activeIndex]?.title : title
  const previousSection = activeIndex > 0 ? sections[activeIndex - 1] : null
  const nextSection = activeIndex < sections.length - 1 ? sections[activeIndex + 1] : null
  const remainingMinutes = readMinutes * (1 - progress)
  const readLabel =
    progress >= 0.999 ? 'Done' : remainingMinutes < 1 ? '<1m' : `${Math.ceil(remainingMinutes)}m`
  const readAria = progress >= 0.999 ? 'Finished reading' : `About ${readLabel} left to read`

  return (
    <>
      <nav
        className="blog-micro-header"
        data-expanded={expanded || undefined}
        aria-label="Article navigation"
        ref={rootRef}
        onMouseLeave={() => {
          hoveredElementRef.current = null
          washRunningRef.current = false
          setWash((currentWash) => ({ ...currentWash, visible: false }))
        }}
      >
        <span
          className="blog-micro-wash"
          aria-hidden="true"
          style={{
            transform: `translateX(${wash.x}px)`,
            width: wash.width,
            opacity: wash.visible ? 1 : 0,
          }}
        />

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="blog-micro-segment"
            onMouseEnter={moveWash}
          >
            {link.label}
          </Link>
        ))}

        {readMinutes > 0 && (
          <span className="blog-micro-readtime-slot" data-shown={readTimeShown || undefined}>
            <span
              className="blog-micro-segment blog-micro-readtime"
              ref={readTimeRef}
              role="timer"
              aria-label={readAria}
              title="Reading time left"
            >
              <span className="blog-micro-readtime-number">{readLabel}</span>
            </span>
          </span>
        )}

        <span className="blog-micro-title" data-shown={expanded || undefined}>
          <button
            type="button"
            className="blog-micro-segment blog-micro-top"
            aria-label="Back to top"
            onMouseEnter={moveWash}
            onClick={backToTop}
          >
            <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
              <path
                d="M 6 10.5 L 6 2 M 2.5 5.5 L 6 2 L 9.5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </span>

        <span className="blog-micro-title" data-shown={expanded || undefined}>
          <span className="blog-micro-crumbs" data-direction={direction}>
            {previousSection && (
              <>
                <button
                  type="button"
                  className="blog-micro-segment blog-micro-crumb blog-micro-crumb-side"
                  aria-label={`Previous section: ${previousSection.title}`}
                  onMouseEnter={moveWash}
                  onClick={() => jumpToSection(previousSection.id)}
                >
                  <span key={previousSection.id} className="blog-micro-label-swap">
                    {previousSection.title}
                  </span>
                </button>
                <span className="blog-micro-crumb-separator" aria-hidden="true">
                  ›
                </span>
              </>
            )}

            <button
              type="button"
              className="blog-micro-segment blog-micro-crumb blog-micro-crumb-current"
              aria-label="Article sections"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onMouseEnter={moveWash}
              onClick={() => setMenuOpen((currentOpen) => !currentOpen)}
            >
              <span key={currentTitle} className="blog-micro-live-label">
                {currentTitle}
              </span>
              <svg
                className="blog-micro-chevron"
                viewBox="0 0 10 6"
                width="9"
                height="6"
                aria-hidden="true"
              >
                <path d="M 1 1 L 5 5 L 9 1" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>

            {nextSection && (
              <>
                <span className="blog-micro-crumb-separator" aria-hidden="true">
                  ›
                </span>
                <button
                  type="button"
                  className="blog-micro-segment blog-micro-crumb blog-micro-crumb-side"
                  aria-label={`Next section: ${nextSection.title}`}
                  onMouseEnter={moveWash}
                  onClick={() => jumpToSection(nextSection.id)}
                >
                  <span key={nextSection.id} className="blog-micro-label-swap">
                    {nextSection.title}
                  </span>
                </button>
              </>
            )}
          </span>
        </span>

        {readBox.width > 0 && progress > 0.008 && (
          <ProgressRing
            className="blog-micro-readtime-ring"
            uid={`${ringId}-readtime-progress`}
            width={readBox.width}
            height={readBox.height}
            progress={progress}
            glow={3}
            style={{ transform: `translate(${readBox.x}px, ${readBox.y}px)` }}
          />
        )}
      </nav>

      {menuOpen && sections.length > 0 && (
        <div className="blog-micro-menu" role="menu" aria-label="Article sections" ref={menuRef}>
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              role="menuitem"
              data-active={index === activeIndex || undefined}
              onClick={() => jumpToSection(section.id)}
            >
              <span className="blog-micro-menu-tick" aria-hidden="true" />
              <span className="blog-micro-menu-label">{section.title}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
