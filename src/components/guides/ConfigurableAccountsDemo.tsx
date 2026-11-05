'use client'

import * as React from 'react'
import { AccountSandbox } from './AccountSandbox'
import { scenarioDemo } from './ConfigurableAccountsDemo.styles'
import { UpgradeAccountDemo } from './UpgradeAccountDemo'

type Scenario = { id: string; label: string; caption?: string; render: () => React.ReactNode }

const scenarios: Scenario[] = [
  {
    id: 'multisig',
    label: 'Team multisig',
    render: () => (
      <AccountSandbox
        preset="team-treasury"
        variant="compact"
        lesson={{
          start:
            'Start the demo to create Acme’s treasury on the devnet with test funds. Then pick one approver and send $50, which Tempo rejects, and send again with two.',
        }}
      />
    ),
  },
  {
    id: 'recover',
    label: 'Recover access',
    render: () => (
      <AccountSandbox
        preset="recover"
        variant="compact"
        lesson={{
          start:
            'Start the demo to create Maya’s account. Her passkey approves alone, and her backup key and recovery provider approve together. Then lose the passkey, replace it, and pay again.',
        }}
      />
    ),
  },
  {
    id: 'upgrade',
    label: 'Upgrade',
    caption: 'Upgrade a single-key account, then check that its address and balance stay the same.',
    render: () => <UpgradeAccountDemo />,
  },
  {
    id: 'explore',
    label: 'Explore freely',
    caption:
      'Pick a first signer to create an account, then add signers, authorize access keys, and send payments.',
    render: () => <AccountSandbox />,
  },
]

/**
 * One demo area for the configurable accounts overview: a scenario switcher above one example at a
 * time. Each example stays mounted once opened, so switching back keeps its progress.
 */
export function ConfigurableAccountsDemo() {
  const [active, setActive] = React.useState(0)
  const [opened, setOpened] = React.useState<ReadonlySet<number>>(() => new Set([0]))
  const id = React.useId()
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([])

  function select(index: number) {
    setActive(index)
    setOpened((previous) => new Set(previous).add(index))
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = (active + step + scenarios.length) % scenarios.length
    select(next)
    tabs.current[next]?.focus()
  }

  return (
    <div {...scenarioDemo({ className: 'configurable-accounts-demo' })}>
      <div className="sd-switcher" role="tablist" aria-label="Example" onKeyDown={onKeyDown}>
        {scenarios.map((scenario, index) => (
          <button
            key={scenario.id}
            ref={(element) => {
              tabs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${id}-${scenario.id}-tab`}
            aria-selected={index === active}
            aria-controls={`${id}-${scenario.id}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => select(index)}
          >
            {scenario.label}
          </button>
        ))}
      </div>
      {scenarios.map((scenario, index) =>
        opened.has(index) ? (
          <div
            key={scenario.id}
            id={`${id}-${scenario.id}`}
            role="tabpanel"
            aria-labelledby={`${id}-${scenario.id}-tab`}
            hidden={index !== active}
          >
            {scenario.caption && <p className="sd-caption">{scenario.caption}</p>}
            {scenario.render()}
          </div>
        ) : null,
      )}
    </div>
  )
}
