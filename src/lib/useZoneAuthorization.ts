'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import type { Hex } from 'viem'
import { Store as ZoneStore } from 'viem/tempo'

const zoneAuthorizationInfoTimeoutMs = 5_000

export type ZoneAuthClientLike = {
  zone: {
    getAuthorizationTokenInfo: () => Promise<{
      account: Hex
      expiresAt: bigint
    }>
    signAuthorizationToken: (parameters: { zoneId: number }) => Promise<{
      authentication: {
        expiresAt: number
        zoneId: number
      }
      token: Hex
    }>
  }
}

export function useZoneAuthorization(parameters: {
  address: Hex | undefined
  chainId: number
  zoneId: number
  queryKey: readonly unknown[]
  zoneClient: ZoneAuthClientLike | undefined
}) {
  const { address, chainId, zoneId, queryKey, zoneClient } = parameters

  const statusQuery = useQuery({
    enabled: Boolean(address && zoneClient),
    queryKey,
    queryFn: async () => {
      if (!address) throw new Error('account address not ready')
      if (!zoneClient) throw new Error('zone client not ready')

      return getZoneAuthorizationStatus({ address, chainId, zoneClient })
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  })

  const authorizeMutation = useMutation({
    mutationFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      // Legacy sandbox chain IDs do not follow the current SDK derivation.
      return zoneClient.zone.signAuthorizationToken({ zoneId })
    },
    onSuccess: async () => {
      await statusQuery.refetch()
    },
  })

  return {
    authorizeMutation,
    error: authorizeMutation.error ?? statusQuery.error,
    isAuthorized: statusQuery.data !== null && statusQuery.data !== undefined,
    isChecking: statusQuery.fetchStatus === 'fetching',
    statusQuery,
  }
}

export async function getZoneAuthorizationStatus(parameters: {
  address: Hex
  chainId: number
  zoneClient: ZoneAuthClientLike
  storage?: ReturnType<typeof ZoneStore.defaultStore>
}) {
  const { address, chainId, zoneClient, storage = ZoneStore.defaultStore() } = parameters
  const lowerAddress = address.toLowerCase()
  const accountStoreKey = `auth:${lowerAddress}:${chainId}`
  const chainStoreKey = `auth:token:${chainId}`
  const accountToken = await storage.getItem(accountStoreKey)
  const chainToken = await storage.getItem(chainStoreKey)

  // A fresh account has no token to validate; authorization starts with a local signature.
  if (!accountToken && !chainToken) return null
  if (accountToken) await storage.setItem(chainStoreKey, accountToken)

  try {
    const info = await withTimeout(
      zoneClient.zone.getAuthorizationTokenInfo(),
      zoneAuthorizationInfoTimeoutMs,
    )
    const expired = info.expiresAt <= BigInt(Math.floor(Date.now() / 1000))
    const matchesAccount = info.account.toLowerCase() === lowerAddress

    if (!matchesAccount || expired) {
      await storage.removeItem(chainStoreKey)
      if (accountToken) await storage.removeItem(accountStoreKey)
      return null
    }

    if (!accountToken && chainToken) await storage.setItem(accountStoreKey, chainToken)
    return info
  } catch (error) {
    if (!isZoneAuthorizationError(error)) {
      // Keep a saved token when a transport failure prevents checking it.
      if (getErrorName(error) === 'HttpRequestError' || getErrorName(error) === 'TimeoutError') {
        throw new Error('The Zone RPC is unavailable. Retry when the endpoint is reachable.')
      }
      throw error
    }

    await storage.removeItem(chainStoreKey)
    if (accountToken) await storage.removeItem(accountStoreKey)
    return null
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout>

  return Promise.race([
    promise.then(
      (value) => {
        clearTimeout(timeout)
        return value
      },
      (error) => {
        clearTimeout(timeout)
        throw error
      },
    ),
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        const error = new Error('zone authorization info request timed out')
        error.name = 'TimeoutError'
        reject(error)
      }, timeoutMs)
    }),
  ])
}

function isZoneAuthorizationError(error: unknown): boolean {
  const status = getErrorStatus(error)
  if (status === 401 || status === 403) return true

  if (typeof error !== 'object' || error === null) return false

  // Check the server's error text, not the request metadata or a generic HTTP status.
  const messages = ['details', 'shortMessage'].flatMap((key) => {
    const value = (error as Record<string, unknown>)[key]
    return typeof value === 'string' ? [value] : []
  })
  if (!messages.length && 'message' in error && typeof error.message === 'string') {
    messages.push(error.message)
  }
  if (
    messages.some((message) =>
      /authorization token expired|missing X-Authorization-Token|invalid signature|keychain key (?:not authorized|revoked|expired)/i.test(
        message,
      ),
    )
  )
    return true

  return 'cause' in error && isZoneAuthorizationError(error.cause)
}

function getErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null

  if ('status' in error && typeof error.status === 'number') {
    return error.status
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode
  }

  if ('cause' in error) {
    return getErrorStatus(error.cause)
  }

  return null
}

function getErrorName(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null

  if ('name' in error && typeof error.name === 'string') {
    return error.name
  }

  if ('cause' in error) {
    return getErrorName(error.cause)
  }

  return null
}
