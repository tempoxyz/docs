/** Copyable commands for installing the Tempo plugin from its public marketplace. */
export const tempoPluginInstallCommands = {
  claude: 'claude plugin marketplace add tempoxyz/plugins\nclaude plugin install docs@tempo',
  codex: 'codex plugin marketplace add tempoxyz/plugins --ref main\ncodex plugin add docs@tempo',
} as const

/** Agent-specific setup paths shared by the homepage and header. */
export const tempoAgentSetupCommands = {
  ...tempoPluginInstallCommands,
  amp: 'amp mcp add tempo https://mcp.tempo.xyz',
  skills: 'npx skills add tempoxyz/plugins --skill docs',
  mcp: 'https://mcp.tempo.xyz',
} as const
