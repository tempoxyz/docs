'use client'

import * as React from 'react'
import { Container } from './Container'
import { SqlEditor } from './SqlEditor'

type Network = {
  name: string
  chainId: number
  endpoint: string
}

type Preset = {
  name: string
  description: string
  network: 'mainnet' | 'testnet'
  engine: 'postgres' | 'clickhouse'
  signature?: string
  sql: string
}

type TidxResponse = {
  columns: string[]
  rows: Array<Array<string | number | boolean | null>>
  row_count: number
  engine: string
  query_time_ms?: number
  ok: boolean
}

const NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    chainId: 4217,
    endpoint: 'https://indexer.tempo.xyz',
  },
  testnet: {
    name: 'Testnet',
    chainId: 42431,
    endpoint: 'https://indexer.testnet.tempo.xyz',
  },
} as const satisfies Record<string, Network>

const PRESETS: Preset[] = [
  {
    name: 'Latest blocks',
    description: 'Read the most recent blocks from mainnet.',
    network: 'mainnet',
    engine: 'clickhouse',
    sql: `SELECT num, hash, timestamp
FROM blocks
ORDER BY num DESC
LIMIT 5`,
  },
  {
    name: 'Block count',
    description: 'Run a simple aggregate over the blocks table.',
    network: 'mainnet',
    engine: 'clickhouse',
    sql: `SELECT count() AS block_count
FROM blocks`,
  },
  {
    name: 'Recent transactions',
    description: 'Inspect recent testnet transactions.',
    network: 'testnet',
    engine: 'clickhouse',
    sql: `SELECT block_num, hash, "from", "to"
FROM txs
ORDER BY block_num DESC
LIMIT 5`,
  },
  {
    name: 'Decode Transfer events',
    description: 'Use a signature to query decoded event logs.',
    network: 'mainnet',
    engine: 'clickhouse',
    signature: 'Transfer(address,address,uint256)',
    sql: `SELECT arg0 AS from_address, arg1 AS to_address, arg2 AS value, block_num, tx_hash
FROM Transfer
ORDER BY block_num DESC
LIMIT 5`,
  },
]

function shorten(value: string) {
  if (!value.startsWith('0x') || value.length <= 18) return value
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

function renderValue(value: string | number | boolean | null) {
  if (value === null) return <span className="text-gray9 italic">null</span>
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') return shorten(value)
  return String(value)
}

export function TidxQuery() {
  const [presetIndex, setPresetIndex] = React.useState(0)
  const activePreset = PRESETS[presetIndex] ?? PRESETS[0]
  const [networkKey, setNetworkKey] = React.useState<'mainnet' | 'testnet'>(activePreset.network)
  const [engine, setEngine] = React.useState<'postgres' | 'clickhouse'>(activePreset.engine)
  const [signature, setSignature] = React.useState(activePreset.signature ?? '')
  const [sql, setSql] = React.useState(activePreset.sql)
  const [result, setResult] = React.useState<TidxResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const network = NETWORKS[networkKey]

  const applyPreset = (nextIndex: number) => {
    const next = PRESETS[nextIndex] ?? PRESETS[0]
    setPresetIndex(nextIndex)
    setNetworkKey(next.network)
    setEngine(next.engine)
    setSignature(next.signature ?? '')
    setSql(next.sql)
    setResult(null)
    setError(null)
  }

  const runQuery = async () => {
    const query = sql.trim()
    if (!query) {
      setError('Enter a SQL query.')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const url = new URL('/query', network.endpoint)
      url.searchParams.set('chainId', String(network.chainId))
      url.searchParams.set('engine', engine)
      url.searchParams.set('sql', query)
      if (signature.trim()) url.searchParams.set('signature', signature.trim())

      const response = await fetch(url)
      const json = await response.json()

      if (!response.ok || json.ok === false) {
        const message =
          typeof json === 'object' && json !== null && 'error' in json
            ? String((json as { error: unknown }).error)
            : response.statusText
        throw new Error(message)
      }

      setResult(json as TidxResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container
      headerLeft={
        <h4 className="font-normal text-[14px] text-gray12 leading-none">
          Hosted <code>tidx</code> Query
        </h4>
      }
      headerRight={
        <button
          type="button"
          onClick={runQuery}
          disabled={isLoading}
          className="rounded-md bg-accent px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Running...' : 'Run query'}
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-gray11">Example</span>
            <select
              value={presetIndex}
              onChange={(event) => applyPreset(Number(event.target.value))}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            >
              {PRESETS.map((preset, index) => (
                <option key={preset.name} value={index}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-gray11">Network</span>
            <select
              value={networkKey}
              onChange={(event) => setNetworkKey(event.target.value as 'mainnet' | 'testnet')}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            >
              {Object.entries(NETWORKS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name} ({value.chainId})
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-gray11">Engine</span>
            <select
              value={engine}
              onChange={(event) => setEngine(event.target.value as 'postgres' | 'clickhouse')}
              className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 text-gray12"
            >
              <option value="clickhouse">ClickHouse</option>
              <option value="postgres">PostgreSQL</option>
            </select>
          </label>
        </div>

        <p className="text-gray11 text-sm">{activePreset.description}</p>

        <label className="block space-y-1 text-sm">
          <span className="text-gray11">Event signature (optional)</span>
          <input
            value={signature}
            onChange={(event) => setSignature(event.target.value)}
            placeholder="Transfer(address,address,uint256)"
            className="w-full rounded-md border border-gray6 bg-gray1 px-3 py-2 font-mono text-gray12"
          />
        </label>

        <SqlEditor value={sql} onChange={setSql} minHeight="180px" />

        {error && (
          <div className="rounded-md border border-red6 bg-red2 px-3 py-2 text-red11 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-gray11 text-xs">
              <span>Rows: {result.row_count}</span>
              <span>Engine: {result.engine}</span>
              {result.query_time_ms !== undefined && (
                <span>Query time: {result.query_time_ms.toFixed(1)} ms</span>
              )}
            </div>
            <div className="overflow-x-auto rounded-md border border-gray6">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray2 text-gray11">
                  <tr>
                    {result.columns.map((column) => (
                      <th key={column} className="px-3 py-2 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={JSON.stringify(row)} className="border-gray5 border-t">
                      {result.columns.map((column, cellIndex) => (
                        <td key={column} className="px-3 py-2 font-mono">
                          {renderValue(row[cellIndex] ?? null)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
