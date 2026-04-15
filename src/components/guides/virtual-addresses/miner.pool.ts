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
      hash: string
      attempts: number
      minedForAddress: string
    }
  | { status: 'error'; message: string }

export type MinerPoolOptions = {
  masterAddress: string
  workerCount?: number
  onStateChange: (state: MinerState) => void
}

export function createMinerPool(options: MinerPoolOptions) {
  const { masterAddress, onStateChange } = options
  const workerCount =
    options.workerCount ?? Math.max(1, Math.min(8, (navigator.hardwareConcurrency ?? 4) - 1))

  const workers: Worker[] = []
  const workerAttempts = new Map<number, number>()
  const workerHps = new Map<number, number>()
  let stopped = false

  const seedBytes = new Uint8Array(24)
  crypto.getRandomValues(seedBytes)
  const seedHex = `0x${Array.from(seedBytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
  const batchSize = 100_000

  function aggregateProgress() {
    let total = 0
    let hps = 0
    for (const attempts of workerAttempts.values()) total += attempts
    for (const rate of workerHps.values()) hps += rate
    return { total, hps }
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
              hash: message.hashHex,
              attempts: total,
              minedForAddress: masterAddress,
            })

            for (const current of workers) {
              current.postMessage({ type: 'stop' } satisfies ToWorker)
            }
            setTimeout(() => {
              for (const current of workers) current.terminate()
            }, 100)
            break
          }
          case 'error': {
            onStateChange({ status: 'error', message: message.message })
            break
          }
        }
      }

      worker.onerror = (error) => {
        if (stopped) return
        onStateChange({ status: 'error', message: error.message })
      }

      worker.postMessage({
        type: 'start',
        workerId: i,
        masterAddress,
        seedHex,
        startCounter: i,
        stride: workerCount,
        batchSize,
      } satisfies ToWorker)
      workers.push(worker)
    }
  }

  function stop() {
    stopped = true
    for (const worker of workers) {
      worker.postMessage({ type: 'stop' } satisfies ToWorker)
    }
    setTimeout(() => {
      for (const worker of workers) worker.terminate()
    }, 100)
    onStateChange({ status: 'idle' })
  }

  return { start, stop, workerCount }
}
