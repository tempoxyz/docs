'use client'
import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi'

export function Connect() {
  const { connect } = useConnect()
  const connectors = useConnectors()

  const handleConnect =
    ({ type }: { type: 'sign-in' | 'sign-up' }) =>
    () => {
      const connector = connectors.find((c) => c.id === 'webAuthn')
      if (connector) {
        connect({ capabilities: { type }, connector })
      } else {
        console.error('webauthn connector not found')
      }
    }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleConnect({ type: 'sign-in' })}
        className="rounded-full bg-gray-200 px-3 py-1 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
      >
        Log in
      </button>
      <button
        type="button"
        onClick={handleConnect({ type: 'sign-up' })}
        className="rounded-full bg-blue-600 px-2 py-1 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Sign up
      </button>
    </div>
  )
}

export function ConnectAndDisconnect() {
  const { isConnected } = useAccount()
  const { connect } = useConnect()
  const connectors = useConnectors()
  const { disconnect } = useDisconnect()

  const handleConnect =
    ({ type }: { type: 'sign-in' | 'sign-up' }) =>
    () => {
      const connector = connectors.find((c) => c.id === 'webAuthn')
      if (connector) {
        connect({ capabilities: { type }, connector })
      } else {
        console.error('webauthn connector not found')
      }
    }

  const handleDisconnect = () => {
    disconnect()
  }

  if (!isConnected) {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConnect({ type: 'sign-in' })}
          className="rounded-full bg-gray-200 px-2 py-1 font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        >
          Log in
        </button>
        <button
          type="button"
          onClick={handleConnect({ type: 'sign-up' })}
          className="rounded-full bg-blue-600 px-2 py-1 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Sign up
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleDisconnect}
      className="rounded-full bg-red-600 px-2 py-1 font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
    >
      Disconnect
    </button>
  )
}
