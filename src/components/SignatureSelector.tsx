'use client'
import * as React from 'react'
import { getAllSignatures, type SignatureInfo } from './lib/IndexSupplySignatures'
import * as ui from './SignatureSelector.recipes'

type SignatureSelectorProps = {
  value: string[]
  onChange: (signatures: string[]) => void
  disabled?: boolean
  filter?: 'all' | 'events' | 'functions' | undefined
}

export function SignatureSelector(props: SignatureSelectorProps) {
  const { value, onChange, disabled = false, filter = 'all' } = props
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const allSignatures = React.useMemo(() => getAllSignatures(), [])

  const filteredSignatures = React.useMemo(() => {
    let signatures = allSignatures

    // Apply type filter
    if (filter === 'events') {
      signatures = signatures.filter((sig) => sig.type === 'event')
    } else if (filter === 'functions') {
      signatures = signatures.filter((sig) => sig.type === 'function')
    }

    // Apply search query
    if (!searchQuery.trim()) return signatures

    const query = searchQuery.toLowerCase()
    return signatures.filter(
      (sig) =>
        sig.name.toLowerCase().includes(query) ||
        sig.signature.toLowerCase().includes(query) ||
        sig.contract.toLowerCase().includes(query),
    )
  }, [allSignatures, searchQuery, filter])

  const groupedSignatures = React.useMemo(() => {
    const grouped: Record<string, SignatureInfo[]> = {}
    for (const sig of filteredSignatures) {
      if (!grouped[sig.contract]) {
        grouped[sig.contract] = []
      }
      const contractGroup = grouped[sig.contract]
      if (contractGroup) {
        contractGroup.push(sig)
      }
    }
    return grouped
  }, [filteredSignatures])

  React.useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const selectedSignatureInfos = React.useMemo(() => {
    return value
      .map((sig) => allSignatures.find((s) => s.signature === sig))
      .filter((s): s is SignatureInfo => s !== undefined)
  }, [value, allSignatures])

  const selectedTypes = React.useMemo(() => {
    return new Set(selectedSignatureInfos.map((s) => s.type))
  }, [selectedSignatureInfos])

  const hasMixedTypes = selectedTypes.size > 1

  const toggleSignature = (signature: string) => {
    if (value.includes(signature)) {
      onChange(value.filter((s) => s !== signature))
    } else {
      onChange([...value, signature])
    }
  }

  const clearAll = () => {
    onChange([])
    setIsOpen(false)
  }

  const getTableName = (eventName: string) => {
    return eventName.toLowerCase()
  }

  const placeholderText = React.useMemo(() => {
    if (filter === 'events') return 'Search events...'
    if (filter === 'functions') return 'Search functions...'
    return 'Search events and functions...'
  }, [filter])

  return (
    <div {...ui.signatureSelectorLayout()} ref={dropdownRef}>
      <div {...ui.signatureSelectorLayout2()}>
        <label htmlFor="signature-search" {...ui.label()}>
          Filter by Signatures (optional)
        </label>
        <div {...ui.signatureSelectorLayout()}>
          <input
            id="signature-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => !disabled && setIsOpen(true)}
            placeholder={placeholderText}
            {...ui.signatureSelectorInput()}
            disabled={disabled}
          />
          {value.length > 0 && !disabled && (
            <button type="button" onClick={clearAll} {...ui.signatureSelectorButton()}>
              Clear ({value.length})
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div {...ui.signatureSelectorLayout3()}>
          {Object.keys(groupedSignatures).length === 0 ? (
            <div {...ui.signatureSelectorLayout4()}>No signatures found</div>
          ) : (
            Object.entries(groupedSignatures).map(([contract, signatures]) => (
              <div key={contract} {...ui.signatureSelectorLayout5()}>
                <div {...ui.signatureSelectorLayout6()}>{contract}</div>
                <div {...ui.signatureSelectorLayout7()}>
                  {signatures.map((sig) => (
                    <button
                      key={sig.signature}
                      type="button"
                      onClick={() => toggleSignature(sig.signature)}
                      {...ui.signatureSelectorButton2()}
                    >
                      <input
                        type="checkbox"
                        checked={value.includes(sig.signature)}
                        onChange={() => {}}
                        {...ui.signatureSelectorInput2()}
                      />
                      <span {...ui.signatureSelectorText()}>{sig.name}</span>
                      <span {...ui.signatureSelectorText2()}>{sig.signature}</span>
                      <span
                        className={` ${ui.signatureSelectorText3().className} ${
                          sig.type === 'event'
                            ? ui.signatureSelectorText4().className
                            : ui.functionTag().className
                        }`}
                      >
                        {sig.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isOpen && (
        <div {...ui.signatureSelectorLayout8()}>
          {value.length === 0 ? (
            <div {...ui.signatureSelectorLayout9()}>
              <div {...ui.signatureSelectorLayout10()}>
                No signatures selected. You can query from these base tables:
              </div>
              <div {...ui.signatureSelectorLayout11()}>
                <code {...ui.code()}>blocks</code>
                <code {...ui.code()}>txs</code>
                <code {...ui.code()}>logs</code>
              </div>
              <div {...ui.signatureSelectorLayout12()}>
                <a
                  href="https://www.indexsupply.net/docs#evm-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...ui.signatureSelectorLink()}
                >
                  View documentation →
                </a>
              </div>
            </div>
          ) : (
            <>
              <div {...ui.signatureSelectorLayout13()}>
                {value.map((sig) => {
                  const sigInfo = allSignatures.find((s) => s.signature === sig)
                  const isEvent = sigInfo?.type === 'event'
                  return (
                    <div key={sig} {...ui.signatureSelectorLayout14()}>
                      <span
                        className={` ${ui.signatureSelectorText5().className} ${
                          isEvent
                            ? ui.signatureSelectorText6().className
                            : ui.functionIndicator().className
                        }`}
                      />
                      <span {...ui.signatureSelectorText7()}>{sigInfo?.name || sig}</span>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => toggleSignature(sig)}
                          {...ui.signatureSelectorButton3()}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {!disabled && (
                <>
                  {hasMixedTypes && (
                    <div {...ui.signatureSelectorLayout15()}>
                      ⚠️ All signatures must be the same type (all events or all functions)
                    </div>
                  )}

                  {!hasMixedTypes && (
                    <div {...ui.signatureSelectorLayout16()}>
                      <div {...ui.signatureSelectorLayout17()}>Table names for your query:</div>
                      <div {...ui.signatureSelectorLayout11()}>
                        {selectedSignatureInfos.map((sig) => (
                          <code key={sig.signature} {...ui.code2()}>
                            {getTableName(sig.name)}
                          </code>
                        ))}
                      </div>
                      <div {...ui.signatureSelectorLayout18()}>
                        Each signature creates a virtual table. Use these names in your SQL query.
                        {value.length > 1 && ' You can JOIN these tables together.'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
