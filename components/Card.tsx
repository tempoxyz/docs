import { Link as RouterLink } from 'react-router'
import type LucideArrowLeftRight from '~icons/lucide/arrow-left-right'

export function Link(props: {
  description: string
  href: string
  icon: typeof LucideArrowLeftRight
  title: string
}) {
  const { description, href, icon: Icon, title } = props
  return (
    <RouterLink
      className="border border-gray4 hover:border-accentHover rounded-lg p-4 flex flex-col gap-4 min-h-33.75"
      to={href}
    >
      <Icon className="text-accent size-4.5" />
      <div className="flex flex-col gap-1">
        <div className="leading-normal text-gray12 font-[510] text-[14px]">
          {title}
        </div>
        <div className="leading-normal text-gray11 text-[14px]">
          {description}
        </div>
      </div>
    </RouterLink>
  )
}

export function Container(props: React.PropsWithChildren) {
  const { children } = props
  return <div className="grid md:grid-cols-2 gap-3">{children}</div>
}
