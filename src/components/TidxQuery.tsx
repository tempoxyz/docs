'use client'
import * as React from 'react'
import { isAddress, isHash } from 'viem'
import { tempo } from 'viem/chains'
import { Container } from './Container'
import { Button } from './guides/Demo'
import { type QueryResponse, runTidxQuery } from './lib/Tidx'
import { extractParameterNames, getAllSignatures } from './lib/TidxSignatures'
import { SignatureSelector } from './SignatureSelector'
import { SqlEditor } from './SqlEditor'

type QueryResult = QueryResponse

// Default EVM tables and their columns from tidx.
const EVM_TABLE_COLUMNS = {
  blocks: [
    'num',
    'timestamp',
    'gas_limit',
    'gas_used',
    'hash',
    'parent_hash',
    'extra_data',
    'miner',
  ],
  txs: [
    'chain',
    'block_num',
    'block_timestamp',
    'idx',
    'type',
    'gas',
    'gas_limit',
    'gas_used',
    'max_fee_per_gas',
    'max_priority_fee_per_gas',
    'nonce',
    'hash',
    'from',
    'to',
    'input',
    'value',
  ],
  logs: [
    'chain',
    'block_num',
    'block_timestamp',
    'log_idx',
    'tx_hash',
    'address',
    'selector',
    'topic0',
    'topic1',
    'topic2',
    'topic3',
    'data',
  ],
  receipts: [
    'block_num',
    'block_timestamp',
    'tx_idx',
    'tx_hash',
    'from',
    'to',
    'contract_address',
    'gas_used',
    'cumulative_gas_used',
    'effective_gas_price',
    'status',
    'fee_payer',
  ],
} as const

type TidxQueryProps = {
  chainId: number
  signatures?: string[]
  query?: string
  title?: string
}

function getExplorerHost() {
  const { VITE_TEMPO_ENV, VITE_EXPLORER_OVERRIDE } = import.meta.env
  if (
    VITE_TEMPO_ENV !== 'testnet' &&
    VITE_TEMPO_ENV !== 'moderato' &&
    VITE_EXPLORER_OVERRIDE !== undefined
  ) {
    return VITE_EXPLORER_OVERRIDE
  }
  return tempo.blockExplorers.default.url
}

function classifyHash(value: string | number | boolean | null): {
  type: 'address' | 'token' | 'tx'
  value: string
} | null {
  if (typeof value !== 'string') return null

  if (!value.startsWith('0x')) return null

  if (value.length < 42) return null

  const lowerValue = value.toLowerCase()

  if (lowerValue.startsWith('0x20c')) {
    return { type: 'token', value }
  }

  if (isAddress(value)) {
    return { type: 'address', value }
  }

  if (isHash(value)) {
    return { type: 'tx', value }
  }

  return null
}

function renderCellValue(cell: string | number | boolean | null): React.ReactNode {
  if (cell === null) {
    return <span className="text-gray9 italic">null</span>
  }

  const classification = classifyHash(cell)

  if (!classification) {
    return String(cell)
  }

  const explorerHost = getExplorerHost()
  const pathMap = {
    address: 'account',
    token: 'token',
    tx: 'tx',
  }
  const explorerUrl = `${explorerHost}/${pathMap[classification.type]}/${classification.value}`

  const displayValue = `${classification.value.slice(0, 5)}...${classification.value.slice(-4)}`

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {displayValue}
    </a>
  )
}

