'use client'

import * as React from 'react'
import { cx } from 'zyzz'
import LucideCircleCheck from '~icons/lucide/circle-check'
import LucideCircleUserRound from '~icons/lucide/circle-user-round'
import LucideFileCog from '~icons/lucide/file-cog'
import LucideFingerprint from '~icons/lucide/fingerprint'
import LucideKeyRound from '~icons/lucide/key-round'
import LucideLaptop from '~icons/lucide/laptop'
import LucideRadioTower from '~icons/lucide/radio-tower'
import LucideRotateCcw from '~icons/lucide/rotate-ccw'
import LucideServer from '~icons/lucide/server'
import LucideShieldCheck from '~icons/lucide/shield-check'
import LucideSmartphone from '~icons/lucide/smartphone'
import LucideUsers from '~icons/lucide/users'
import { Container } from '../Container'
import { AccountState, TxHash } from './AccountSandbox'
import { accountSandbox } from './AccountSandbox.styles'
import { analyzeAccount, isCreated } from './account-sandbox'
import type { LoginSignInRequest } from './account-sandbox-devnet'
import { diffAccounts } from './account-sandbox-diff'
import type { LoginMethod } from './account-sandbox-oidc'
import { Button, Step } from './Demo'
import { guideDemo, guideDemoNetwork, guideDemoTitle } from './GuideDemo.styles'
import {
  type DemoAction,
  DemoError,
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
  login: LucideCircleUserRound,
  passkey: LucideFingerprint,
  relay: LucideRadioTower,
  publisher: LucideShieldCheck,
  update: LucideFileCog,
  server: LucideServer,
  team: LucideUsers,
  key: LucideKeyRound,
}

const loginWords: Record<LoginMethod, string> = {
  email: 'email',
  google: 'Google',
  privy: 'Privy',
  sms: 'SMS',
}

// ---------------------------------------------------------------------------
// Environment: devnet, the local auth app, and a platform passkey

type Modules = {
  devnet: typeof import('./account-sandbox-devnet')
  logins: typeof import('./account-sandbox-oidc')
  chain: typeof import('./guide-demo-devnet')
}

type Environment =
  | { status: 'checking' }
  | { status: 'offline' }
  | {
      status: 'ready'
      modules: Modules
      live: ReadonlySet<Need>
      context: Omit<GuideContext, 'options' | 'signIn'>
    }

let loaded: Promise<Modules> | undefined

/** Loaded only on `http:` pages, so the viem previews stay out of production pages. */
function loadModules() {
  loaded ??= Promise.all([
    import('./account-sandbox-devnet'),
    import('./account-sandbox-oidc'),
    import('./guide-demo-devnet'),
  ]).then(([devnet, logins, chain]) => ({ devnet, logins, chain }))
  return loaded
}

