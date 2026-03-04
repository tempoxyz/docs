const Deadlines = {
  AndantinoDeprecatedAt: 1773064800000,
} as const

type Deadline = keyof typeof Deadlines

export function ShowUntil({
  deadline,
  children,
}: {
  deadline: Deadline
  children: React.ReactNode
}) {
  if (Date.now() > Deadlines[deadline]) return null
  return <>{children}</>
}
