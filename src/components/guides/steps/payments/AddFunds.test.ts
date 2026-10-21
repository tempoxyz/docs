import { BaseError, HttpRequestError, LimitExceededRpcError } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { getFundingError } from './AddFunds'

vi.mock('../../Demo', () => ({ Button: () => null, Login: () => null, Step: () => null }))

describe('test-fund request errors', () => {
  it.each([
    new LimitExceededRpcError(new Error('limit exceeded')),
    new HttpRequestError({ url: 'https://rpc.example', status: 429 }),
    new BaseError('request failed', {
      cause: new LimitExceededRpcError(new Error('limit exceeded')),
    }),
  ])('explains limits without inventing a cooldown or blocking existing funds', (error) => {
    expect(getFundingError(error)?.message).toBe(
      'Test-fund request limit reached. Wait before requesting more funds. You can continue if you already have enough of the selected tokens.',
    )
  })

  it('preserves unrelated errors', () => {
    const error = new HttpRequestError({ url: 'https://rpc.example', status: 503 })
    expect(getFundingError(error)).toBe(error)
  })

  it('does not report an error when funding succeeded', () => {
    expect(getFundingError(null)).toBeNull()
  })
})
