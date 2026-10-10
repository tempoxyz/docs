'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Json } from 'ox'
import * as React from 'react'
import { WagmiProvider } from 'wagmi'
import * as WagmiConfig from '../wagmi.config'
import { DemoContextProvider } from './DemoContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: Json.stringify,
    },
  },
})

export default function Providers({
  children,
  mipd,
  accessKey = true,
}: {
  children: React.ReactNode
  mipd?: boolean
  accessKey?: boolean
}) {
  const config = React.useMemo(
    () =>
      WagmiConfig.getConfig({
        multiInjectedProviderDiscovery: Boolean(mipd),
        accessKey,
      }),
    [mipd, accessKey],
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DemoContextProvider>{children}</DemoContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
