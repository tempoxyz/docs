import { Link } from 'vocs'
import FileText from '~icons/lucide/file-text'

const modules = import.meta.glob('../pages/protocol/tips/tip-*.mdx', {
  eager: true,
}) as Record<
  string,
  { frontmatter?: { id?: string; title?: string; description?: string; status?: string } }
>

const tips = Object.entries(modules)
  .map(([path, mod]) => ({
    path: path.replace('../pages', '').replace(/\.mdx?$/, ''),
    ...mod.frontmatter,
  }))
  .filter((t) => t.id && t.title)
  .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))

export function TipsList() {
  return (
    <div className="vocs:flex vocs:flex-col vocs:gap-2">
      {tips.map((tip) => (
        <Link
          key={tip.id}
          to={tip.path}
          className="vocs:flex vocs:items-center vocs:gap-3 vocs:rounded-md vocs:border vocs:border-primary vocs:bg-surfaceTint/70 vocs:px-3 vocs:py-2.5 vocs:no-underline vocs:transition-colors vocs:hover:bg-surfaceTint"
        >
          <FileText className="vocs:size-4 vocs:shrink-0 vocs:text-secondary" />
          <div className="vocs:flex vocs:flex-col">
            <span className="vocs:font-medium vocs:text-heading vocs:text-sm">
              {tip.id}: {tip.title}
            </span>
            {tip.description && (
              <span className="vocs:line-clamp-1 vocs:text-secondary vocs:text-xs">
                {tip.description}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default TipsList
