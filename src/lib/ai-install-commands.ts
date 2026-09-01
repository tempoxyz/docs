/** Copyable commands for installing the Tempo plugin from its public marketplace. */
export const tempoPluginInstallCommands = {
  claude: 'claude plugin marketplace add tempoxyz/docs\nclaude plugin install docs@tempo',
  codex: 'codex plugin marketplace add tempoxyz/docs --ref main\ncodex plugin add docs@tempo',
} as const
