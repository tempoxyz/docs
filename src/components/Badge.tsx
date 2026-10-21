import type { Props } from 'zyzz'
import { vars as tokens, variants } from '../styles/theme'

export function Badge({
  variant = 'gray',
  children,
}: Props.Variants<typeof badge> & {
  children: React.ReactNode
}) {
  return <span {...badge({ variant })}>{children}</span>
}

const badge = variants({
  base: {
    display: 'inline-flex',
    minHeight: '24px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.md,
    paddingInline: tokens.spacing['2'],
    textAlign: 'center',
    fontWeight: tokens.fontWeight.medium,
    fontSize: tokens.fontSize.xs,

    lineHeight: tokens.lineHeight.caption,
  },
  defaultVariants: { variant: 'gray' },
  variants: {
    variant: {
      // Feedback tones use the TDS Platform tones (Core accents); blue is Alert's tip.
      red: { backgroundColor: tokens.color.negativeContainer, color: tokens.color.negative },
      amber: {
        backgroundColor: tokens.color.warningContainer,
        color: tokens.color.warning,
      },
      green: {
        backgroundColor: tokens.color.positiveContainer,
        color: tokens.color.positive,
      },
      blue: {
        backgroundColor: tokens.color.infoContainer,

        color: tokens.color.info,
      },
      violet: {
        backgroundColor: tokens.color.violet3,
        color: tokens.color.violet11,
      },
      gray: { backgroundColor: tokens.color.container, color: tokens.color.muted },
      // TDS Platform Badge variant="outline", small scale: no fill, a subtle line.
      outline: {
        minWidth: '80px',
        minHeight: '28px',
        paddingInline: tokens.spacing['2'],
        // design-exception: TDS Badge small radius (6px), between the 4px and 8px steps.
        borderRadius: '6px !custom',
        '--corner-radius': '6px',
        boxSizing: 'border-box',
        // A real border (not TDS's overlay) so the smooth-corner fallback can stroke it.
        borderWidth: tokens.borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: tokens.color.hairline,
        color: tokens.color.foreground,
        fontWeight: tokens.fontWeight.normal,
      },
    },
  },
})

export default Badge
