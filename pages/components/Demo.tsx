import { useState, type ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { formatEther } from 'viem'
import { ExternalLink, Wallet, Check, Loader2 } from 'lucide-react'

interface DemoProps {
  title: string
  description?: string
  children: ReactNode
  showBalance?: boolean
  showSourceCode?: string
}

export function Demo({ title, description, children, showBalance, showSourceCode }: DemoProps) {
  const { address, isConnected } = useAccount()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  
  return (
    <div className="demo-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold m-0">{title}</h3>
          {description && <p className="text-sm text-[var(--vocs-color_text2)] mt-1 mb-0">{description}</p>}
        </div>
        {showSourceCode && (
          <a 
            href={showSourceCode}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--vocs-color_text2)] hover:text-[var(--vocs-color_accent)]"
          >
            View Source <ExternalLink size={12} />
          </a>
        )}
      </div>
      
      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--vocs-color_accent)] text-white rounded-lg hover:bg-[var(--vocs-color_accentHover)] disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={16} />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[var(--vocs-color_background)] rounded-lg border border-[var(--vocs-color_border)]">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
            <div className="flex items-center gap-3">
              {showBalance && balance && (
                <span className="text-sm text-[var(--vocs-color_text2)]">
                  {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
                </span>
              )}
              <button
                onClick={() => disconnect()}
                className="text-xs text-[var(--vocs-color_text3)] hover:text-[var(--vocs-color_text)]"
              >
                Disconnect
              </button>
            </div>
          </div>
          
          {children}
        </div>
      )}
    </div>
  )
}

interface StepProps {
  number: number
  title: string
  children: ReactNode
  completed?: boolean
}

export function Step({ number, title, children, completed }: StepProps) {
  return (
    <div className="border-l-2 border-[var(--vocs-color_border)] pl-4 py-2">
      <div className="step-indicator">
        <span className={`step-number ${completed ? 'bg-green-500' : ''}`}>
          {completed ? <Check size={12} /> : number}
        </span>
        <span className="font-medium">{title}</span>
      </div>
      <div className="text-sm text-[var(--vocs-color_text2)]">{children}</div>
    </div>
  )
}

export default Demo
