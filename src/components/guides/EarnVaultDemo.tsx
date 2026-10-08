'use client'

import * as React from 'react'
import { Container } from '../Container'
import { Button, Step, StringFormatter, useCopyToClipboard, useHydrated } from './Demo'
import {
  type EarnNetwork,
  type EarnVault,
  earnVaultRequestUrl,
  formatVaultLiquidity,
  parseEarnVaultPage,
} from './earn-vault-demo'

export function EarnVaultDemo() {
  const inputId = React.useId()
  const ready = useHydrated()
  const [network, setNetwork] = React.useState<EarnNetwork>('testnet')
  const [vaults, setVaults] = React.useState<EarnVault[]>([])
  const [selectedId, setSelectedId] = React.useState('')
  const [nextCursor, setNextCursor] = React.useState<string | null>(null)
  const [loaded, setLoaded] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, copy] = useCopyToClipboard()
  const request = React.useRef<AbortController | null>(null)
  const selected = vaults.find((vault) => vault.id === selectedId)

  React.useEffect(
    () => () => {
      request.current?.abort()
      request.current = null
    },
    [],
  )

  function changeNetwork(value: EarnNetwork) {
    request.current?.abort()
    request.current = null
    setNetwork(value)
    setVaults([])
    setSelectedId('')
    setNextCursor(null)
    setLoaded(false)
    setPending(false)
    setError(null)
  }

  async function loadVaults(more = false) {
    if (!ready || pending || (more && !nextCursor)) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError(null)
    const timeout = setTimeout(() => controller.abort(), 20_000)
    try {
      const response = await fetch(
        earnVaultRequestUrl(network, more ? (nextCursor ?? undefined) : undefined),
        {
          signal: controller.signal,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        },
      )
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many requests. Wait a moment and retry.')
        if ([401, 402, 403].includes(response.status))
          throw new Error(
            'Public access is unavailable. Use the API reference for authenticated requests.',
          )
        throw new Error(`Could not load vaults (HTTP ${response.status}). Try again.`)
      }
      const result = parseEarnVaultPage(await response.json())
      if (request.current !== controller) return
      const items = more ? [...vaults, ...result.data] : result.data
      const unique = [...new Map(items.map((vault) => [vault.id, vault])).values()]
      setVaults(unique)
      setNextCursor(result.nextCursor)
      setSelectedId((id) => (unique.some((vault) => vault.id === id) ? id : ''))
      setLoaded(true)
    } catch (cause) {
      if (request.current !== controller) return
      setError(
        controller.signal.aborted
          ? 'The request timed out. Try again.'
          : cause instanceof Error && !(cause instanceof TypeError)
            ? cause.message
            : 'Could not reach Tempo API. Check your connection and try again.',
      )
    } finally {
      clearTimeout(timeout)
      if (request.current === controller) {
        request.current = null
        setPending(false)
      }
    }
  }

  const inputClass =
    'min-h-10 min-w-0 max-w-full rounded-md border border-[var(--line-strong)] bg-[var(--surface-card)] px-3 py-2 text-[14px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div data-testid="earn-vault-demo">
      <Container
        headerLeft={<span className="font-medium text-[14px]">Inspect an Earn vault</span>}
        headerRight={<span className="text-[13px] text-gray10">Read-only demo</span>}
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <span>No wallet connection required.</span>
            <a href="/docs/api/earn#getverifiedearnvaults" className="text-accent hover:underline">
              API reference
            </a>
          </div>
        }
      >
        <div className="space-y-6" aria-busy={pending}>
          <Step
            number={1}
            title="Load the vault directory"
            active
            completed={loaded}
            actions={
              <Button
                type="button"
                variant="accent"
                disabled={!ready || pending}
                onClick={() => loadVaults()}
              >
                {pending ? 'Loading…' : loaded ? 'Refresh vaults' : 'Load vaults'}
              </Button>
            }
          >
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label htmlFor={`${inputId}-network`} className="text-[13px] text-gray10">
                Network
              </label>
              <select
                id={`${inputId}-network`}
                value={network}
                disabled={!ready}
                onChange={(event) => changeNetwork(event.target.value as EarnNetwork)}
                className={inputClass}
              >
                <option value="testnet">Moderato testnet</option>
                <option value="mainnet">Tempo mainnet</option>
              </select>
              {loaded && (
                <span role="status" className="text-[13px] text-gray10">
                  {vaults.length === 0
                    ? 'No verified vaults found on this network.'
                    : `${vaults.length} vault${vaults.length === 1 ? '' : 's'} loaded`}
                </span>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-3 text-[13px] text-destructive">
                {error}
              </p>
            )}
          </Step>

          <Step
            number={2}
            title="Choose a vault to inspect"
            active={vaults.length > 0}
            completed={Boolean(selected)}
          >
            {vaults.length > 0 ? (
              <div className="mt-3 space-y-4">
                <label htmlFor={`${inputId}-vault`} className="sr-only">
                  Vault
                </label>
                <select
                  id={`${inputId}-vault`}
                  value={selectedId}
                  disabled={pending}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className={`${inputClass} w-full`}
                >
                  <option value="">Choose a vault</option>
                  {vaults.map((vault) => (
                    <option key={vault.id} value={vault.id}>
                      {vault.label} · {StringFormatter.truncate(vault.id)}
                    </option>
                  ))}
                </select>
                {nextCursor && (
                  <Button type="button" disabled={pending} onClick={() => loadVaults(true)}>
                    Load more
                  </Button>
                )}
                {selected && (
                  <div data-testid="earn-vault-details" className="space-y-4">
                    <dl className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-4 border-[var(--line)] border-t pt-4 sm:grid-cols-2">
                      <Field label="Accepted asset">
                        {selected.assetToken.symbol}
                        <span className="mt-1 block break-all font-mono text-[12px] text-gray10">
                          {selected.assetToken.address}
                        </span>
                      </Field>
                      <Field label="Share-token access">
                        {selected.access?.status === 'open'
                          ? 'Open'
                          : selected.access?.status === 'allowlisted'
                            ? 'Allowlisted'
                            : 'Not reported'}
                      </Field>
                      <Field label="Deposits">
                        {selected.state.depositsPaused
                          ? 'Paused'
                          : supported(selected.capabilities?.deposit)}
                      </Field>
                      <Field label="Vault-wide liquidity">{formatVaultLiquidity(selected)}</Field>
                      <Field label="Immediate redemption">
                        {supported(selected.capabilities?.redeem)}
                      </Field>
                      <Field label="Queued redemption">
                        {supported(selected.capabilities?.asyncRedeem)}
                      </Field>
                      <Field label="Vault address">
                        <span className="break-all font-mono text-[12px]">{selected.id}</span>
                      </Field>
                      <Field label="Network">
                        {network === 'testnet' ? 'Moderato testnet' : 'Tempo mainnet'}
                      </Field>
                    </dl>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button
                        type="button"
                        onClick={async () => {
                          if (!(await copy(selected.id)))
                            setError('Could not copy the vault address.')
                        }}
                      >
                        {copied ? 'Copied address' : 'Copy vault address'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-gray10">
                Load a directory to see its available vaults.
              </p>
            )}
          </Step>
        </div>
      </Container>
    </div>
  )
}

function supported(value: boolean | undefined) {
  return value === undefined ? 'Not reported' : value ? 'Supported' : 'Not supported'
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-gray10">{label}</dt>
      <dd className="mt-1 text-[14px] text-primary">{children}</dd>
    </div>
  )
}
