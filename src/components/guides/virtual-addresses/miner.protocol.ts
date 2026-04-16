import type { Address } from 'viem'

export type ToWorker =
  | {
      type: 'start'
      workerId: number
      masterAddress: Address
      startHex: string
      stride: number
      batchSize: number
    }
  | { type: 'stop' }

export type FromWorker =
  | { type: 'ready'; workerId: number }
  | {
      type: 'progress'
      workerId: number
      attempts: number
      hashesPerSecond: number
    }
  | {
      type: 'found'
      workerId: number
      attempts: number
      saltHex: string
      masterIdHex: string
      registrationHashHex: string
    }
  | { type: 'stopped'; workerId: number; attempts: number }
  | { type: 'error'; workerId: number; message: string }
