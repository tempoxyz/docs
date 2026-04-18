'use client'

import * as React from 'react'

const loadAddressDemo = () =>
  import('./AddFundsAddressDemo').then((mod) => ({ default: mod.AddFundsAddressDemo }))

const loadWalletDemo = () =>
  import('./AddFundsWalletDemo').then((mod) => ({ default: mod.AddFundsWalletDemo }))

const AddressDemo = React.lazy(loadAddressDemo)
const WalletDemo = React.lazy(loadWalletDemo)

function LoadDemoCard(props: {
  description: string
  load: () => Promise<unknown>
  loadLabel: string
  title: string
  Demo: React.ComponentType
}) {
  const { Demo, description, load, loadLabel, title } = props
  const [isLoaded, setIsLoaded] = React.useState(false)

  return (
    <div className="divide-y divide-gray4 rounded border border-gray4">
      <header className="flex h-[44px] items-center px-4">
        <div className="flex items-center gap-1.5">
          <h4 className="font-normal text-[14px] text-gray12 leading-none -tracking-[1%]">
            {title}
          </h4>
          <span className="flex h-[19px] items-center justify-center rounded-[30px] bg-accentTint px-1.5 text-center font-medium text-[9px] text-accent uppercase leading-none tracking-[2%]">
            demo
          </span>
        </div>
      </header>
      <div className="p-4">
        {isLoaded ? (
          <React.Suspense
            fallback={<p className="text-[14px] text-gray10 -tracking-[2%]">Loading demo...</p>}
          >
            <Demo />
          </React.Suspense>
        ) : (
          <div className="space-y-4">
            <p className="text-[14px] text-gray11 -tracking-[2%]">
              {description} Load the interactive demo only when you want to use it.
            </p>
            <button
              className="rounded-full bg-accent px-4 py-2 font-medium text-[14px] text-white -tracking-[2%]"
              type="button"
              onClick={() => setIsLoaded(true)}
              onFocus={() => {
                void load()
              }}
              onMouseEnter={() => {
                void load()
              }}
            >
              {loadLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AddFundsAddressDemoLoader() {
  return (
    <LoadDemoCard
      Demo={AddressDemo}
      description="Fund any address from this page without paying the wallet setup cost up front."
      load={loadAddressDemo}
      loadLabel="Load address demo"
      title="Fund an address"
    />
  )
}

export function AddFundsWalletDemoLoader() {
  return (
    <LoadDemoCard
      Demo={WalletDemo}
      description="Connect a browser wallet and request test stablecoins when you are ready to interact."
      load={loadWalletDemo}
      loadLabel="Load wallet demo"
      title="Connect and fund your wallet"
    />
  )
}
