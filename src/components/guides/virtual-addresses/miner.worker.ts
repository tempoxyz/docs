import { VirtualMaster } from 'ox/tempo'
import type { Address, Hex } from 'viem'

type ToWorker =
  | {
      type: 'start'
      batchSize: number
      masterAddress: Address
      startHex: Hex
    }
  | { type: 'stop' }

type FromWorker =
  | { type: 'ready' }
  | {
      type: 'progress'
      attempts: number
      hashesPerSecond: number
    }
  | {
      type: 'found'
      attempts: number
      saltHex: string
      masterIdHex: string
      registrationHashHex: string
    }
  | { type: 'stopped'; attempts: number }
  | { type: 'error'; message: string }

function post(message: FromWorker) {
  self.postMessage(message)
}

let running = false

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const message = event.data

  if (message.type === 'stop') {
    running = false
    return
  }

  if (message.type !== 'start') return

  running = true

  const { masterAddress, startHex, batchSize } = message
  let nextStart = BigInt(startHex)
  let totalAttempts = 0
  const startedAt = performance.now()

  const mine = () => {
    if (!running) {
      post({ type: 'stopped', attempts: totalAttempts })
      return
    }

    try {
      const result = VirtualMaster.mineSalt({
        address: masterAddress,
        start: nextStart,
        count: batchSize,
      })

      if (result) {
        running = false
        const attemptsInBatch = Number(BigInt(result.salt) - nextStart + 1n)

        post({
          type: 'found',
          attempts: totalAttempts + attemptsInBatch,
          saltHex: result.salt,
          masterIdHex: result.masterId,
          registrationHashHex: result.registrationHash,
        })
        return
      }

      totalAttempts += batchSize
      nextStart += BigInt(batchSize)
      const elapsed = performance.now() - startedAt
      const hashesPerSecond = Math.round((totalAttempts / elapsed) * 1000)

      post({
        type: 'progress',
        attempts: totalAttempts,
        hashesPerSecond,
      })

      setTimeout(mine, 0)
    } catch (error) {
      running = false
      post({
        type: 'error',
        message: error instanceof Error ? error.message : 'Virtual master mining failed.',
      })
    }
  }

  post({ type: 'ready' })
  mine()
}
