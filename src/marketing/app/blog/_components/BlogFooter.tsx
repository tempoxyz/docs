import { Link } from 'waku'

export default function BlogFooter() {
  return (
    <footer className="tempo-blog-footer">
      <span>© {new Date().getFullYear()} Tempo</span>
      <nav aria-label="Blog footer">
        <Link to="/docs">Docs</Link>
        <Link to="/blog">Blog</Link>
        <a href="https://tempo.xyz/">
          tempo.xyz <span aria-hidden="true">↗</span>
        </a>
        <a href="https://github.com/tempoxyz">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </footer>
  )
}
