import './AgentSetupCommand.css'

/** Highlight the simple, whitespace-delimited commands in tempoAgentSetupCommands. */
export function AgentSetupCommand({ command }: { command: string }) {
  let startsCommand = true

  return (
    <span className="tempo-agent-command-syntax">
      {Array.from(command.matchAll(/\s+|\S+/g), ([text], index) => {
        if (/^\s+$/.test(text)) {
          if (text.includes('\n')) startsCommand = true
          return text
        }

        const token = startsCommand ? 'command' : text.startsWith('-') ? 'option' : 'argument'
        startsCommand = false

        return (
          <span key={`${index}:${text}`} data-token={token}>
            {text}
          </span>
        )
      })}
    </span>
  )
}
