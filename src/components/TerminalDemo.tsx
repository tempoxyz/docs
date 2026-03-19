'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

function randomHex(bytes: number) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes))
  return `0x${Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

function randomAddress() {
  return randomHex(20)
}

function randomTxHash() {
  return randomHex(32)
}

// ---------------------------------------------------------------------------
// Tiny sub-components
// ---------------------------------------------------------------------------

function Spinner() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setFrame((f) => (f + 1) % SPINNER_FRAMES.length), 80)
    return () => clearInterval(timer)
  }, [])
  return <span style={{ color: 'var(--term-blue9)' }}>{SPINNER_FRAMES[frame]}</span>
}

// biome-ignore format: contains unicode ✔︎
function StepIcon({ spinning }: { spinning: boolean }) {
  return (
    <span className="inline-block w-[1ch] text-center">
      {spinning ? (
        <Spinner />
      ) : (
        <span style={{ color: "var(--term-green9)" }}>✔︎</span>
      )}
    </span>
  );
}

function BlankLine() {
  return <div className="h-6" />
}

function TruncatedHex({ hash }: { hash: string }) {
  return (
    <>
      <span className="md:hidden">
        {hash.slice(0, 6)}…{hash.slice(-4)}
      </span>
      <span className="hidden md:inline">{hash}</span>
    </>
  )
}

// ---------------------------------------------------------------------------
// Photo output
// ---------------------------------------------------------------------------

function PhotoOutput({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div>
      <div
        className="relative block overflow-hidden rounded"
        style={{
          width: 200,
          height: 200,
          borderColor: 'var(--term-gray4)',
          borderWidth: 1,
          borderStyle: 'solid',
        }}
      >
        {!loaded && (
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--term-gray3)' }} />
        )}
        <img
          src={url}
          alt="Generated"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transition: 'opacity 0.5s',
            opacity: loaded ? 1 : 0,
          }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Simulated charge flow
// ---------------------------------------------------------------------------

function ChargeSteps({
  endpoint,
  output,
  address,
  onDone,
}: {
  endpoint: string
  output: string
  address: string
  onDone: () => void
}) {
  const txHash = useMemo(() => randomTxHash(), [])
  const doneCalled = useRef(false)

  const steps = useMemo(
    () => [
      { key: 'wallet', delay: 600 },
      { key: 'fund', delay: 1500 },
      { key: 'req402', delay: 500 },
      { key: 'pay', delay: 500 },
      { key: 'req200', delay: 500 },
    ],
    [],
  )

  const [step, setStep] = useState(0)
  const currentKey = steps[step]?.key ?? 'done'

  const pastStep = (key: string) => {
    const idx = steps.findIndex((s) => s.key === key)
    return idx !== -1 && step > idx
  }
  const atOrPast = (key: string) => {
    const idx = steps.findIndex((s) => s.key === key)
    return idx !== -1 && step >= idx
  }
  const atStep = (key: string) => currentKey === key

  useEffect(() => {
    if (currentKey === 'done') {
      if (!doneCalled.current) {
        doneCalled.current = true
        onDone()
      }
      return
    }
    const delay = steps[step].delay
    const timer = setTimeout(() => setStep((s) => s + 1), delay)
    return () => clearTimeout(timer)
  }, [step, currentKey, steps, onDone])

  return (
    <div className="flex flex-col">
      <BlankLine />
      {atOrPast('wallet') && (
        <p style={{ color: 'var(--term-gray6)' }}>
          <StepIcon spinning={atStep('wallet')} /> Create a wallet{' '}
          <span style={{ color: 'var(--term-gray5)' }}>⋅</span>{' '}
          <a
            href={`https://explore.tempo.xyz/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--term-blue9)' }}
          >
            <TruncatedHex hash={address} />
          </a>
        </p>
      )}
      {atOrPast('fund') && (
        <p style={{ color: 'var(--term-gray6)' }}>
          <StepIcon spinning={atStep('fund')} /> Add test funds{' '}
          <span style={{ color: 'var(--term-gray5)' }}>⋅</span>{' '}
          <span style={{ color: 'var(--term-amber9)' }}>100 USD</span>
        </p>
      )}
      {/* biome-ignore format: contains unicode → */}
      {atOrPast('req402') && (
        <p style={{ color: 'var(--term-gray6)' }}>
          <StepIcon spinning={atStep('req402')} /> Call {endpoint}
          {pastStep('req402') && (
            <>
              {' '}
              → <span style={{ color: 'var(--term-orange9)' }}>402</span>{' '}
              <span style={{ color: 'var(--term-gray6)' }}>(payment required)</span>
            </>
          )}
        </p>
      )}
      {atOrPast('pay') && (
        <p style={{ color: 'var(--term-gray6)' }}>
          <StepIcon spinning={atStep('pay')} /> Fulfill payment
          {pastStep('pay') && (
            <>
              {' '}
              <span style={{ color: 'var(--term-gray5)' }}>⋅</span>{' '}
              <a
                href={`https://explore.tempo.xyz/receipt/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: 'var(--term-blue9)' }}
              >
                {txHash.slice(0, 6)}…{txHash.slice(-4)}
              </a>
            </>
          )}
        </p>
      )}
      {/* biome-ignore format: contains unicode → */}
      {atOrPast('req200') && (
        <p style={{ color: 'var(--term-gray6)' }}>
          <StepIcon spinning={atStep('req200')} /> Call {endpoint}
          {pastStep('req200') && (
            <>
              {' '}
              → <span style={{ color: 'var(--term-orange9)' }}>200</span>{' '}
              <span style={{ color: 'var(--term-gray6)' }}>(success)</span>
            </>
          )}
        </p>
      )}
      {pastStep('req200') && (
        <>
          <BlankLine />
          <PhotoOutput url={output} />
          <BlankLine />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CSS triangle for the "Run demo" button
// ---------------------------------------------------------------------------

function CssTriangle() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 0,
        height: 0,
        borderTop: '0.3em solid transparent',
        borderBottom: '0.3em solid transparent',
        borderLeft: '0.45em solid currentColor',
        verticalAlign: 'middle',
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

export function TerminalDemo({ className }: { className?: string }) {
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [key, setKey] = useState(0)
  const [address] = useState(() => randomAddress())
  const [photoSeed, setPhotoSeed] = useState(() => Math.random().toString(36).slice(2))
  const photoUrl = `https://picsum.photos/seed/${photoSeed}/400/400`

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when content grows
  useEffect(() => {
    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (!scrollEl || !contentEl) return
    const observer = new ResizeObserver(() => {
      scrollEl.scrollTo({
        top: scrollEl.scrollHeight - scrollEl.clientHeight,
        behavior: 'smooth',
      })
    })
    observer.observe(contentEl)
    return () => observer.disconnect()
  }, [])

  const restart = () => {
    setStarted(false)
    setDone(false)
    setPhotoSeed(Math.random().toString(36).slice(2))
    setKey((k) => k + 1)
  }

  return (
    <div
      className={`terminal-theme ${className ?? ''}`}
      style={{
        fontFamily: 'var(--font-mono, "Geist Mono", monospace)',
        height: '100%',
        minHeight: 0,
        userSelect: 'text',
        WebkitUserSelect: 'text',
      }}
    >
      <div
        className="flex flex-col overflow-hidden rounded-xl"
        style={{
          height: '100%',
          minHeight: 0,
          borderColor: 'var(--vocs-border-color-primary, var(--term-gray4))',
          borderWidth: 1,
          borderStyle: 'solid',
          backgroundColor: 'var(--term-bg2)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            backgroundColor: 'var(--term-bg2)',
            borderBottom: '1px solid var(--term-gray4)',
          }}
        >
          <span
            className="rounded-full"
            style={{ width: 14, height: 14, backgroundColor: 'var(--term-gray4)' }}
          />
          <span
            className="rounded-full"
            style={{ width: 14, height: 14, backgroundColor: 'var(--term-gray4)' }}
          />
          <span
            className="rounded-full"
            style={{ width: 14, height: 14, backgroundColor: 'var(--term-gray4)' }}
          />
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={restart}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--term-gray5)',
              padding: 2,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--term-gray10)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--term-gray5)'
            }}
            aria-label="Restart demo"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Restart"
            >
              <title>Restart</title>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden break-words px-5 pb-5 text-[13.5px] leading-[1.35rem] md:text-[0.9rem] md:leading-[1.5rem]"
          style={{ backgroundColor: 'var(--term-bg2)' }}
        >
          <div ref={contentRef}>
            <div className="h-2" />

            {!started && (
              <div className="flex flex-col">
                <BlankLine />
                <button
                  type="button"
                  className="w-fit cursor-pointer text-left"
                  style={{ color: 'var(--term-pink9)' }}
                  onClick={() => setStarted(true)}
                >
                  <CssTriangle /> Run demo
                </button>
                <p style={{ color: 'var(--term-gray5)' }}>Press Enter or click to start</p>
              </div>
            )}

            {started && (
              <ChargeSteps
                key={key}
                endpoint="/api/photo"
                output={photoUrl}
                address={address}
                onDone={() => setDone(true)}
              />
            )}

            {done && (
              <button
                type="button"
                className="cursor-pointer text-left"
                style={{ color: 'var(--term-gray6)' }}
                onClick={restart}
              >
                [Press Enter or click to restart]
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
