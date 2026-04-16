import { VirtualMaster } from 'ox/tempo'
import type { FromWorker, ToWorker } from './miner.protocol'

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

  const { workerId, masterAddress, startHex, stride, batchSize } = message
  const strideSize = BigInt(batchSize) * BigInt(stride)
  let nextStart = BigInt(startHex)
  let totalAttempts = 0
  const startedAt = performance.now()

  const mine = () => {
    if (!running) {
      post({ type: 'stopped', workerId, attempts: totalAttempts })
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
          workerId,
          attempts: totalAttempts + attemptsInBatch,
          saltHex: result.salt,
          masterIdHex: result.masterId,
          registrationHashHex: result.registrationHash,
        })
        return
      }

      totalAttempts += batchSize
      nextStart += strideSize
      const elapsed = performance.now() - startedAt
      const hashesPerSecond = Math.round((totalAttempts / elapsed) * 1000)

      post({
        type: 'progress',
        workerId,
        attempts: totalAttempts,
        hashesPerSecond,
      })

      setTimeout(mine, 0)
    } catch (error) {
      running = false
      post({
        type: 'error',
        workerId,
        message: error instanceof Error ? error.message : 'Virtual master mining failed.',
      })
    }
  }

  post({ type: 'ready', workerId })
  mine()
}
