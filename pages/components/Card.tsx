import { Card as VocsCard } from 'vocs/components'
import type { ReactNode } from 'react'
import { ExternalLink, FileCode2 } from 'lucide-react'

interface CardLinkProps {
  title: string
  description?: string
  href: string
  icon?: ReactNode
  external?: boolean
  sampleProject?: string
}

export function Link({ title, description, href, icon, external, sampleProject }: CardLinkProps) {
  return (
    <VocsCard
      title={title}
      description={description}
      href={href}
      icon={icon}
    >
      {sampleProject && (
        <a
          href={sampleProject}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--vocs-color_text2)] hover:text-[var(--vocs-color_accent)] mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <FileCode2 size={12} />
          Sample Project
          <ExternalLink size={10} />
        </a>
      )}
    </VocsCard>
  )
}

interface ContainerProps {
  children: ReactNode
}

export function Container({ children }: ContainerProps) {
  return <div className="card-grid">{children}</div>
}

interface NoticeProps {
  type?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  icon?: ReactNode
  children: ReactNode
}

export function Notice({ type = 'info', title, icon, children }: NoticeProps) {
  const typeStyles = {
    info: 'border-blue-500/30 bg-blue-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    success: 'border-green-500/30 bg-green-500/5',
    error: 'border-red-500/30 bg-red-500/5',
  }

  return (
    <div className={`border rounded-lg p-4 my-4 ${typeStyles[type]}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-2 font-medium">
          {icon}
          {title}
        </div>
      )}
      <div className="text-sm text-[var(--vocs-color_text2)]">{children}</div>
    </div>
  )
}

export const Card = { Link, Container, Notice }
