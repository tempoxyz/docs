import { style } from 'zyzz'

export const tempoAgentCommandSyntax = style({
  selectors: {
    '& [data-token="command"]': {
      color: 'light-dark(#6f42c1, #f69d50)',
    },
    '& [data-token="option"]': {
      color: 'light-dark(#005cc5, #6cb6ff)',
    },
    '& [data-token="argument"]': {
      color: 'light-dark(#032f62, #96d0ff)',
    },
  },
})
