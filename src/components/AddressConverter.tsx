'use client'
import * as React from 'react'
import LucideArrowDownUp from '~icons/lucide/arrow-down-up'
import LucideCheck from '~icons/lucide/check'
import LucideCopy from '~icons/lucide/copy'
import LucideShieldAlert from '~icons/lucide/shield-alert'
import LucideShieldCheck from '~icons/lucide/shield-check'
import {
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

const SUBSTITUTION_PRESETS = [
  {
    label: '2-char substitution',
    description: 'Positions 8 and 20',
    changes: [
      { pos: 8, to: 'm' },
      { pos: 20, to: '6' },
    ],
  },
  {
    label: '4-char substitution',
    description: 'Positions 8, 15, 25, 35',
    changes: [
      { pos: 8, to: 'm' },
      { pos: 15, to: 'e' },
      { pos: 25, to: 'u' },
      { pos: 35, to: 'a' },
    ],
  },
] as const

function SubstitutionDemo() {
  const [tampered, setTampered] = React.useState(EXAMPLE_TEMPO)
  const [activePreset, setActivePreset] = React.useState<number | null>(null)
  const validation = validateTempoAddress(tampered)

  const handlePreset = (idx: number) => {
    const preset = SUBSTITUTION_PRESETS[idx]
    let addr = EXAMPLE_TEMPO
    for (const { pos, to } of preset.changes) {
      addr = addr.slice(0, pos) + to + addr.slice(pos + 1)
    }
    setTampered(addr)
    setActivePreset(idx)
  }

  const handleReset = () => {
    setTampered(EXAMPLE_TEMPO)
    setActivePreset(null)
  }

  const diffChars = React.useMemo(() => {
    const result: number[] = []
    for (let i = 0; i < Math.max(tampered.length, EXAMPLE_TEMPO.length); i++) {
      if (tampered[i] !== EXAMPLE_TEMPO[i]) result.push(i)
    }
    return new Set(result)
  }, [tampered])

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] text-gray11">Original (valid)</label>
        </div>
        <div className="rounded border border-gray4 bg-gray2 px-3 py-2 font-mono text-[13px] text-gray12">
          {EXAMPLE_TEMPO}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] text-gray11">Tampered address</label>
          <div className="flex gap-1.5">
            {SUBSTITUTION_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(idx)}
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
              onClick={handleReset}
              className="rounded bg-gray3 px-2 py-0.5 text-[11px] text-gray11 transition-colors hover:bg-gray4"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded border border-gray4 bg-gray2 px-3 py-2">
          <input
            type="text"
            value={tampered}
            onChange={(e) => {
              setTampered(e.target.value)
              setActivePreset(null)
            }}
            spellCheck={false}
            className="w-full bg-transparent font-mono text-[13px] text-gray12 outline-none"
          />
        </div>

        {diffChars.size > 0 && (
          <div className="rounded border border-gray4 bg-gray2 px-3 py-2 font-mono text-[12px] leading-relaxed">
            <div className="break-all">
              {Array.from(tampered).map((ch, i) => (
                <span
                  key={`${i}-${ch}`}
                  className={diffChars.has(i) ? 'bg-destructiveTint text-destructive' : 'text-gray10'}
                >
                  {ch}
                </span>
              ))}
            </div>
            <div className="mt-1 text-[11px] text-gray9">
              {diffChars.size} character{diffChars.size !== 1 ? 's' : ''} changed from original
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex items-center gap-2 rounded px-3 py-2 text-[13px] ${
          validation.valid
            ? 'bg-successTint text-success'
            : 'bg-destructiveTint text-destructive'
        }`}
      >
        {validation.valid ? (
          <>
            <LucideShieldCheck className="size-4 shrink-0" />
            <span>Valid tempo1 address</span>
          </>
        ) : (
          <>
            <LucideShieldAlert className="size-4 shrink-0" />
            <span>
              <strong>Rejected:</strong> {validation.error}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export function AddressConverter() {
  const [tab, setTab] = React.useState<'convert' | 'detect'>('convert')

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
            onClick={() => setTab('detect')}
            className={`text-[13px] font-medium transition-colors ${
              tab === 'detect' ? 'text-gray12' : 'text-gray9 hover:text-gray11'
            }`}
          >
            Error Detection
          </button>
        </div>
      }
    >
      {tab === 'convert' ? <ConverterSection /> : <SubstitutionDemo />}
    </Container>
  )
}

export default AddressConverter
