import type { Address } from 'viem'
import type { FromWorker, ToWorker } from './miner.protocol'

export type MinerState =
  | { status: 'idle' }
  | {
      status: 'mining'
      totalAttempts: number
      hashesPerSecond: number
      workerCount: number
    }
  | {
      status: 'found'
      salt: string
      masterId: string
      registrationHash: string
      attempts: number
      minedForAddress: Address
    }
  | { status: 'error'; message: string }

export type MinerPoolOptions = {
  masterAddress: Address
  workerCount?: number
  onStateChange: (state: MinerState) => void
}

function toHex(value: bigint) {
  return `0x${value.toString(16).padStart(64, '0')}`
}

export function createMinerPool(options: MinerPoolOptions) {
  const { masterAddress, onStateChange } = options
  const workerCount =
    options.workerCount ?? Math.max(1, Math.min(8, (navigator.hardwareConcurrency ?? 4) - 1))

  const workers: Worker[] = []
  const workerAttempts = new Map<number, number>()
  const workerHps = new Map<number, number>()
  let stopped = false

  const seedBytes = new Uint8Array(32)
  crypto.getRandomValues(seedBytes)
  const seedHex = `0x${Array.from(seedBytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
  const seed = BigInt(seedHex)
  const batchSize = 100_000

  function aggregateProgress() {
    let total = 0
    let hps = 0
    for (const attempts of workerAttempts.values()) total += attempts
    for (const rate of workerHps.values()) hps += rate
    return { total, hps }
  }

  function stopWorkers() {
    for (const worker of workers) {
      worker.postMessage({ type: 'stop' } satisfies ToWorker)
    }
    setTimeout(() => {
      for (const worker of workers) worker.terminate()
    }, 100)
  }

  function start() {
    stopped = false

    onStateChange({
      status: 'mining',
      totalAttempts: 0,
      hashesPerSecond: 0,
      workerCount,
    })

    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(new URL('./miner.worker.ts', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (event: MessageEvent<FromWorker>) => {
        const message = event.data
        if (stopped && message.type !== 'stopped') return

        switch (message.type) {
          case 'ready': {
            break
          }
          case 'progress': {
            workerAttempts.set(message.workerId, message.attempts)
            workerHps.set(message.workerId, message.hashesPerSecond)
            const { total, hps } = aggregateProgress()
            onStateChange({
              status: 'mining',
              totalAttempts: total,
              hashesPerSecond: hps,
              workerCount,
            })
            break
          }
          case 'found': {
            stopped = true
            workerAttempts.set(message.workerId, message.attempts)
            const { total } = aggregateProgress()
            onStateChange({
              status: 'found',
              salt: message.saltHex,
              masterId: message.masterIdHex,
              registrationHash: message.registrationHashHex,
              attempts: total,
              minedForAddress: masterAddress,
            })
            stopWorkers()
            break
          }
          case 'error': {
            stopped = true
            onStateChange({ status: 'error', message: message.message })
            stopWorkers()
            break
          }
          case 'stopped': {
            break
          }
        }
      }

      worker.onerror = (error) => {
        if (stopped) return
        stopped = true
        onStateChange({ status: 'error', message: error.message })
        stopWorkers()
      }

      worker.postMessage({
        type: 'start',
        workerId: i,
        masterAddress,
        startHex: toHex(seed + BigInt(i * batchSize)),
        stride: workerCount,
        batchSize,
      } satisfies ToWorker)
      workers.push(worker)
    }
  }

  function stop() {
    stopped = true
    stopWorkers()
    onStateChange({ status: 'idle' })
  }

  return { start, stop, workerCount }
}
