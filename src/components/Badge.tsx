import type { Props } from 'zyzz'
import { inherited } from '../styles/inherited'
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
      red: { backgroundColor: tokens.color.red3, color: tokens.color.red11 },
      amber: {
        backgroundColor: tokens.color.amber3,
        color: tokens.color.amber11,
      },
      green: {
        backgroundColor: tokens.color.green3,
        color: tokens.color.green11,
      },
      blue: {
        backgroundColor: inherited.color.backgroundColorAccentTint,

        color: inherited.color.textColorAccent,
      },
      violet: {
        backgroundColor: tokens.color.violet3,
        color: tokens.color.violet11,
      },
      gray: { backgroundColor: tokens.color.gray3, color: tokens.color.gray11 },
    },
  },
})

export default Badge
