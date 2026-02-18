const variants = {
  red: 'bg-red3 text-red11',
  amber: 'bg-amber3 text-amber11',
  green: 'bg-green3 text-green11',
  blue: 'bg-accentTint text-accent',
  violet: 'bg-violet3 text-violet11',
  gray: 'bg-gray3 text-gray11',
} as const

type BadgeVariant = keyof typeof variants

export function Badge({
  variant = 'gray',
  children,
}: {
  variant?: BadgeVariant
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex h-[19px] items-center justify-center rounded-[30px] px-1.5 text-center font-medium text-[9px] uppercase leading-none tracking-[2%] ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

export default Badge
