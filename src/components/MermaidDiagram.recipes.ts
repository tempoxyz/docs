import { inherited } from '../styles/inherited'
import { style as instanceStyle } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'
export const mermaidDiagramLayoutAppearance = instanceStyle({
  marginBlock: tokens.spacing['8'],
  marginInline: tokens.spacing['0'],

  paddingBlock: tokens.spacing['6'],
  paddingInline: tokens.spacing['4'],
  borderRadius: tokens.radius.xl,
  overflow: 'hidden',
  overflowX: 'auto',
  minHeight: '100px',
  position: 'relative',
})
export const playbackControl = instanceStyle(
  (values: { border: string; background: string; foreground: string }) => ({
    '--tempo-border': values.border,
    '--tempo-background': values.background,
    '--tempo-foreground': values.foreground,
    position: 'absolute',
    top: '12px',
    insetInlineEnd: '12px',
    width: '28px',
    height: '28px',
    borderRadius: tokens.radius.round,
    borderWidth: tokens.borderWidth.hairline,
    borderStyle: 'solid',
    borderColor: inherited.color.tempoBorder,

    backgroundColor: inherited.color.tempoBackground,

    color: inherited.color.tempoForeground,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.7,
    transition: 'opacity 200ms',
    ':hover': { opacity: 1 },
    ':focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.accent,
      outlineOffset: '3px',
      opacity: 1,
    },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  }),
)
