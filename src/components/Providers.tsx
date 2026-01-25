'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Json } from 'ox'
import type React from 'react'
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

const config = WagmiConfig.getConfig()
const mipdConfig = WagmiConfig.getConfig({
  multiInjectedProviderDiscovery: true,
})

export default function Providers({
  children,
  mipd,
}: {
  children: React.ReactNode
  mipd?: boolean
}) {
  return (
    <WagmiProvider config={mipd ? mipdConfig : config}>
      <QueryClientProvider client={queryClient}>
        <DemoContextProvider>{children}</DemoContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
