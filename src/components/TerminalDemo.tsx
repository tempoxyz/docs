'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { terminalTheme } from '../styles/surfaces.styles'
import * as ui from './TerminalDemo.recipes'

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
  return <span {...ui.spinnerTextAppearance()}>{SPINNER_FRAMES[frame]}</span>
}

// biome-ignore format: contains unicode ✔︎
function StepIcon({ spinning }: { spinning: boolean }) {
  return (
    <span {...ui.stepIconText()}>
      {spinning ? (
        <Spinner />
      ) : (
        <span {...ui.stepIconTextAppearance()}>✔︎</span>
      )}
    </span>
  );
}

function BlankLine() {
  return <div {...ui.blankLineLayout()} />
}

function TruncatedHex({ hash }: { hash: string }) {
  return (
    <>
      <span {...ui.truncatedHexText()}>
        {hash.slice(0, 6)}…{hash.slice(-4)}
      </span>
      <span {...ui.truncatedHexText2()}>{hash}</span>
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
      <div {...ui.photoOutputLayoutAppearance({ className: ui.photoOutputLayout().className })}>
        {!loaded && (
          <div
            {...ui.photoOutputLayoutAppearance2({ className: ui.photoOutputLayout2().className })}
          />
        )}
        <img
          src={url}
          alt="Generated"
          onLoad={() => setLoaded(true)}
          {...ui.photoOutputImgAppearance({
            value0: loaded ? 1 : 0,
            className: ui.img().className,
          })}
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
    <div {...ui.chargeStepsLayout()}>
      <BlankLine />
      {atOrPast('wallet') && (
        <p {...ui.chargeStepsDescriptionAppearance()}>
          <StepIcon spinning={atStep('wallet')} /> Create a wallet{' '}
          <span {...ui.chargeStepsTextAppearance()}>⋅</span>{' '}
          <a
            href={`https://explore.tempo.xyz/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            {...ui.chargeStepsLinkAppearance({ className: ui.chargeStepsLink().className })}
          >
            <TruncatedHex hash={address} />
          </a>
        </p>
      )}
      {atOrPast('fund') && (
        <p {...ui.chargeStepsDescriptionAppearance2()}>
          <StepIcon spinning={atStep('fund')} /> Add test funds{' '}
          <span {...ui.chargeStepsTextAppearance2()}>⋅</span>{' '}
          <span {...ui.chargeStepsTextAppearance3()}>100 USD</span>
        </p>
      )}
      {/* biome-ignore format: contains unicode → */}
      {atOrPast('req402') && (
        <p {...ui.chargeStepsDescriptionAppearance3()}>
          <StepIcon spinning={atStep('req402')} /> Call {endpoint}
          {pastStep('req402') && (
            <>
              {' '}
              → <span {...ui.chargeStepsTextAppearance4()}>402</span>{' '}
              <span {...ui.chargeStepsTextAppearance5()}>(payment required)</span>
            </>
          )}
        </p>
      )}
      {atOrPast('pay') && (
        <p {...ui.chargeStepsDescriptionAppearance4()}>
          <StepIcon spinning={atStep('pay')} /> Fulfill payment
          {pastStep('pay') && (
            <>
              {' '}
              <span {...ui.chargeStepsTextAppearance6()}>⋅</span>{' '}
              <a
                href={`https://explore.tempo.xyz/receipt/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                {...ui.chargeStepsLinkAppearance2({ className: ui.chargeStepsLink().className })}
              >
                {txHash.slice(0, 6)}…{txHash.slice(-4)}
              </a>
            </>
          )}
        </p>
      )}
      {/* biome-ignore format: contains unicode → */}
      {atOrPast('req200') && (
        <p {...ui.chargeStepsDescriptionAppearance5()}>
          <StepIcon spinning={atStep('req200')} /> Call {endpoint}
          {pastStep('req200') && (
            <>
              {' '}
              → <span {...ui.chargeStepsTextAppearance7()}>200</span>{' '}
              <span {...ui.chargeStepsTextAppearance8()}>(success)</span>
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
  return <span {...ui.cssTriangleTextAppearance()} />
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
      {...ui.terminalDemoLayoutAppearance({
        className: `terminal-theme  ${terminalTheme().className} ${className ?? ''}`,
      })}
    >
      <div {...ui.terminalDemoLayoutAppearance2({ className: ui.terminalDemoLayout().className })}>
        {/* Title bar */}
        <div
          {...ui.terminalDemoLayoutAppearance3({ className: ui.terminalDemoLayout2().className })}
        >
          <span
            {...ui.terminalDemoTextAppearance({ className: ui.terminalDemoText().className })}
          />
          <span
            {...ui.terminalDemoTextAppearance2({ className: ui.terminalDemoText().className })}
          />
          <span
            {...ui.terminalDemoTextAppearance3({ className: ui.terminalDemoText().className })}
          />
          <span {...ui.terminalDemoTextAppearance4()} />
          <button
            type="button"
            onClick={restart}
            {...ui.terminalDemoButtonAppearance()}
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
          {...ui.terminalDemoLayoutAppearance4({ className: ui.terminalDemoLayout3().className })}
        >
          <div ref={contentRef}>
            <div {...ui.terminalDemoLayout4()} />

            {!started && (
              <div {...ui.chargeStepsLayout()}>
                <BlankLine />
                <button
                  type="button"
                  {...ui.terminalDemoButtonAppearance2({
                    className: ui.terminalDemoButton().className,
                  })}
                  onClick={() => setStarted(true)}
                >
                  <CssTriangle /> Run demo
                </button>
                <p {...ui.terminalDemoDescriptionAppearance()}>Press Enter or click to start</p>
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
                {...ui.terminalDemoButtonAppearance3({
                  className: ui.terminalDemoButton2().className,
                })}
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
