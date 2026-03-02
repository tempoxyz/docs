'use client'
import * as React from 'react'
import LucideArrowDownUp from '~icons/lucide/arrow-down-up'
import LucideCheck from '~icons/lucide/check'
import LucideCopy from '~icons/lucide/copy'
import LucideShieldAlert from '~icons/lucide/shield-alert'
import LucideShieldCheck from '~icons/lucide/shield-check'
import {
  type CorrectionResult,
  correctTempoAddress,
  decodeTempoAddress,
  encodeTempoAddress,
  formatTempoAddress,
  validateTempoAddress,
} from '../lib/bech32m'
import { Container } from './Container'

const EXAMPLE_HEX = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28'
const EXAMPLE_TEMPO = 'tempo1qp6z6dwvvc6vq5efyk3ms39une6etu4a9qtj2kk0'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center justify-center rounded p-1 text-gray9 transition-colors hover:bg-gray3 hover:text-gray11"
      title="Copy"
    >
      {copied ? <LucideCheck className="size-3.5" /> : <LucideCopy className="size-3.5" />}
    </button>
  )
}

function ConverterSection() {
  const [hexInput, setHexInput] = React.useState(EXAMPLE_HEX)
  const [tempoInput, setTempoInput] = React.useState('')
  const [direction, setDirection] = React.useState<'to-tempo' | 'to-hex'>('to-tempo')
  const [result, setResult] = React.useState<{ value: string; error?: string }>({ value: '' })

  React.useEffect(() => {
    try {
      if (direction === 'to-tempo') {
        if (!hexInput.trim()) {
          setResult({ value: '' })
          return
        }
        const tempo = encodeTempoAddress(hexInput.trim())
        setResult({ value: tempo })
      } else {
        if (!tempoInput.trim()) {
          setResult({ value: '' })
          return
        }
        const hex = decodeTempoAddress(tempoInput.trim())
        setResult({ value: hex })
      }
    } catch (e) {
      setResult({ value: '', error: e instanceof Error ? e.message : 'Invalid input' })
    }
  }, [hexInput, tempoInput, direction])

  const toggleDirection = () => {
    if (direction === 'to-tempo' && result.value && !result.error) {
      setTempoInput(result.value)
      setDirection('to-hex')
    } else if (direction === 'to-hex' && result.value && !result.error) {
      setHexInput(result.value)
      setDirection('to-tempo')
    } else {
      setDirection((d) => (d === 'to-tempo' ? 'to-hex' : 'to-tempo'))
    }
  }

  const inputValue = direction === 'to-tempo' ? hexInput : tempoInput
  const setInputValue = direction === 'to-tempo' ? setHexInput : setTempoInput
  const inputLabel = direction === 'to-tempo' ? '0x Address' : 'tempo1 Address'
  const outputLabel = direction === 'to-tempo' ? 'tempo1 Address' : '0x Address'

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[13px] text-gray11">{inputLabel}</label>
        <div className="flex items-center gap-2 rounded border border-gray4 bg-gray2 px-3 py-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={direction === 'to-tempo' ? '0x...' : 'tempo1...'}
            spellCheck={false}
            className="w-full bg-transparent font-mono text-[13px] text-gray12 outline-none placeholder:text-gray8"
          />
          {inputValue && <CopyButton text={inputValue} />}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={toggleDirection}
          className="rounded-full border border-gray4 bg-gray2 p-2 text-gray10 transition-colors hover:bg-gray3 hover:text-gray12"
          title="Swap direction"
        >
          <LucideArrowDownUp className="size-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] text-gray11">{outputLabel}</label>
        <div className="rounded border border-gray4 bg-gray2 px-3 py-2">
          {result.error ? (
            <span className="text-[13px] text-destructive">{result.error}</span>
          ) : result.value ? (
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 break-all font-mono text-[13px] text-gray12">
                {result.value}
              </span>
              <CopyButton text={result.value} />
            </div>
          ) : (
            <span className="text-[13px] text-gray8">Enter an address above</span>
          )}
        </div>
        {result.value && direction === 'to-tempo' && (
          <p className="font-mono text-[11px] text-gray9">
            Display: {formatTempoAddress(result.value)}
          </p>
        )}
      </div>
    </div>
  )
}

const ERROR_PRESETS = [
  {
    label: '1 error',
    changes: [{ pos: 12, to: 'x' }],
  },
  {
    label: '2 errors',
    changes: [
      { pos: 8, to: 'm' },
      { pos: 20, to: '6' },
    ],
  },
  {
    label: '3 errors',
    changes: [
      { pos: 8, to: 'm' },
      { pos: 20, to: '6' },
      { pos: 30, to: 'q' },
    ],
  },
  {
    label: '5 errors',
    changes: [
      { pos: 8, to: 'm' },
      { pos: 15, to: 'e' },
      { pos: 22, to: 'x' },
      { pos: 30, to: 'q' },
      { pos: 38, to: 'z' },
    ],
  },
] as const

