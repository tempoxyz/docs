'use client'

import { useState } from 'react'
import { cx as composeStyles } from 'zyzz'
import { blockIn, settledCell, settleFlash } from '../../../../styles/surfaces.styles'
import * as ui from './SettlementStream.recipes'
import { MAX_BLOCKS, useFinalizedBlocks } from './useFinalizedBlocks'
import useMeasure from './useMeasure'

// The settlement story as a live conveyor of finalized blocks. The live feed
// (and its heartbeat release cadence) lives in `useFinalizedBlocks`. Since
// finalized heads are already settled, every cell is an observed settlement —
// the stream is a steady heartbeat of real blocks. The block-time readout is
// the live observed average, measured from the finalized feed.

const TEMPO_EXPLORER_BLOCK_URL = 'https://explore.tempo.xyz/block'

const H = 180
const CELL = 64 // square block cell, px
const GAP = 14
const STEP = CELL + GAP
const TRACK_TOP = (H - CELL) / 2
const TRACK_H = CELL + 24 // cells plus their height labels

export default function SettlementStream() {
  const { ref, width } = useMeasure<HTMLDivElement>()
  const { blocks, isLive, avgIntervalMs } = useFinalizedBlocks()

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
    <div
      ref={ref}
      {...ui.settlementStreamLayoutAppearance({
        value0: `${H}px`,
        className: ui.settlementStreamLayout().className,
      })}
    >
      {width > 0 ? (
        <div>
          {/* "Now" cursor: the live marker sits over the block being built. */}
          <p
            {...ui.settlementStreamDescriptionAppearance({
              value0: `${TRACK_TOP - 22}px`,
              className: ui.settlementStreamDescription().className,
            })}
          >
            <span
              {...composeStyles(
                ui.settlementStreamText(),
                !!isLive && ui.settlementStreamText2(),
                !isLive && ui.settlementStreamText3(),
              )}
            />
            FINALIZED
          </p>

          {/* The conveyor. Cells are anchored to the track's right edge and
              positioned by index-from-newest, so when a block arrives every
              older cell's transform changes and transitions one step left. */}
          <div
            {...ui.settlementStreamLayoutAppearance2({
              value0: `${TRACK_TOP}px`,
              value1: `${TRACK_H}px`,
              className: ui.settlementStreamLayout2().className,
            })}
          >
            {shown.map((b, i) => (
              <div
                key={b.height.toString()}
                {...ui.settlementStreamLayoutAppearance3({
                  value0: `translateX(${-(last - i) * STEP}px)`,
                  className: ` ${ui.settlementStreamLayout3().className} ${
                    reducedMotion ? '' : ui.settlementStreamLayout4().className
                  }`,
                })}
              >
                <a
                  href={`${TEMPO_EXPLORER_BLOCK_URL}/${b.height.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open block ${b.height.toLocaleString('en-US')} in Tempo Explorer`}
                  {...ui.settlementStreamLink({ className: 'group' })}
                >
                  <div
                    className={` ${ui.settlementStreamLayout5({ className: `block-in settle-flash ${blockIn().className} ${settleFlash().className}` }).className} ${
                      i === last
                        ? `settled-cell ${settledCell().className}`
                        : ui.settlementStreamLayout6().className
                    }`}
                  >
                    <span {...ui.settlementStreamText4()}>✓</span>
                  </div>
                  <p {...ui.settlementStreamDescription2()}>#{b.height.toLocaleString('en-US')}</p>
                </a>
              </div>
            ))}

            {shown.length === 0 ? (
              <p
                {...ui.settlementStreamDescriptionAppearance2({
                  value0: `${CELL / 2 - 5}px`,
                  className: ui.settlementStreamDescription3().className,
                })}
              >
                Waiting for finalized blocks…
              </p>
            ) : null}

            {/* Mask the oldest block's exit at the track's left edge. */}
            <div {...ui.settlementStreamLayout7()} />
          </div>

          {/* Live observed avg block time, bracketing a single block interval,
              measured from the finalized feed. */}
          {avgIntervalMs != null ? (
            <>
              <div
                {...ui.settlementStreamLayoutAppearance4({
                  value0: `${CELL / 2}px`,
                  value1: `${STEP}px`,
                  value2: `${TRACK_TOP + TRACK_H + 6}px`,
                  className: ui.settlementStreamLayout8().className,
                })}
              >
                <span {...ui.settlementStreamText5()} />
                <span {...ui.settlementStreamText6()} />
                <span {...ui.settlementStreamText5()} />
              </div>
              <p
                {...ui.settlementStreamDescriptionAppearance3({
                  value0: `${CELL / 2 - 24}px`,
                  value1: `${STEP + 48}px`,
                  value2: `${TRACK_TOP + TRACK_H + 16}px`,
                  className: ui.settlementStreamDescription4().className,
                })}
              >
                <span {...ui.settlementStreamText7()}>AVG BLOCK TIME</span>
                <span {...ui.settlementStreamText8()}>{avgIntervalMs} MS</span>
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
