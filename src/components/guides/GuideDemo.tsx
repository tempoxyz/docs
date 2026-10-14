'use client'

import * as React from 'react'
import { cx } from 'zyzz'
import LucideCircleCheck from '~icons/lucide/circle-check'
import LucideFileCog from '~icons/lucide/file-cog'
import LucideFingerprint from '~icons/lucide/fingerprint'
import LucideKeyRound from '~icons/lucide/key-round'
import LucideLaptop from '~icons/lucide/laptop'
import LucideServer from '~icons/lucide/server'
import LucideSmartphone from '~icons/lucide/smartphone'
import LucideUsers from '~icons/lucide/users'
import { Container } from '../Container'
import { AccountState, TxHash } from './AccountSandbox'
import { accountSandbox } from './AccountSandbox.styles'
import { analyzeAccount, isCreated } from './account-sandbox'
import { diffAccounts } from './account-sandbox-diff'
import { Button, Step } from './Demo'
import { guideDemo, guideDemoNetwork } from './GuideDemo.styles'
import {
  type DemoAction,
  type DemoScript,
  type DemoState,
  type GuideContext,
  type GuideId,
  guideScripts,
  type LocalIcon,
  missingNeed,
  type Need,
  type StepOutcome,
  scriptStart,
} from './guide-demo-scripts'
import { thisDevice } from './this-device'

const localIcons: Record<LocalIcon, typeof LucideSmartphone> = {
  device: LucideSmartphone,
  laptop: LucideLaptop,
  passkey: LucideFingerprint,
  update: LucideFileCog,
  server: LucideServer,
  team: LucideUsers,
  key: LucideKeyRound,
}

// ---------------------------------------------------------------------------
// Environment: devnet and WebCrypto

type Modules = {
  devnet: typeof import('./account-sandbox-devnet')
  chain: typeof import('./guide-demo-devnet')
}

type Environment =
  | { status: 'checking' }
  | { status: 'offline' }
  | {
      status: 'ready'
      modules: Modules
      live: ReadonlySet<Need>
      context: Omit<GuideContext, 'options'>
    }

let loaded: Promise<Modules> | undefined

/** Loaded only on `http:` pages, so the viem previews stay out of production pages. */
function loadModules() {
  loaded ??= Promise.all([import('./account-sandbox-devnet'), import('./guide-demo-devnet')]).then(
    ([devnet, chain]) => ({ devnet, chain }),
  )
  return loaded
}

/** WebCrypto keys need a secure context: HTTPS or localhost. */
function hasWebCrypto() {
  return Boolean(globalThis.isSecureContext && globalThis.crypto?.subtle)
}

function useEnvironment(): Environment {
  const [environment, setEnvironment] = React.useState<Environment>({ status: 'checking' })
  React.useEffect(() => {
    let active = true
    loadModules()
      .then(async (modules) => {
        if (!(await modules.devnet.probeDevnet())) {
          if (active) setEnvironment({ status: 'offline' })
          return
        }
        const live = new Set<Need>()
        if (hasWebCrypto()) live.add('webcrypto')
        if (active)
          setEnvironment({
            status: 'ready',
            modules,
            live,
            context: {
              adapter: modules.devnet.getDevnetAdapter(),
              chain: modules.chain.createGuideChain(),
            },
          })
      })
      .catch(() => active && setEnvironment({ status: 'offline' }))
    return () => {
      active = false
    }
  }, [])
  return environment
}

// ---------------------------------------------------------------------------
// The demo

type Entry = { state: DemoState; outcome?: StepOutcome }

/** A guide's steps, run on Tempo devnet with your own signers. */
export function GuideDemo({ guide }: { guide: GuideId }) {
  // A page can outlive its demo while it's being replaced.
  const script = guideScripts[guide] as DemoScript | undefined
  return script ? <Demo guide={guide} script={script} /> : null
}

function Demo({ guide, script }: { guide: GuideId; script: DemoScript }) {
  const environment = useEnvironment()
  // The page's title already names the guide, so the header only says where the demo runs.
  return (
    <Container
      headerLeft={
        <span {...guideDemoNetwork({ className: 'as-network' })}>Runs on Tempo devnet</span>
      }
    >
      {environment.status === 'ready' ? (
        <Runner guide={guide} script={script} environment={environment} />
      ) : (
        <div {...accountSandbox({ className: 'account-sandbox' })}>
          <p className="as-gate" role="status">
            {environment.status === 'checking'
              ? 'Connecting to Tempo devnet…'
              : 'This demo runs on Tempo devnet, which this page can’t reach.'}
          </p>
        </div>
      )}
    </Container>
  )
}

