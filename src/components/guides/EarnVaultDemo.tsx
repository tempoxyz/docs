'use client'

import * as React from 'react'
import { Container } from '../Container'
import { Button, Step, useCopyToClipboard, useHydrated } from './Demo'
import * as ui from './EarnVaultDemo.recipes'
import {
  type EarnNetwork,
  type EarnVault,
  earnVaultForNetwork,
  earnVaultRequestUrl,
  formatVaultLiquidity,
  parseEarnVaultDetail,
} from './earn-vault-demo'

export function EarnVaultDemo() {
  const inputId = React.useId()
  const ready = useHydrated()
  const [network, setNetwork] = React.useState<EarnNetwork>('mainnet')
  const [vault, setVault] = React.useState<EarnVault | null>(null)
  const [pending, setPending] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, copy] = useCopyToClipboard()
  const request = React.useRef<AbortController | null>(null)
  const approved = earnVaultForNetwork(network)
  const inputClass = ui.earnVaultDemoStateState().className

  function changeNetwork(value: EarnNetwork) {
    if (value === network) return
    request.current?.abort()
    request.current = null
    setVault(null)
    setPending(true)
    setError(null)
    setNetwork(value)
  }

  const loadVault = React.useCallback(async () => {
    if (!ready || request.current) return
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError(null)
    setVault(null)
    const timeout = setTimeout(() => controller.abort(), 20_000)
    try {
      const response = await fetch(earnVaultRequestUrl(network), {
        signal: controller.signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many requests. Wait a moment and retry.')
        if ([401, 402, 403].includes(response.status))
          throw new Error(
            'Public access is unavailable. Use the API reference for authenticated requests.',
          )
        throw new Error(`Could not load the vault (HTTP ${response.status}). Try again.`)
      }
      const vault = parseEarnVaultDetail(await response.json(), network)
      if (request.current === controller) setVault(vault)
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
  }, [ready, network])

  React.useEffect(() => {
    void loadVault()
    return () => {
      request.current?.abort()
      request.current = null
    }
  }, [loadVault])

  return (
    <div data-testid="earn-vault-demo">
      <Container
        headerLeft={<span {...ui.earnVaultDemoText()}>Inspect an Earn vault</span>}
        headerRight={<span {...ui.earnVaultDemoText2()}>Read-only demo</span>}
        footer={
          <div {...ui.earnVaultDemoLayout()}>
            <span>No wallet connection required.</span>
            <a href="/docs/api/earn" {...ui.earnVaultDemoLink()}>
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
            completed={Boolean(vault)}
            actions={
              <Button
                type="button"
                variant="accent"
                disabled={!ready || pending}
                onClick={() => loadVault()}
              >
                {pending ? 'Loading…' : 'Refresh vault'}
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
              {vault && (
                <span role="status" {...ui.earnVaultDemoText2()}>
                  1 vault loaded
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
            active={Boolean(vault)}
            completed={Boolean(vault)}
          >
            <div {...ui.earnVaultDemoLayout4()}>
              <label htmlFor={`${inputId}-vault`} {...ui.label()}>
                Vault
              </label>
              <select
                id={`${inputId}-vault`}
                disabled={!vault || pending}
                className={`${inputClass} ${ui.select().className}`}
              >
                <option value={approved.id}>{approved.label}</option>
              </select>
              {vault ? (
                <div data-testid="earn-vault-details" {...ui.earnVaultDemoLayout5()}>
                  <dl {...ui.dl()}>
                    <Field label="Accepted asset">
                      {vault.assetToken.symbol}
                      <span {...ui.earnVaultDemoText3()}>{vault.assetToken.address}</span>
                    </Field>
                    <Field label="Share-token access">
                      {vault.access?.status === 'open'
                        ? 'Open'
                        : vault.access?.status === 'allowlisted'
                          ? 'Allowlisted'
                          : 'Not reported'}
                    </Field>
                    <Field label="Deposits">
                      {vault.state.depositsPaused
                        ? 'Paused'
                        : supported(vault.capabilities?.deposit)}
                    </Field>
                    <Field label="Vault-wide liquidity">{formatVaultLiquidity(vault)}</Field>
                    <Field label="Immediate redemption">
                      {supported(vault.capabilities?.redeem)}
                    </Field>
                    <Field label="Queued redemption">
                      {supported(vault.capabilities?.asyncRedeem)}
                    </Field>
                    <Field label="Vault address">
                      <span {...ui.earnVaultDemoText4()}>{vault.id}</span>
                    </Field>
                    <Field label="Network">
                      {network === 'mainnet' ? 'Tempo mainnet' : 'Moderato testnet'}
                    </Field>
                  </dl>
                  <div {...ui.earnVaultDemoLayout6()}>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!(await copy(vault.id))) setError('Could not copy the vault address.')
                      }}
                    >
                      {copied ? 'Copied' : 'Copy vault address'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p {...ui.earnVaultDemoDescription2()}>
                  {pending ? 'Loading vault…' : 'Refresh to retry loading this vault.'}
                </p>
              )}
            </div>
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
