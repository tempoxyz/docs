import { style } from '../styles/scoped'

export const tempoAgentCommandSyntax = style({
  selectors: {
    '& [data-token="command"]': {
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      color: 'light-dark(#6f42c1, #f69d50) !custom',
    },
    '& [data-token="option"]': {
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      color: 'light-dark(#005cc5, #6cb6ff) !custom',
    },
    '& [data-token="argument"]': {
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      color: 'light-dark(#032f62, #96d0ff) !custom',
    },
  },
})