function Runner(props: {
  guide: GuideId
  script: DemoScript
  environment: Extract<Environment, { status: 'ready' }>
}) {
  const { guide, script, environment } = props
  const { modules, live } = environment
  const [history, setHistory] = React.useState<Entry[]>(() => [{ state: scriptStart(guide) }])
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ index: number; message: string } | null>(null)

  const actions = [...script.setup, ...script.steps]
  const done = history.length - 1
  const state = history[done].state
  const previous = done > 0 ? history[done - 1].state : null
  const blocker = missingNeed(script.needs, live)
  const created = isCreated(state.account)
  const health = React.useMemo(() => analyzeAccount(state.account), [state.account])
  const diff =
    previous && isCreated(previous.account) && created
      ? diffAccounts(previous.account, state.account)
      : undefined
  const changedLocal = new Set(
    state.local
      .filter((item) => {
        const before = previous?.local.find((other) => other.id === item.id)
        return (
          previous && (!before || before.status !== item.status || before.detail !== item.detail)
        )
      })
      .map((item) => item.id),
  )

  function context(): GuideContext {
    const working = 'Sending to devnet…'
    const labels = modules.devnet.devnetPromptLabels
    return {
      ...environment.context,
      options: { onPrompt: (next) => setBusy(next ? labels[next] : working) },
    }
  }

  async function run(action: DemoAction, from: DemoState, index: number) {
    setError(null)
    setBusy('Sending to devnet…')
    try {
      const outcome = await action.run(from, context())
      setHistory((items) => [...items, { state: outcome.state, outcome }])
    } catch (cause) {
      setError({
        index,
        message: cause instanceof Error ? cause.message : 'Devnet unreachable.',
      })
    } finally {
      setBusy(null)
    }
  }

  function advance() {
    const action = actions[done]
    if (!action || busy) return
    void run(action, state, done)
  }

  function startOver() {
    setError(null)
    setHistory([{ state: scriptStart(guide) }])
  }

  const renderAction = (action: DemoAction, index: number, number: number) => {
    const entry = history[index + 1]
    const outcome = entry?.outcome
    const active = index === done
    return (
      <Step
        key={action.title}
        number={number}
        title={action.title}
        active={active}
        completed={index < done}
        error={error?.index === index ? new Error(error.message) : undefined}
        actions={
          active ? (
            <Button
              type="button"
              variant="accent"
              disabled={Boolean(busy) || Boolean(blocker)}
              onClick={advance}
            >
              {busy ?? action.action(state)}
            </Button>
          ) : null
        }
      >
        {outcome && (
          <div className="gd-result">
            <LucideCircleCheck aria-hidden="true" />
            <div>
              <p>{outcome.result}</p>
              {outcome.hashes.length > 0 && (
                <ul className="gd-hashes">
                  {outcome.hashes.map((item) => (
                    <li key={item.hash}>
                      <span>{item.label}</span>
                      <TxHash hash={item.hash} />
                    </li>
                  ))}
                </ul>
              )}
              {outcome.secret && index === done - 1 && (
                <SecretField label={outcome.secret.label} value={outcome.secret.value} />
              )}
            </div>
          </div>
        )}
      </Step>
    )
  }

  return (
    <div
      {...cx(accountSandbox({ className: 'account-sandbox guide-demo' }), guideDemo())}
      aria-busy={Boolean(busy)}
    >
      {blocker && (
        <p className="as-gate" role="status">
          {blocker}
        </p>
      )}

      {script.setup.length > 0 && (
        <section className="gd-steps" aria-label="Your starting account">
          <span className="as-label">Your starting account</span>
          {script.setup.map((action, index) => renderAction(action, index, index + 1))}
        </section>
      )}

      <section className="gd-steps" aria-label="Guide steps">
        {script.steps.map((action, index) =>
          renderAction(action, script.setup.length + index, index + 1),
        )}
        {done === actions.length && (
          <div className="gd-replay">
            <Button type="button" onClick={startOver}>
              Start over with a new account
            </Button>
          </div>
        )}
      </section>

      <div className="gd-state">
        <section className="gd-local" aria-label="In your app">
          <span className="as-label">In your app</span>
          {state.local.length === 0 ? (
            <p className="gd-empty">Nothing yet</p>
          ) : (
            <ul>
              {state.local.map((item) => {
                const Icon = localIcons[item.icon]
                return (
                  <li key={item.id} data-status={item.status} data-new={changedLocal.has(item.id)}>
                    <span className="gd-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="gd-local-text">
                      <span className="gd-local-label">{item.label}</span>
                      <span className="gd-local-detail">{item.detail}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="gd-chain" aria-label="On Tempo">
          <span className="as-label">On Tempo</span>
          {created ? (
            <AccountState account={state.account} health={health} diff={diff} />
          ) : (
            <p className="gd-empty">No account yet</p>
          )}
        </section>
      </div>
    </div>
  )
}

/** A generated private key, shown once with the step that made it. */
function SecretField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="as-secret gd-secret">
      <span className="as-label">{label}</span>
      <span className="as-tx">
        <input
          readOnly
          value={value}
          aria-label={label}
          spellCheck={false}
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          type="button"
          className="as-link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value)
              setCopied(true)
              setTimeout(() => setCopied(false), 1_200)
            } catch {}
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </span>
      <span className="gd-local-detail">
        This page holds it only for this demo on this {thisDevice().name}.
      </span>
    </div>
  )
}
