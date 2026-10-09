import { Link } from 'vocs'
import FileText from '~icons/lucide/file-text'
import * as styles from './TipsList.recipes'

const modules = import.meta.glob('../pages/docs/protocol/tips/tip-*.mdx', {
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
    <div {...styles.list()}>
      {tips.map((tip) => (
        <Link key={tip.id} to={tip.path} {...styles.card()}>
          <FileText {...styles.icon()} />
          <div {...styles.copy()}>
            <span {...styles.title()}>
              {tip.id}: {tip.title}
            </span>
            {tip.description && <span {...styles.description()}>{tip.description}</span>}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default TipsList
