import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'waku'

type Props = Omit<ComponentProps<typeof Link>, 'children'> & { children?: ReactNode }

/** A waku Link for a DS part's `render` prop, which passes the children in. */
export function RouterLink({ children, ...props }: Props) {
  return <Link {...props}>{children}</Link>
}
