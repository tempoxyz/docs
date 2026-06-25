'use client'

import { useEffect, useRef, useState } from 'react'
import { createPublicClient, http } from 'viem'

// Shared live feed of Tempo's finalized chain head, used by both the hero
// "Avg block time" stat and the settlement stream so they always agree.
//
// Viem watches the finalized head and buffers each real block, then a heartbeat
// releases them into the stream one at a time so squares appear at a steady
// cadence even when polling catches up several finalized blocks at once. Since
// finalized heads are already settled, every block is an observed settlement;
// the per-block interval is measured from each block's on-chain millisecond
// timestamp (`timestampMillis`), so the average stays accurate regardless of
// the release cadence.

// Tempo blocks carry a millisecond-precision Unix timestamp that standard EVM
// blocks lack. It is not part of viem's block type, so we read it off the raw
// block as a hex string.
type TempoBlock = { number: bigint | null; timestampMillis?: `0x${string}` }

const TEMPO_RPC_URL = 'https://rpc.tempo.xyz'
const POLL_MS = 500
// Release one buffered block per beat so the stream reads like a steady
// heartbeat even when polling catches up several finalized blocks at once.
const HEARTBEAT_MS = 520
// Cap the pending buffer so the stream cannot lag far behind the real head
// (e.g. after the tab was backgrounded); excess oldest blocks are dropped.
const QUEUE_CAP = 12

export const MAX_BLOCKS = 32

export type StreamBlock = {
  height: bigint
  intervalMs: number | null
}

const client = createPublicClient({
  transport: http(TEMPO_RPC_URL),
  pollingInterval: POLL_MS,
})

export function useFinalizedBlocks() {
  const [blocks, setBlocks] = useState<StreamBlock[]>([])
  const [isLive, setIsLive] = useState(false)
  // Blocks land here as soon as they're observed and drain on the heartbeat.
  const queueRef = useRef<StreamBlock[]>([])
  const seenRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let previousTimestampMs: number | null = null
    const unwatch = client.watchBlocks({
      blockTag: 'finalized',
      emitMissed: true,
      emitOnBegin: true,
      pollingInterval: POLL_MS,
      onBlock: (block) => {
        if (block.number === null) return
        const key = block.number.toString()
        if (seenRef.current.has(key)) return
        const rawTimestamp = (block as TempoBlock).timestampMillis
        const timestampMs = rawTimestamp != null ? Number(rawTimestamp) : null
        const measuredInterval =
          timestampMs === null || previousTimestampMs === null
            ? null
            : Math.max(Math.round(timestampMs - previousTimestampMs), 0)
        if (timestampMs !== null) previousTimestampMs = timestampMs
        seenRef.current.add(key)
        setIsLive(true)
        queueRef.current.push({ height: block.number, intervalMs: measuredInterval })
        if (queueRef.current.length > QUEUE_CAP) {
          queueRef.current = queueRef.current.slice(-QUEUE_CAP)
        }
      },
      onError: () => setIsLive(false),
    })

    return () => unwatch()
  }, [])

  // Heartbeat: release at most one buffered block per beat so cells appear at a
  // steady cadence rather than in bursts when several finalized blocks arrive
  // together.
  useEffect(() => {
    const id = setInterval(() => {
      const next = queueRef.current.shift()
      if (!next) return
      setBlocks((prev) => {
        if (prev.some(({ height }) => height === next.height)) return prev
        return [...prev, next].slice(-MAX_BLOCKS)
      })
    }, HEARTBEAT_MS)

    return () => clearInterval(id)
  }, [])

  const observedIntervals = blocks
    .map(({ intervalMs }) => intervalMs)
    .filter((value): value is number => value !== null)
  const avgIntervalMs =
    observedIntervals.length > 0
      ? Math.round(
          observedIntervals.reduce((sum, value) => sum + value, 0) / observedIntervals.length,
        )
      : null

  return { blocks, isLive, avgIntervalMs }
}