async function hasPlatformPasskey() {
  if (!globalThis.isSecureContext || !globalThis.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

/** `signsIn`: whether the demo signs in, so the local auth app is probed only then. */
function useEnvironment(signsIn: boolean): Environment {
  const [environment, setEnvironment] = React.useState<Environment>({ status: 'checking' })
  React.useEffect(() => {
    // HTTPS pages can't call the plain-HTTP devnet, so don't load it.
    if (window.location.protocol !== 'http:') {
      setEnvironment({ status: 'offline' })
      return
    }
    let active = true
    loadModules()
      .then(async (modules) => {
        if (!(await modules.devnet.probeDevnet())) {
          if (active) setEnvironment({ status: 'offline' })
          return
        }
        const [logins, passkey] = await Promise.all([
          signsIn ? modules.devnet.probeLogins().catch(() => new Set()) : new Set(),
          hasPlatformPasskey(),
        ])
        const live = new Set<Need>(
          [...logins].filter((kind): kind is LoginMethod =>
            modules.logins.loginMethods.includes(kind as LoginMethod),
          ),
        )
        if (passkey) live.add('passkey')
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
  }, [signsIn])
  return environment
}

// ---------------------------------------------------------------------------
// The demo

type Entry = { state: DemoState; outcome?: StepOutcome }

type SignInPrompt = {
  method: LoginMethod
  message: string
  resolve: (popup: Window | null) => void
}

/** A guide's steps, run on Tempo devnet with your own signers. */
export function GuideDemo({ guide }: { guide: GuideId }) {
  // A page can outlive its demo while it's being replaced.
  const script = guideScripts[guide] as DemoScript | undefined
  return script ? <Demo guide={guide} script={script} /> : null
}

function Demo({ guide, script }: { guide: GuideId; script: DemoScript }) {
  const environment = useEnvironment(
    (script.choices?.map((choice) => choice.id) ?? ['']).some((choice) =>
      script.needs(choice).some((need) => need !== 'passkey'),
    ),
  )
  return (
    <Container
      headerLeft={
        <div {...guideDemoTitle({ className: 'as-title' })}>
          <span>{script.title}</span>
        </div>
      }
      headerRight={<span {...guideDemoNetwork({ className: 'as-network' })}>Tempo devnet</span>}
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
  const firstChoice =
    script.choices?.find((choice) => !missingNeed(script.needs(choice.id), live))?.id ??
    script.choices?.[0]?.id
  const [history, setHistory] = React.useState<Entry[]>(() => [
    { state: scriptStart(guide, firstChoice) },
  ])
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<{ index: number; message: string } | null>(null)
  const [prompt, setPrompt] = React.useState<SignInPrompt | null>(null)
  const [signingIn, setSigningIn] = React.useState(false)
  const popup = React.useRef<Window | null>(null)
  const cancel = React.useRef<AbortController | null>(null)
  const latest = React.useRef(history)
  latest.current = history

  const actions = [...script.setup, ...script.steps]
  const done = history.length - 1
  const state = history[done].state
  const previous = done > 0 ? history[done - 1].state : null
  const blocker = missingNeed(script.needs(state.choice), live)
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

  /** Ask the reader to open a sign-in window from a click. */
  function ask(method: LoginMethod, message: string) {
    return new Promise<Window | null>((resolve) => setPrompt({ method, message, resolve }))
  }

  function answer(start: boolean) {
    if (!prompt) return
    prompt.resolve(start ? modules.devnet.openSignInWindow() : null)
    setPrompt(null)
  }

  /** Who an expired login is, so the reader signs in as the right one. */
  function renewMessage(request: LoginSignInRequest) {
    if (request.reason === 'add') return `Sign in to add your ${loginWords[request.method]} login.`
    const account = latest.current[latest.current.length - 1].state.account
    const signer = account.signers.find((item) => item.name === request.signer)
    const who =
      signer?.kind === 'google' || !signer?.subject
        ? `Your ${loginWords[request.method]} login`
        : signer.subject
    return `${who} signed in over 9 minutes ago. Sign in again to approve.`
  }

  function context(controller: AbortController): GuideContext {
    const working = 'Sending to devnet…'
    const labels = modules.devnet.devnetPromptLabels
    return {
      ...environment.context,
      options: {
        onPrompt: (next) => {
          setBusy(next ? labels[next] : working)
          setSigningIn(Boolean(next?.startsWith('sign-in-')))
        },
        requestSignIn: (request) => ask(request.method, renewMessage(request)),
        signal: controller.signal,
      },
      async signIn(method) {
        // The click's window serves the first sign-in; later ones ask for another click.
        let opened = popup.current
        popup.current = null
        if (!opened || opened.closed)
          opened = await ask(method, `Next, sign in with ${loginWords[method]}.`)
        if (!opened) throw new DemoError('Sign-in cancelled.')
        setBusy(labels[`sign-in-${method}`])
        setSigningIn(true)
        try {
          return await modules.logins.signIn({ method, popup: opened, signal: controller.signal })
        } finally {
          setSigningIn(false)
          setBusy(working)
        }
      },
    }
  }

  async function run(action: DemoAction, from: DemoState, index: number) {
    setError(null)
    const controller = new AbortController()
    cancel.current = controller
    setBusy('Sending to devnet…')
    try {
      const outcome = await action.run(from, context(controller))
      setHistory((items) => [...items, { state: outcome.state, outcome }])
    } catch (cause) {
      setError({
        index,
        message: cause instanceof Error ? cause.message : 'Devnet unreachable.',
      })
    } finally {
      setBusy(null)
      setPrompt(null)
      setSigningIn(false)
      cancel.current = null
      if (popup.current && !popup.current.closed) popup.current.close()
      popup.current = null
    }
  }

  /** Run the next action. A sign-in window must open in this click, before any `await`. */
  function advance() {
    const action = actions[done]
    if (!action || busy) return
    const method = action.signIn?.(state) ?? null
    popup.current = method ? modules.devnet.openSignInWindow() : null
    void run(action, state, done)
  }

  function choose(choice: string) {
    setError(null)
    setHistory([{ state: scriptStart(guide, choice) }])
  }

  function startOver() {
    setError(null)
    setHistory([{ state: scriptStart(guide, state.choice) }])
  }

  function cancelSignIn() {
    prompt?.resolve(null)
    setPrompt(null)
    cancel.current?.abort()
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
      {prompt && (
        <section className="as-signin" aria-label="Sign in">
          <LucideCircleUserRound aria-hidden="true" />
          <span>{prompt.message}</span>
          <button
            type="button"
            className="as-button as-button-primary"
            onClick={() => answer(true)}
          >
            Sign in with {loginWords[prompt.method]}
          </button>
          <button type="button" className="as-link" onClick={() => answer(false)}>
            Cancel
          </button>
        </section>
      )}
      {signingIn && busy && !prompt && (
        <div className="as-signin" role="status">
          <LucideCircleUserRound aria-hidden="true" />
          <span>{busy}</span>
          <button type="button" className="as-link" onClick={cancelSignIn}>
            Cancel sign-in
          </button>
        </div>
      )}

      {script.choices && done === 0 && (
        <div className="gd-choice">
          <span className="as-label">{script.choiceLabel ?? 'Choose'}</span>
          <fieldset className="as-segmented" disabled={Boolean(busy)}>
            <legend className="as-hidden">{script.choiceLabel ?? 'Choose'}</legend>
            {script.choices.map((choice) => {
              const reason = missingNeed(script.needs(choice.id), live)
              return (
                <button
                  key={choice.id}
                  type="button"
                  aria-pressed={state.choice === choice.id}
                  disabled={Boolean(reason)}
                  title={reason ?? undefined}
                  onClick={() => choose(choice.id)}
                >
                  {choice.label}
                </button>
              )
            })}
          </fieldset>
        </div>
      )}

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
        {script.setup.length > 0 && <span className="as-label">The guide’s steps</span>}
        {script.steps.map((action, index) =>
          renderAction(action, script.setup.length + index, index + 1),
        )}
        {done === actions.length && (
          <div className="gd-replay">
            <Button type="button" onClick={startOver}>
              <LucideRotateCcw aria-hidden="true" />
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
            <AccountState
              account={state.account}
              health={health}
              diff={diff}
              badge={state.account.devnet ? 'On devnet' : undefined}
            />
          ) : (
            <p className="gd-empty">
              No account yet. Its address comes from its first signer
              {guide === 'identity-provider' || guide === 'email-otp' ? ': your login' : ''}.
            </p>
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
