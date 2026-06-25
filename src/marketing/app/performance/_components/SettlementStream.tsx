'use client'

import { useState } from 'react'
import { MAX_BLOCKS, useFinalizedBlocks } from './useFinalizedBlocks'
import useMeasure from './useMeasure'

// The settlement story as a live conveyor of finalized blocks. The live feed
// (and its heartbeat release cadence) lives in `useFinalizedBlocks`. Since
// finalized heads are already settled, every cell is an observed settlement —
// the stream is a steady heartbeat of real blocks. It deliberately shows no
// block-time number; the "Avg block time" figure lives in the hero stat above.

const TEMPO_EXPLORER_BLOCK_URL = 'https://explore.tempo.xyz/block'

const H = 180
const CELL = 64 // square block cell, px
const GAP = 14
const STEP = CELL + GAP
const TRACK_TOP = (H - CELL) / 2
const TRACK_H = CELL + 24 // cells plus their height labels

export default function SettlementStream() {
  const { ref, width } = useMeasure<HTMLDivElement>()
  const { blocks, isLive } = useFinalizedBlocks()

  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  // Enough cells to run flush past the container's left edge; the overflow
  // is clipped by the track and softened by the fade mask.
  const visible = Math.min(Math.max(Math.ceil(width / STEP) + 1, 3), MAX_BLOCKS)
  const shown = blocks.slice(-visible)
  const last = shown.length - 1

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
                    className={`block-in settle-flash flex size-16 items-center justify-center border-line-strong transition-colors group-hover:bg-surface-card group-focus-visible:bg-surface-card ${
                      i === last ? 'settled-cell' : 'bg-surface-panel'
                    }`}
                  >
                    <span className="font-mono text-[18px] text-indicator-green leading-none">
                      ✓
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
        </div>
      ) : null}
    </div>
  )
}
