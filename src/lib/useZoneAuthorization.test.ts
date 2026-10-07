import { Storage } from 'viem/tempo'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { getZoneAuthorizationStatus, type ZoneAuthClientLike } from './useZoneAuthorization'

const address = '0x1111111111111111111111111111111111111111' as const
const chainId = 4217000006
const accountKey = `auth:${address}:${chainId}`
const chainKey = `auth:token:${chainId}`

function setup() {
  const storage = Storage.memory()
  const info = { account: address, expiresAt: BigInt(Math.floor(Date.now() / 1000) + 3600) }
  const getInfo = vi.fn().mockResolvedValue(info)
  const zoneClient: ZoneAuthClientLike = {
    zone: { getAuthorizationTokenInfo: getInfo, signAuthorizationToken: vi.fn() },
  }
  return { storage, info, getInfo, parameters: { address, chainId, storage, zoneClient } }
}

afterEach(() => vi.useRealTimers())

describe('Zone authorization checks', () => {
  test('a new account can sign without making an unauthenticated RPC request', async () => {
    const { parameters, getInfo } = setup()
    await expect(getZoneAuthorizationStatus(parameters)).resolves.toBeNull()
    expect(getInfo).not.toHaveBeenCalled()
  })

  test('restores the connected account token before validating private reads', async () => {
    const { parameters, storage, getInfo, info } = setup()
    await storage.setItem(accountKey, 'connected-account-token')
    await storage.setItem(chainKey, 'previous-account-token')
    getInfo.mockImplementationOnce(async () => {
      expect(await storage.getItem(chainKey)).toBe('connected-account-token')
      return info
    })
    await expect(getZoneAuthorizationStatus(parameters)).resolves.toEqual(info)
  })

  test.each([
    'expired',
    'other account',
    'rejected',
  ])('clears an %s token rather than authorizing private reads', async (mode) => {
    const { parameters, storage, getInfo, info } = setup()
    await storage.setItem(accountKey, 'old-token')
    if (mode === 'expired') getInfo.mockResolvedValue({ ...info, expiresAt: 0n })
    if (mode === 'other account')
      getInfo.mockResolvedValue({ ...info, account: '0x2222222222222222222222222222222222222222' })
    if (mode === 'rejected') getInfo.mockRejectedValue({ status: 403, name: 'HttpRequestError' })
    await expect(getZoneAuthorizationStatus(parameters)).resolves.toBeNull()
    expect(await storage.getItem(accountKey)).toBeNull()
    expect(await storage.getItem(chainKey)).toBeNull()
  })

  test('shows transport failure and preserves the token instead of treating it as expired', async () => {
    const { parameters, storage, getInfo } = setup()
    await storage.setItem(accountKey, 'valid-token')
    getInfo.mockRejectedValue({ status: 503, name: 'HttpRequestError' })
    await expect(getZoneAuthorizationStatus(parameters)).rejects.toThrow('Zone RPC is unavailable')
    expect(await storage.getItem(accountKey)).toBe('valid-token')
  })

  test('shows a stalled endpoint and retains the token after the request timeout', async () => {
    vi.useFakeTimers()
    const { parameters, storage, getInfo } = setup()
    await storage.setItem(accountKey, 'valid-token')
    getInfo.mockReturnValue(new Promise(() => {}))
    const result = expect(getZoneAuthorizationStatus(parameters)).rejects.toThrow(
      'Zone RPC is unavailable',
    )
    await vi.advanceTimersByTimeAsync(5000)
    await result
    expect(await storage.getItem(accountKey)).toBe('valid-token')
  })
})
