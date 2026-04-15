import { createKeccak } from 'hash-wasm'
import type { FromWorker, ToWorker } from './miner.protocol'

function post(message: FromWorker) {
  self.postMessage(message)
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '0x'
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0')
  }
  return hex
}

let running = false

self.onmessage = async (event: MessageEvent<ToWorker>) => {
  const message = event.data

  if (message.type === 'stop') {
    running = false
    return
  }

  if (message.type === 'start') {
    running = true

    const { workerId, masterAddress, seedHex, startCounter, stride, batchSize } = message
    const hasher = await createKeccak(256)

    const addressBytes = hexToBytes(masterAddress)
    const seedBytes = hexToBytes(seedHex)

    const input = new Uint8Array(52)
    input.set(addressBytes, 0)

    const salt = new Uint8Array(32)
    salt.set(seedBytes.slice(0, 24), 0)

    let counter = startCounter
    let totalAttempts = 0
    const startTime = performance.now()

    const mine = () => {
      if (!running) {
        post({ type: 'stopped', workerId, attempts: totalAttempts })
        return
      }

      for (let i = 0; i < batchSize; i++) {
        const lo = counter & 0xffffffff
        const hi = (counter / 0x100000000) >>> 0

        salt[24] = (hi >>> 24) & 0xff
        salt[25] = (hi >>> 16) & 0xff
        salt[26] = (hi >>> 8) & 0xff
        salt[27] = hi & 0xff
        salt[28] = (lo >>> 24) & 0xff
        salt[29] = (lo >>> 16) & 0xff
        salt[30] = (lo >>> 8) & 0xff
        salt[31] = lo & 0xff

        input.set(salt, 20)

        hasher.init()
        hasher.update(input)
        const hash = hasher.digest('binary')

        if (hash[0] === 0 && hash[1] === 0 && hash[2] === 0 && hash[3] === 0) {
          running = false
          post({
            type: 'found',
            workerId,
            attempts: totalAttempts + i + 1,
            saltHex: bytesToHex(salt),
            masterIdHex: bytesToHex(hash.slice(4, 8)),
            hashHex: bytesToHex(hash),
          })
          return
        }

        counter += stride
      }

      totalAttempts += batchSize
      const elapsed = performance.now() - startTime
      const hashesPerSecond = Math.round((totalAttempts / elapsed) * 1000)

      post({
        type: 'progress',
        workerId,
        attempts: totalAttempts,
        hashesPerSecond,
      })

      setTimeout(mine, 0)
    }

    post({ type: 'ready', workerId })
    mine()
  }
}
