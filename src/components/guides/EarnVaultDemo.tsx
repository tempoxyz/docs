'use client'

import * as React from 'react'
import { Container } from '../Container'
import { Button, Step, StringFormatter, useCopyToClipboard, useHydrated } from './Demo'
import * as ui from './EarnVaultDemo.recipes'
import {
  type EarnNetwork,
  type EarnVaultDirectory,
  earnVaultDetailRequestUrl,
  earnVaultRequestUrl,
  formatVaultLiquidity,
  parseEarnVaultDetail,
  parseEarnVaultPage,
  updateEarnVaultDirectory,
} from './earn-vault-demo'

export function EarnVaultDemo() {
  const inputId = React.useId()
  const ready = useHydrated()
  const [network, setNetwork] = React.useState<EarnNetwork>('testnet')
  const [directory, setDirectory] = React.useState<EarnVaultDirectory>({
    vaults: [],
    selectedId: '',
    nextCursor: null,
    loaded: false,
  })
  const { vaults, selectedId, nextCursor, loaded } = directory
  const [pending, setPending] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, copy] = useCopyToClipboard()
  const request = React.useRef<AbortController | null>(null)
  const selected = vaults.find((vault) => vault.id === selectedId)

  function changeNetwork(value: EarnNetwork) {
    if (value === network) return
    request.current?.abort()
    request.current = null
    setNetwork(value)
    setDirectory({ vaults: [], selectedId: '', nextCursor: null, loaded: false })
    setPending(true)
    setError(null)
  }

  const loadVaults = React.useCallback(
    async (cursor?: string, selectedVault?: string) => {
      if (!ready || request.current) return
      const controller = new AbortController()
      request.current = controller
      setPending(true)
      setError(null)
      const timeout = setTimeout(() => controller.abort(), 20_000)
      try {
        const response = await fetch(earnVaultRequestUrl(network, cursor), {
          signal: controller.signal,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        })
        if (!response.ok) {
          if (response.status === 429)
            throw new Error('Too many requests. Wait a moment and retry.')
          if ([401, 402, 403].includes(response.status))
            throw new Error(
              'Public access is unavailable. Use the API reference for authenticated requests.',
            )
          throw new Error(`Could not load vaults (HTTP ${response.status}). Try again.`)
        }
        const result = parseEarnVaultPage(await response.json())
        if (request.current !== controller) return
        // A selected vault may be outside the refreshed first page. Refresh its
        // own listing instead of silently replacing it or retaining stale details.
        if (
          !cursor &&
          selectedVault &&
          !result.data.some((vault) => vault.id.toLowerCase() === selectedVault.toLowerCase())
        ) {
          const detailResponse = await fetch(earnVaultDetailRequestUrl(network, selectedVault), {
            signal: controller.signal,
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
          })
          if (request.current !== controller) return
          if (detailResponse.ok) {
            const detail = parseEarnVaultDetail(await detailResponse.json(), selectedVault)
            if (detail) result.data.push(detail)
          } else if (detailResponse.status !== 404) {
            throw new Error('Could not refresh the selected vault. Try again.')
          }
        }
        if (request.current !== controller) return
        setDirectory((previous) =>
          updateEarnVaultDirectory(previous, result, network, Boolean(cursor)),
        )
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
    },
    [network, ready],
  )

  React.useEffect(() => {
    void loadVaults()
    return () => {
      request.current?.abort()
      request.current = null
    }
  }, [loadVaults])

  const inputClass = ui.earnVaultDemoStateState().className

  return (
    <div data-testid="earn-vault-demo">
      <Container
        headerLeft={<span {...ui.earnVaultDemoText()}>Inspect an Earn vault</span>}
        headerRight={<span {...ui.earnVaultDemoText2()}>Read-only demo</span>}
        footer={
          <div {...ui.earnVaultDemoLayout()}>
            <span>No wallet connection required.</span>
            <a href="/docs/api/earn#getverifiedearnvaults" {...ui.earnVaultDemoLink()}>
              API reference
            </a>
          </div>
        }
      >
        <div {...ui.earnVaultDemoLayout2()} aria-busy={pending}>
          <Step
            number={1}
            title="Choose a network"
            active
            completed={loaded}
            actions={
              <Button
                type="button"
                variant="accent"
                disabled={!ready || pending}
                onClick={() => loadVaults(undefined, selectedId)}
              >
                {pending ? 'Loading…' : loaded ? 'Refresh vaults' : 'Load vaults'}
              </Button>
            }
          >
            <div {...ui.earnVaultDemoLayout3()}>
              <label htmlFor={`${inputId}-network`} {...ui.earnVaultDemoText2()}>
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
                <span role="status" {...ui.earnVaultDemoText2()}>
                  {vaults.length === 0
                    ? 'No verified vaults found on this network.'
                    : `${vaults.length} vault${vaults.length === 1 ? '' : 's'} loaded`}
                </span>
              )}
            </div>
            {error && (
              <p role="alert" {...ui.earnVaultDemoDescription()}>
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
              <div {...ui.earnVaultDemoLayout4()}>
                <label htmlFor={`${inputId}-vault`} {...ui.label()}>
                  Vault
                </label>
                <select
                  id={`${inputId}-vault`}
                  value={selectedId}
                  disabled={pending}
                  onChange={(event) =>
                    setDirectory((current) => ({ ...current, selectedId: event.target.value }))
                  }
                  className={`${inputClass} ${ui.select().className} `}
                >
                  <option value="">Choose a vault</option>
                  {vaults.map((vault) => (
                    <option key={vault.id} value={vault.id}>
                      {vault.label} · {StringFormatter.truncate(vault.id)}
                    </option>
                  ))}
                </select>
                {nextCursor && (
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={() => loadVaults(nextCursor ?? undefined)}
                  >
                    Load more
                  </Button>
                )}
                {selected && (
                  <div data-testid="earn-vault-details" {...ui.earnVaultDemoLayout5()}>
                    <dl {...ui.dl()}>
                      <Field label="Accepted asset">
                        {selected.assetToken.symbol}
                        <span {...ui.earnVaultDemoText3()}>{selected.assetToken.address}</span>
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
                        <span {...ui.earnVaultDemoText4()}>{selected.id}</span>
                      </Field>
                      <Field label="Network">
                        {network === 'testnet' ? 'Moderato testnet' : 'Tempo mainnet'}
                      </Field>
                    </dl>
                    <div {...ui.earnVaultDemoLayout6()}>
                      <Button
                        type="button"
                        onClick={async () => {
                          if (!(await copy(selected.id)))
                            setError('Could not copy the vault address.')
                        }}
                      >
                        {copied ? 'Copied' : 'Copy vault address'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p {...ui.earnVaultDemoDescription2()}>
                {pending
                  ? 'Loading verified vaults…'
                  : loaded
                    ? 'No verified vaults are available on this network.'
                    : 'Retry loading the directory to inspect a vault.'}
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
    <div {...ui.fieldLayout()}>
      <dt {...ui.dt()}>{label}</dt>
      <dd {...ui.dd()}>{children}</dd>
    </div>
  )
}
