'use client'

import * as React from 'react'
import { Container } from '../Container'
import { Button, Step, useCopyToClipboard, useHydrated } from './Demo'
import * as ui from './EarnVaultDemo.recipes'
import {
  type EarnVault,
  earnVaultRequestUrl,
  formatVaultLiquidity,
  parseEarnVaultDetail,
} from './earn-vault-demo'

export function EarnVaultDemo() {
  const ready = useHydrated()
  const [selected, setSelected] = React.useState<EarnVault | null>(null)
  const [pending, setPending] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, copy] = useCopyToClipboard()
  const request = React.useRef<AbortController | null>(null)

  const loadVault = React.useCallback(async () => {
    if (!ready || request.current) return
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setError(null)
    setSelected(null)
    const timeout = setTimeout(() => controller.abort(), 20_000)
    try {
      const response = await fetch(earnVaultRequestUrl(), {
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
      const vault = parseEarnVaultDetail(await response.json())
      if (request.current === controller) setSelected(vault)
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
  }, [ready])

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
            title="Sentora pathUSD (Earn)"
            active
            completed={Boolean(selected)}
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
            <p {...ui.earnVaultDemoText2()}>Tempo mainnet</p>
            {error && (
              <p role="alert" {...ui.earnVaultDemoDescription()}>
                {error}
              </p>
            )}
            {selected ? (
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
                  <Field label="Network">Tempo mainnet</Field>
                </dl>
                <div {...ui.earnVaultDemoLayout6()}>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!(await copy(selected.id))) setError('Could not copy the vault address.')
                    }}
                  >
                    {copied ? 'Copied' : 'Copy vault address'}
                  </Button>
                </div>
              </div>
            ) : (
              <p {...ui.earnVaultDemoDescription2()}>
                {pending ? 'Loading Sentora pathUSD…' : 'Refresh to retry loading this vault.'}
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
