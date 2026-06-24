type Props = {
  className?: string
}

export default function ArrowUpRight({ className }: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 17 17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
