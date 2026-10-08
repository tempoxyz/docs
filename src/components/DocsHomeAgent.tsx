'use client'

import { useEffect, useState } from 'react'
import { Link } from 'waku'
import CheckIcon from '~icons/lucide/check'
import CopyIcon from '~icons/lucide/copy'
import TerminalIcon from '~icons/lucide/terminal'
import { tempoAgentSetupCommands } from '../lib/ai-install-commands'
import { AmpLogo, ClaudeLogo, CodexLogo } from './AgentLogos'
import { AgentSetupCommand } from './AgentSetupCommand'

const agents = [
  {
    id: 'codex',
    label: 'Codex',
    instruction: 'Run both commands in your terminal.',
    helpLabel: 'Install Codex CLI',
    installUrl: 'https://learn.chatgpt.com/docs/codex/cli',
    Logo: CodexLogo,
  },
  {
    id: 'claude',
    label: 'Claude Code',
    instruction: 'Run both commands in your terminal.',
    helpLabel: 'Install Claude Code',
    installUrl: 'https://code.claude.com/docs/en/quickstart',
    Logo: ClaudeLogo,
  },
  {
    id: 'amp',
    label: 'Amp',
    instruction: 'Run in your terminal to connect Tempo’s MCP server.',
    helpLabel: 'Install Amp',
    installUrl: 'https://ampcode.com/docs/cli#install',
    Logo: AmpLogo,
  },
  {
    id: 'other',
    label: 'Other',
    instruction: 'Run in your terminal to add the docs skill to a compatible agent.',
    helpLabel: null,
    installUrl: null,
    Logo: null,
  },
] as const

type Agent = (typeof agents)[number]['id']
type CopyTarget = 'command' | 'prompt'
type CopyState = 'copied' | 'error'

export function DocsHomeAgent({ prompt }: { prompt: string }) {
  const [mounted, setMounted] = useState(false)
  const [agent, setAgent] = useState<Agent>('codex')
  const [copyStates, setCopyStates] = useState<Partial<Record<CopyTarget, CopyState>>>({})
  const activeAgent = agents.find((item) => item.id === agent) ?? agents[0]
  const commands = tempoAgentSetupCommands[agent]
  const multipleCommands = commands.includes('\n')
  const copyLabel = multipleCommands ? 'Copy commands' : 'Copy command'
  const conversationLabel = agent === 'other' ? 'agent' : activeAgent.label

  useEffect(() => setMounted(true), [])

  async function copy(value: string, target: CopyTarget) {
    try {
      await navigator.clipboard.writeText(value)
      setCopyStates((previous) => ({ ...previous, [target]: 'copied' }))
    } catch {
      setCopyStates((previous) => ({ ...previous, [target]: 'error' }))
    }
  }

  return (
    <div className="tempo-agent-start">
      <h2>Build with your agent</h2>
      <p>Connect your agent to Tempo docs, then build a test payment.</p>

      <fieldset className="tempo-agent-start-agents">
        <legend>Choose your coding agent</legend>
        <div>
          {agents.map(({ id, label, Logo }) => (
            <button
              key={id}
              type="button"
              disabled={!mounted}
              aria-pressed={agent === id}
              onClick={() => {
                setAgent(id)
                setCopyStates({})
              }}
            >
              {Logo ? <Logo aria-hidden="true" /> : null}
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="tempo-agent-start-install">
        <h3 className="tempo-agent-start-label">1. Connect Tempo docs</h3>
        <p className="tempo-agent-start-instruction">
          {activeAgent.instruction}{' '}
          {activeAgent.installUrl ? (
            <a
              className="tempo-agent-start-prerequisite"
              href={activeAgent.installUrl}
              target="_blank"
              rel="noreferrer"
            >
              {activeAgent.helpLabel} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </p>
        <div className="tempo-agent-start-command">
          <div className="tempo-agent-start-toolbar">
            <span className="tempo-agent-start-destination">
              <TerminalIcon aria-hidden="true" />
              Terminal
            </span>
            <button
              type="button"
              disabled={!mounted}
              className="tempo-agent-start-copy"
              aria-label={`${copyLabel} for ${activeAgent.label}`}
              onClick={() => copy(commands, 'command')}
            >
              {copyStates.command === 'copied' ? (
                <CheckIcon aria-hidden="true" />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
              <span>{copyStates.command === 'copied' ? 'Copied' : copyLabel}</span>
            </button>
          </div>
          <pre>
            <code>
              <AgentSetupCommand command={commands} />
            </code>
          </pre>
        </div>
        <p role="status" className="tempo-agent-start-feedback">
          {copyStates.command === 'copied'
            ? multipleCommands
              ? 'Commands copied. Paste them into your terminal and run both commands.'
              : 'Command copied. Paste it into your terminal and run it.'
            : copyStates.command === 'error'
              ? multipleCommands
                ? 'Copy failed. Select and copy both commands above.'
                : 'Copy failed. Select and copy the command above.'
              : ''}
        </p>
      </div>

      <div className="tempo-agent-start-task">
        <div className="tempo-agent-start-toolbar">
          <h3 className="tempo-agent-start-label">2. Build a test payment</h3>
          <button
            type="button"
            disabled={!mounted}
            className="tempo-agent-start-copy tempo-agent-start-copy-primary"
            aria-label="Copy prompt for first payment"
            onClick={() => copy(prompt, 'prompt')}
          >
            {copyStates.prompt === 'copied' ? (
              <CheckIcon aria-hidden="true" />
            ) : (
              <CopyIcon aria-hidden="true" />
            )}
            <span>{copyStates.prompt === 'copied' ? 'Copied' : 'Copy prompt'}</span>
          </button>
        </div>
        <p className="tempo-agent-start-instruction">
          After setup, paste this into a new {conversationLabel} conversation in your project.
        </p>
        <div className="tempo-agent-start-prompt-box">
          <p className="tempo-agent-start-prompt">{prompt}</p>
        </div>
        <p role="status" className="tempo-agent-start-feedback">
          {copyStates.prompt === 'copied'
            ? `Prompt copied. Paste it into your ${conversationLabel} conversation.`
            : copyStates.prompt === 'error'
              ? 'Copy failed. Select and copy the prompt above.'
              : ''}
        </p>
      </div>

      <div className="tempo-agent-start-footer">
        <Link to="/docs/guide/using-tempo-with-ai">
          All setup options <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}