function StatusBadge({ result }: { result: CorrectionResult }) {
  if (result.status === 'valid')
    return (
      <div className="flex items-center gap-2 rounded bg-successTint px-3 py-2 text-[13px] text-success">
        <LucideShieldCheck className="size-4 shrink-0" />
        Valid address — no errors
      </div>
    )

  if (result.status === 'invalid_format')
    return (
      <div className="flex items-center gap-2 rounded bg-destructiveTint px-3 py-2 text-[13px] text-destructive">
        <LucideShieldAlert className="size-4 shrink-0" />
        {result.error}
      </div>
    )

  if (result.status === 'corrected')
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded bg-successTint px-3 py-2 text-[13px] text-success">
          <LucideShieldCheck className="size-4 shrink-0" />
          <span>
            <strong>Corrected</strong> — recovered the original address by locating{' '}
            {result.errors!.length} error{result.errors!.length !== 1 ? 's' : ''}
            {result.searchedErrors === 2 && result.errors!.length === 2 && ' (2-error search)'}
          </span>
        </div>
        <div className="space-y-1.5 rounded border border-gray4 bg-gray2 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="break-all font-mono text-[13px] text-gray12">{result.corrected}</span>
            <CopyButton text={result.corrected!} />
          </div>
          <div className="space-y-0.5">
            {result.errors!.map((e) => (
              <div key={e.position} className="font-mono text-[11px] text-gray9">
                position {e.position}: <span className="text-destructive">{e.was}</span> →{' '}
                <span className="text-success">{e.correctedTo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )

  return (
    <div className="flex items-center gap-2 rounded bg-destructiveTint px-3 py-2 text-[13px] text-destructive">
      <LucideShieldAlert className="size-4 shrink-0" />
      <span>
        <strong>Detected</strong> — {result.error}
      </span>
    </div>
  )
}

function ErrorCorrectionDemo() {
  const [input, setInput] = React.useState(EXAMPLE_TEMPO)
  const [activePreset, setActivePreset] = React.useState<number | null>(null)
  const [correction, setCorrection] = React.useState<CorrectionResult | null>(null)
  const [computing, setComputing] = React.useState(false)

  React.useEffect(() => {
    if (!input.trim()) {
      setCorrection(null)
      return
    }
    setComputing(true)
    // defer to keep UI responsive during 2-error search
    const id = setTimeout(() => {
      setCorrection(correctTempoAddress(input.trim()))
      setComputing(false)
    }, 10)
    return () => clearTimeout(id)
  }, [input])

  const applyPreset = (idx: number) => {
    let addr = EXAMPLE_TEMPO
    for (const { pos, to } of ERROR_PRESETS[idx].changes) {
      addr = addr.slice(0, pos) + to + addr.slice(pos + 1)
    }
    setInput(addr)
    setActivePreset(idx)
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-gray11">
        Paste or type any corrupted <code className="text-[12px]">tempo1</code> address. The
        bech32m checksum will detect the error, and for 1–2 substitutions the algorithm can locate
        and recover the original address with no prior knowledge of it.
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] text-gray11">Address to check</label>
          <div className="flex gap-1.5">
            {ERROR_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(idx)}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  activePreset === idx
                    ? 'bg-accent text-white'
                    : 'bg-gray3 text-gray11 hover:bg-gray4'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setInput(EXAMPLE_TEMPO)
                setActivePreset(null)
              }}
              className="rounded bg-gray3 px-2 py-0.5 text-[11px] text-gray11 transition-colors hover:bg-gray4"
            >
              Valid
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded border border-gray4 bg-gray2 px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setActivePreset(null)
            }}
            placeholder="tempo1..."
            spellCheck={false}
            className="w-full bg-transparent font-mono text-[13px] text-gray12 outline-none placeholder:text-gray8"
          />
        </div>
      </div>

      {computing && (
        <div className="py-1 text-[13px] text-gray9">Searching for corrections...</div>
      )}
      {!computing && correction && <StatusBadge result={correction} />}
    </div>
  )
}

export function AddressConverter() {
  const [tab, setTab] = React.useState<'convert' | 'correct'>('convert')

  return (
    <Container
      headerLeft={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTab('convert')}
            className={`text-[13px] font-medium transition-colors ${
              tab === 'convert' ? 'text-gray12' : 'text-gray9 hover:text-gray11'
            }`}
          >
            Convert
          </button>
          <button
            type="button"
            onClick={() => setTab('correct')}
            className={`text-[13px] font-medium transition-colors ${
              tab === 'correct' ? 'text-gray12' : 'text-gray9 hover:text-gray11'
            }`}
          >
            Error Correction
          </button>
        </div>
      }
    >
      {tab === 'convert' ? <ConverterSection /> : <ErrorCorrectionDemo />}
    </Container>
  )
}

export default AddressConverter
