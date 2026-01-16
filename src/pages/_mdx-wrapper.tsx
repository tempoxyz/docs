'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Json } from 'ox'
import type React from 'react'
import { Layout, MdxPageContext } from 'vocs'
import { WagmiProvider } from 'wagmi'
import { DemoContextProvider } from '../components/DemoContext'
import * as WagmiConfig from '../wagmi.config'

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

export default function MDXWrapper({ children }: { children: React.ReactNode }) {
  const context = MdxPageContext.use()
  return (
    <Layout>
      <WagmiProvider config={context.frontmatter?.mipd ? mipdConfig : config}>
        <QueryClientProvider client={queryClient}>
          <DemoContextProvider>{children}</DemoContextProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Layout>
  )
}
