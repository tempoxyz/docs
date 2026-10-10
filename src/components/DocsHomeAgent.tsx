'use client'

import { useEffect, useRef, useState } from 'react'
import CheckIcon from '~icons/lucide/check'
import CopyIcon from '~icons/lucide/copy'
import PlugIcon from '~icons/lucide/plug'
import TerminalIcon from '~icons/lucide/terminal'
import { tempoAgentSetupCommands } from '../lib/ai-install-commands'
import { AmpLogo, ClaudeLogo, CodexLogo } from './AgentLogos'
import { AgentSetupCommand } from './AgentSetupCommand'
import { ChevronLink } from './ChevronLink'
import { CopyIconSwap } from './CopyIconSwap'
import { tempoAgentStart, tempoAgentStartCommand } from './DocsHome.styles'
import { SegmentedControl } from './SegmentedControl'

const agents = [
  {
    id: 'codex',
    label: 'Codex',
    instruction: null,
    helpLabel: 'Install Codex CLI',
    installUrl: 'https://learn.chatgpt.com/docs/codex/cli',
    Logo: CodexLogo,
  },
  {
    id: 'claude',
    label: 'Claude Code',
    instruction: null,
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

  // The chooser scrolls sideways when the five methods don't fit (narrow screens).
  // Bring the selected method fully into view without scrolling the page.
  const chooser = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const control = chooser.current?.querySelector<HTMLElement>('[role="radiogroup"]')
    const selected = control?.querySelector<HTMLElement>('[aria-checked="true"]')
    if (!control || !selected || control.scrollWidth <= control.clientWidth) return
    const bounds = control.getBoundingClientRect()
    const item = selected.getBoundingClientRect()
    const inset = 8
    const offset =
      item.left < bounds.left
        ? item.left - bounds.left - inset
        : item.right > bounds.right
          ? item.right - bounds.right + inset
          : 0
    if (!offset) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    control.scrollBy({ left: offset, behavior: reduce ? 'auto' : 'smooth' })
  }, [agent])

  // The icon and label confirm briefly; the status message below stays.
  const [justCopied, setJustCopied] = useState(false)
  useEffect(() => {
    if (!justCopied) return
    const timer = window.setTimeout(() => setJustCopied(false), 1200)
    return () => window.clearTimeout(timer)
  }, [justCopied])

  async function copyCommands() {
    try {
      await navigator.clipboard.writeText(commands)
      setCopyState('copied')
      setJustCopied(true)
    } catch {
      setCopyState('error')
    }
  }

  return (
    <div className={`tempo-agent-start ${tempoAgentStart().className}`}>
      <h2>Build with your agent</h2>

      <div className="tempo-agent-start-panel">
        <div ref={chooser} className="tempo-agent-start-agents">
          <SegmentedControl
            aria-label="Choose a setup method"
            disabled={!mounted}
            items={agents.map(({ id, label, Logo }) => ({
              value: id,
              label: (
                <>
                  {Logo ? <Logo aria-hidden="true" /> : null}
                  {label}
                </>
              ),
            }))}
            value={agent}
            onValueChange={(id) => {
              setAgent(id)
              setCopyState(null)
              setJustCopied(false)
            }}
          />
        </div>

        <div className="tempo-agent-start-install">
          {/* The agent's install link sits on the heading row, at the inline end. */}
          <div className="tempo-agent-start-heading">
            <h3 className="tempo-agent-start-label">Connect Tempo docs</h3>
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
          </div>
          {activeAgent.instruction ? (
            <p className="tempo-agent-start-instruction">{activeAgent.instruction}</p>
          ) : null}
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
                <CopyIconSwap
                  copied={justCopied}
                  copyIcon={<CopyIcon aria-hidden="true" />}
                  checkIcon={<CheckIcon aria-hidden="true" />}
                />
                <span>{justCopied ? 'Copied' : copyLabel}</span>
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
          <ChevronLink href="/docs/guide/using-tempo-with-ai">All setup options</ChevronLink>
        </div>
      </div>
    </div>
  )
}
