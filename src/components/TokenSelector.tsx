'use client'
import type { Address } from 'viem'
import { Hooks } from 'wagmi/tempo'

type TokenSelectorProps = {
  tokens: Address[]
  value: Address
  onChange: (token: Address) => void
  name?: string
}

function TokenOption({ token }: { token: Address }) {
  const { data: metadata, isPending } = Hooks.token.useGetMetadata({
    token,
  })

  if (isPending || !metadata) {
    return <option value={token}>{token}</option>
  }

  return <option value={token}>{metadata.symbol}</option>
}

export function TokenSelector(props: TokenSelectorProps) {
  const { tokens, value, onChange, name } = props

  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value as Address)}
      className="min-h-10 rounded-md border border-[var(--line-strong)] bg-[var(--surface-input)] px-3 font-normal text-[14px] text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--accent-blue)] focus-visible:outline-offset-2"
    >
      {tokens.map((token) => (
        <TokenOption key={token} token={token} />
      ))}
    </select>
  )
}
