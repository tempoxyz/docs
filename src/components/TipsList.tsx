import { tips } from 'virtual:tips-data'
import { Link } from 'vocs'

export async function TipsList() {
  if (!tips || tips.length === 0) {
    return <p>No TIPs found.</p>
  }

  return (
    <ul data-v>
      {tips.map((tip) => (
        <li data-v key={tip.id}>
          <Link data-v to={`/protocol/tips/${tip.fileName.replace('.mdx', '')}`}>
            {tip.id}: {tip.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default TipsList
