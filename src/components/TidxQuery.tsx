'use client'

import * as React from 'react'
import { Container } from './Container'
import { SqlEditor } from './SqlEditor'
import * as ui from './TidxQuery.recipes'

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
    signature: 'Transfer(address indexed from, address indexed to, uint256 value)',
    sql: `SELECT "from", "to", value, block_num, tx_hash
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
  if (value === null) return <span {...ui.renderValueText()}>null</span>
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
        <h4 {...ui.tidxQueryHeading()}>
          Public <code>tidx</code> Query
        </h4>
      }
      headerRight={
        <button type="button" onClick={runQuery} disabled={isLoading} {...ui.tidxQueryButton()}>
          {isLoading ? 'Running...' : 'Run query'}
        </button>
      }
    >
      <div {...ui.tidxQueryLayout()}>
        <div {...ui.tidxQueryLayout2()}>
          <label {...ui.label()}>
            <span {...ui.tidxQueryText()}>Example</span>
            <select
              value={presetIndex}
              onChange={(event) => applyPreset(Number(event.target.value))}
              {...ui.select()}
            >
              {PRESETS.map((preset, index) => (
                <option key={preset.name} value={index}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
          <label {...ui.label()}>
            <span {...ui.tidxQueryText()}>Network</span>
            <select
              value={networkKey}
              onChange={(event) => setNetworkKey(event.target.value as 'mainnet' | 'testnet')}
              {...ui.select()}
            >
              {Object.entries(NETWORKS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name} ({value.chainId})
                </option>
              ))}
            </select>
          </label>
          <label {...ui.label()}>
            <span {...ui.tidxQueryText()}>Engine</span>
            <select
              value={engine}
              onChange={(event) => setEngine(event.target.value as 'postgres' | 'clickhouse')}
              {...ui.select()}
            >
              <option value="clickhouse">ClickHouse</option>
              <option value="postgres">PostgreSQL</option>
            </select>
          </label>
        </div>

        <p {...ui.tidxQueryDescription()}>{activePreset.description}</p>

        <label {...ui.label2()}>
          <span {...ui.tidxQueryText()}>Event signature (optional)</span>
          <input
            value={signature}
            onChange={(event) => setSignature(event.target.value)}
            placeholder="Transfer(address indexed from, address indexed to, uint256 value)"
            {...ui.tidxQueryInput()}
          />
        </label>

        <SqlEditor value={sql} onChange={setSql} minHeight="180px" />

        {error && <div {...ui.tidxQueryLayout3()}>{error}</div>}

        {result && (
          <div {...ui.tidxQueryLayout4()}>
            <div {...ui.tidxQueryLayout5()}>
              <span>Rows: {result.row_count}</span>
              <span>Engine: {result.engine}</span>
              {result.query_time_ms !== undefined && (
                <span>Query time: {result.query_time_ms.toFixed(1)} ms</span>
              )}
            </div>
            <div {...ui.tidxQueryLayout6()}>
              <table {...ui.table()}>
                <thead {...ui.thead()}>
                  <tr>
                    {result.columns.map((column) => (
                      <th key={column} {...ui.th()}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={JSON.stringify(row)} {...ui.tr()}>
                      {result.columns.map((column, cellIndex) => (
                        <td key={column} {...ui.td()}>
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
