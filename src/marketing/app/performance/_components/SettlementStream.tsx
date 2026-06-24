'use client'

import { useEffect, useState } from 'react'
import { createPublicClient, http } from 'viem'
import type { PerfRun } from '../_lib/runs'
import useMeasure from './useMeasure'

// The settlement story as a live conveyor: Viem watches Tempo's finalized
// chain head and pushes each real block into the stream. Since finalized heads
// are already settled, every cell represents an observed finalized block; the
// per-block interval is measured from each block's on-chain millisecond
// timestamp (`timestampMillis`), so it stays accurate even when polling catches
// up several finalized blocks at once.

// Tempo blocks carry a millisecond-precision Unix timestamp that standard EVM
// blocks lack. It is not part of viem's block type, so we read it off the raw
// block as a hex string.
type TempoBlock = { number: bigint | null; timestampMillis?: `0x${string}` }

const TEMPO_RPC_URL = 'https://rpc.tempo.xyz'
const TEMPO_EXPLORER_BLOCK_URL = 'https://explore.tempo.xyz/block'
const POLL_MS = 500

const H = 180
const CELL = 64 // square block cell, px
const GAP = 14
const STEP = CELL + GAP
const TRACK_TOP = (H - CELL) / 2
const TRACK_H = CELL + 24 // cells plus their height labels
const MAX_BLOCKS = 32

type StreamBlock = {
  height: bigint
  intervalMs: number | null
}

const client = createPublicClient({
  transport: http(TEMPO_RPC_URL),
  pollingInterval: POLL_MS,
})

export default function SettlementStream({ runs }: { runs: PerfRun[] }) {
  const { ref, width } = useMeasure<HTMLDivElement>()
  const latest = runs[runs.length - 1]
  const intervalMs = Math.min(Math.max(Math.round(latest?.blockTimeMs || 500), 400), 1200)

  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [blocks, setBlocks] = useState<StreamBlock[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let previousTimestampMs: number | null = null
    const unwatch = client.watchBlocks({
      blockTag: 'finalized',
      emitMissed: true,
      emitOnBegin: true,
      pollingInterval: POLL_MS,
      onBlock: (block) => {
        if (block.number === null) return
        const rawTimestamp = (block as TempoBlock).timestampMillis
        const timestampMs = rawTimestamp != null ? Number(rawTimestamp) : null
        const measuredInterval =
          timestampMs === null || previousTimestampMs === null
            ? null
            : Math.max(Math.round(timestampMs - previousTimestampMs), 0)
        if (timestampMs !== null) previousTimestampMs = timestampMs
        setIsLive(true)
        setBlocks((prev) => {
          if (prev.some(({ height }) => height === block.number)) return prev
          return [...prev, { height: block.number, intervalMs: measuredInterval }].slice(
            -MAX_BLOCKS,
          )
        })
      },
      onError: () => setIsLive(false),
    })

    return () => unwatch()
  }, [])

  // Enough cells to run flush past the container's left edge; the overflow
  // is clipped by the track and softened by the fade mask.
  const visible = Math.min(Math.max(Math.ceil(width / STEP) + 1, 3), MAX_BLOCKS)
  const shown = blocks.slice(-visible)
  const last = shown.length - 1
  const observedIntervals = blocks
    .map(({ intervalMs }) => intervalMs)
    .filter((value): value is number => value !== null)
  const avgIntervalMs =
    observedIntervals.length > 0
      ? Math.round(
          observedIntervals.reduce((sum, value) => sum + value, 0) / observedIntervals.length,
        )
      : intervalMs

  return (
    <div ref={ref} className="relative w-full" style={{ height: H }}>
      {width > 0 ? (
        <div>
          {/* "Now" cursor: the live marker sits over the block being built. */}
          <p
            className="absolute right-0 flex items-center gap-1.5 font-mono text-[9px] text-foreground/40 tracking-wider"
            style={{ top: TRACK_TOP - 22 }}
          >
            <span
              className={`block size-1.5 shrink-0 rounded-full ${isLive ? 'bg-indicator-green' : 'bg-foreground/25'}`}
            />
            FINALIZED
          </p>

          {/* The conveyor. Cells are anchored to the track's right edge and
              positioned by index-from-newest, so when a block arrives every
              older cell's transform changes and transitions one step left. */}
          <div
            className="absolute inset-x-0 overflow-hidden"
            style={{ top: TRACK_TOP, height: TRACK_H }}
          >
            {shown.map((b, i) => (
              <div
                key={b.height.toString()}
                className={`absolute top-0 right-0 ease-out motion-reduce:transition-none ${
                  reducedMotion ? '' : 'transition-transform duration-300'
                }`}
                style={{ transform: `translateX(${-(last - i) * STEP}px)` }}
              >
                <a
                  href={`${TEMPO_EXPLORER_BLOCK_URL}/${b.height.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open block ${b.height.toLocaleString('en-US')} in Tempo Explorer`}
                  className="group block outline-none"
                >
                  <div
                    className={`block-in settle-flash flex size-16 flex-col items-center justify-center gap-1 border-line-strong transition-colors group-hover:bg-surface-card group-focus-visible:bg-surface-card ${
                      i === last ? 'settled-cell' : 'bg-surface-panel'
                    }`}
                  >
                    <span className="font-mono text-[12px] text-indicator-green leading-none">
                      ✓
                    </span>
                    <span className="font-mono text-[11px] text-foreground/50 tracking-wider">
                      {b.intervalMs === null ? 'FINAL' : `${b.intervalMs} MS`}
                    </span>
                  </div>
                  <p className="mt-1.5 text-center font-mono text-[9px] text-foreground/25 tracking-wide transition-colors group-hover:text-foreground/45 group-focus-visible:text-foreground/45">
                    #{b.height.toLocaleString('en-US')}
                  </p>
                </a>
              </div>
            ))}

            {shown.length === 0 ? (
              <p
                className="absolute right-0 font-mono text-[10px] text-foreground/35 tracking-wider"
                style={{ top: CELL / 2 - 5 }}
              >
                Waiting for finalized blocks…
              </p>
            ) : null}

            {/* Mask the oldest block's exit at the track's left edge. */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface-shell to-transparent" />
          </div>

          {/* Rolling average interval, measured from finalized block arrivals. */}
          <div
            className="absolute flex items-center"
            style={{ right: CELL / 2, width: STEP, top: TRACK_TOP + TRACK_H + 6 }}
          >
            <span className="h-2 w-px bg-foreground/25" />
            <span className="h-px flex-1 bg-foreground/25" />
            <span className="h-2 w-px bg-foreground/25" />
          </div>
          <p
            className="absolute text-center font-mono text-[10px] text-foreground/35"
            style={{ right: CELL / 2, width: STEP, top: TRACK_TOP + TRACK_H + 16 }}
          >
            AVG {observedIntervals.length > 0 ? avgIntervalMs : `~${avgIntervalMs}`} MS
          </p>
        </div>
      ) : null}
    </div>
  )
}
