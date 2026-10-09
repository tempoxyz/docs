'use client'

import { useQuery } from '@tanstack/react-query'
import * as ui from './TokenList.recipes'

const TOKEN_PREVIEW_LIMIT = 12

export function TokenListDemo({ limit = TOKEN_PREVIEW_LIMIT }: { limit?: number | null }) {
  const tokenList = useQuery({
    queryKey: ['tokenList', 4217],
    queryFn: async () => {
      const response = await fetch('https://tokenlist.tempo.xyz/list/4217')
      if (!response.ok) throw new Error('Unable to load token list')
      const data = await response.json()
      if (!Object.hasOwn(data, 'tokens')) throw new Error('Invalid token list')
      return data.tokens as Array<{
        name: string
        symbol: string
        decimals: number
        chainId: number
        address: string
        logoURI: string
        extensions: { chain: string }
      }>
    },
  })

  const tokens = limit === null ? tokenList.data : tokenList.data?.slice(0, limit)

  if (tokenList.isPending) return <p role="status">Loading assets…</p>
  if (tokenList.isError)
    return (
      <p role="status">
        Assets could not be loaded.{' '}
        <button type="button" onClick={() => tokenList.refetch()} {...ui.tokenListDemoButton()}>
          Try again
        </button>
      </p>
    )

  return (
    <ul {...ui.tokenListDemoList()}>
      {tokens?.map((token) => (
        <li key={token.address} title={token.address}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            {...ui.tokenListDemoLink()}
            href={`https://explore.tempo.xyz/address/${token.address}`}
          >
            <img src={token.logoURI} alt={token.name} {...ui.img()} />
            <span {...ui.tokenListDemoText()}>{token.name}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
