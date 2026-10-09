'use client'

import { useEffect, useState } from 'react'
import { Link } from 'waku'
import CheckIcon from '~icons/lucide/check'
import CopyIcon from '~icons/lucide/copy'
import PlugIcon from '~icons/lucide/plug'
import TerminalIcon from '~icons/lucide/terminal'
import { tempoAgentSetupCommands } from '../lib/ai-install-commands'
import { AmpLogo, ClaudeLogo, CodexLogo } from './AgentLogos'
import { AgentSetupCommand } from './AgentSetupCommand'
import { tempoAgentStart, tempoAgentStartAgents, tempoAgentStartCommand } from './DocsHome.styles'

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
    id: 'skills',
    label: 'Skills',
    instruction: 'Run in your terminal to add the docs skill to a compatible agent.',
    helpLabel: null,
    installUrl: null,
    Logo: null,
  },
  {
    id: 'mcp',
    label: 'MCP',
    instruction: 'Add this URL as an HTTP MCP server in your agent’s settings.',
    helpLabel: null,
    installUrl: null,
    Logo: null,
  },
] as const

type Agent = (typeof agents)[number]['id']
type CopyState = 'copied' | 'error'

export function DocsHomeAgent() {
  const [mounted, setMounted] = useState(false)
  const [agent, setAgent] = useState<Agent>('codex')
  const [copyState, setCopyState] = useState<CopyState | null>(null)
  const activeAgent = agents.find((item) => item.id === agent) ?? agents[0]
  const commands = tempoAgentSetupCommands[agent]
  const multipleCommands = commands.includes('\n')
  const isMcp = agent === 'mcp'
  const copyLabel = isMcp ? 'Copy URL' : multipleCommands ? 'Copy commands' : 'Copy command'

  useEffect(() => setMounted(true), [])

  async function copyCommands() {
    try {
      await navigator.clipboard.writeText(commands)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <div className={`tempo-agent-start ${tempoAgentStart().className}`}>
      <h2>Build with your agent</h2>
      <p>Connect your coding agent to Tempo documentation.</p>

      <fieldset className={`tempo-agent-start-agents ${tempoAgentStartAgents().className}`}>
        <legend>Choose a setup method</legend>
        <div>
          {agents.map(({ id, label, Logo }) => (
            <button
              key={id}
              type="button"
              disabled={!mounted}
              aria-pressed={agent === id}
              onClick={() => {
                setAgent(id)
                setCopyState(null)
              }}
            >
              {Logo ? <Logo aria-hidden="true" /> : null}
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="tempo-agent-start-install">
        <h3 className="tempo-agent-start-label">Connect Tempo docs</h3>
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
        <div className={`tempo-agent-start-command ${tempoAgentStartCommand().className}`}>
          <div className="tempo-agent-start-toolbar">
            <span className="tempo-agent-start-destination">
              {isMcp ? <PlugIcon aria-hidden="true" /> : <TerminalIcon aria-hidden="true" />}
              {isMcp ? 'MCP server URL' : 'Terminal'}
            </span>
            <button
              type="button"
              disabled={!mounted}
              className="tempo-agent-start-copy"
              aria-label={`${copyLabel} for ${activeAgent.label}`}
              onClick={copyCommands}
            >
              {copyState === 'copied' ? (
                <CheckIcon aria-hidden="true" />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
              <span>{copyState === 'copied' ? 'Copied' : copyLabel}</span>
            </button>
          </div>
          <pre>
            <code>{isMcp ? commands : <AgentSetupCommand command={commands} />}</code>
          </pre>
        </div>
        <p role="status" className="tempo-agent-start-feedback">
          {copyState === 'copied'
            ? isMcp
              ? 'URL copied. Add it as an HTTP MCP server in your agent’s settings.'
              : multipleCommands
                ? 'Commands copied. Paste them into your terminal and run both commands.'
                : 'Command copied. Paste it into your terminal and run it.'
            : copyState === 'error'
              ? isMcp
                ? 'Copy failed. Select and copy the server URL above.'
                : multipleCommands
                  ? 'Copy failed. Select and copy both commands above.'
                  : 'Copy failed. Select and copy the command above.'
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
