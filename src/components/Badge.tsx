import type { Props } from 'zyzz'
import { variants } from '../styles/theme'

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
    borderRadius: '6px',
    paddingInline: '8px',
    textAlign: 'center',
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
  },
  defaultVariants: { variant: 'gray' },
  variants: {
    variant: {
      red: { backgroundColor: 'var(--color-red3) !custom', color: 'var(--color-red11) !custom' },
      amber: {
        backgroundColor: 'var(--color-amber3) !custom',
        color: 'var(--color-amber11) !custom',
      },
      green: {
        backgroundColor: 'var(--color-green3) !custom',
        color: 'var(--color-green11) !custom',
      },
      blue: {
        backgroundColor: 'var(--background-color-accentTint) !custom',
        color: 'var(--text-color-accent) !custom',
      },
      violet: {
        backgroundColor: 'var(--color-violet3) !custom',
        color: 'var(--color-violet11) !custom',
      },
      gray: { backgroundColor: 'var(--color-gray3) !custom', color: 'var(--color-gray11) !custom' },
    },
  },
})

export default Badge