export function TidxQuery(props: TidxQueryProps) {
  const isReadOnly = props.query !== undefined

  const allSignatures = React.useMemo(() => getAllSignatures(), [])

  const resolvedSignatures = React.useMemo(() => {
    if (!props.signatures) return []

    return props.signatures.map((sig) => {
      // If it looks like a full signature (contains parentheses), use it as-is
      if (sig.includes('(')) return sig

      // Otherwise, treat it as a name and look up the full signature
      const found = allSignatures.find((s) => s.name === sig)
      return found ? found.signature : sig
    })
  }, [props.signatures, allSignatures])

  const [signatures, setSignatures] = React.useState<string[]>(resolvedSignatures)
  const [result, setResult] = React.useState<QueryResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, startQueryTransition] = React.useTransition()

  const selectedSignatureInfos = React.useMemo(() => {
    return signatures
      .map((sig) => allSignatures.find((s) => s.signature === sig))
      .filter((s) => s !== undefined)
  }, [signatures, allSignatures])

  const completions = React.useMemo(() => {
    // Build table -> columns mapping
    const tableColumns = new Map<string, string[]>()

    Object.entries(EVM_TABLE_COLUMNS).forEach(([table, columns]) => {
      tableColumns.set(table, [...columns])
    })

    selectedSignatureInfos.forEach((info, idx) => {
      const tableName = info.name.toLowerCase()
      const columns = extractParameterNames(signatures[idx] || '')
      tableColumns.set(tableName, columns)
    })

    const tables = Array.from(tableColumns.keys())
    const columns = Array.from(new Set(Array.from(tableColumns.values()).flat()))

    return { tables, columns, tableColumns }
  }, [selectedSignatureInfos, signatures])

  const [query, setQuery] = React.useState(props.query || '')
  const queryRef = React.useRef(query)

  const handleQueryChange = (newQuery: string) => {
    queryRef.current = newQuery
    setQuery(newQuery)
  }

  // Update signatures if props change
  React.useEffect(() => {
    setSignatures(resolvedSignatures)
  }, [resolvedSignatures])

  const runQuery = React.useCallback(
    (nextQuery: string) => {
      const queryToRun = nextQuery.trim()

      if (!queryToRun) {
        setError('Please enter a SQL query')
        return
      }

      startQueryTransition(async () => {
        setError(null)
        setResult(null)

        try {
          const options = {
            chainId: props.chainId,
            ...(signatures.length > 0 ? { signatures } : {}),
          }
          const queryResult = await runTidxQuery(queryToRun, options)
          setResult(queryResult)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred')
        }
      })
    },
    [props.chainId, signatures],
  )

  const handleRunQuery = () => runQuery(query)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      runQuery(queryRef.current)
    }
  }

  return (
    <Container
      headerLeft={
        <h4 className="font-normal text-[14px] text-gray12 leading-none -tracking-[1%]">
          {props.title || 'tidx SQL Query'}
        </h4>
      }
      headerRight={
        <Button variant="accent" onClick={handleRunQuery} disabled={isLoading}>
          {isLoading ? 'Running...' : 'Run Query'}
        </Button>
      }
    >
      <div className="space-y-4">
        {props.signatures ? (
          <div className="flex w-full items-center space-y-2">
            <div className="flex w-full flex-wrap gap-1">
              {selectedSignatureInfos.map((sigInfo) => {
                const isEvent = sigInfo.type === 'event'
                return (
                  <div
                    key={sigInfo.signature}
                    className="inline-flex items-center gap-1.5 rounded border border-gray4 bg-gray3 px-2 py-1 font-mono text-[11px]"
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${
                        isEvent ? 'bg-blue9' : 'bg-purple9'
                      }`}
                    />
                    <span className="max-w-75 truncate text-gray11">{sigInfo.name}</span>
                  </div>
                )
              })}
              <p className="ml-auto flex items-center gap-1.5 text-[13px] text-gray11">SQL Query</p>
            </div>
          </div>
        ) : (
          <SignatureSelector value={signatures} onChange={setSignatures} disabled={isReadOnly} />
        )}

        <div className="space-y-2">
          <SqlEditor
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            readOnly={isReadOnly}
            disabled={isLoading || isReadOnly}
            completions={completions}
            className={`w-full rounded border border-gray4 bg-gray2 font-mono focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              isReadOnly ? 'text-[11px] leading-[1.4]' : 'text-[13px] leading-normal'
            }`}
            minHeight={isReadOnly ? '200px' : '120px'}
          />
        </div>

        {error && (
          <div className="rounded bg-destructiveTint px-3 py-2 font-normal text-[14px] text-destructive leading-normal -tracking-[2%]">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <div className="overflow-auto rounded border border-gray4">
              <table className="w-full text-[12px]">
                <thead className="border-gray4 border-b bg-gray2">
                  <tr>
                    {result.columns.map((col) => (
                      <th key={col.name} className="px-3 py-2 text-left font-medium text-gray12">
                        <div className="flex flex-col gap-0.5">
                          <span>{col.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.length === 0 ? (
                    <tr>
                      <td colSpan={result.columns.length} className="py-4 text-center text-gray9">
                        No rows returned
                      </td>
                    </tr>
                  ) : (
                    result.rows.map((row, rowIndex) => (
                      <tr
                        key={`row-${rowIndex}-${row.map((c) => (c === null ? 'null' : String(c))).join('-')}`}
                        className="border-gray4 border-b last:border-b-0 hover:bg-gray2"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${result.columns[cellIndex]?.name}-${rowIndex}`}
                            className="px-3 py-2 font-mono text-gray11"
                          >
                            {renderCellValue(cell)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
