'use client'

import { Layout, MdxPageContextProvider } from 'vocs'
import { Link, useRouter } from 'waku'
import ArrowRightIcon from '~icons/lucide/arrow-right'
import SearchIcon from '~icons/lucide/search'
import { docsAreas } from '../lib/docs-sections'
import DocsLayout from '../pages/docs/_layout'
import * as ui from './DocsNotFound.recipes'

const topTasks = [
  { label: 'Send your first payment', href: '/get-started/quickstart' },
  { label: 'Create an API key', href: '/docs/api/console/api-keys' },
  { label: 'Network details', href: '/docs/quickstart/connection-details' },
  { label: 'Run a node', href: '/docs/guide/node' },
]

// Vocs' search listens for Cmd/Ctrl+K on the document; the docs header opens it the same way.
function openDocsSearch() {
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      bubbles: true,
      cancelable: true,
      metaKey: true,
      ctrlKey: true,
    }),
  )
}

function NotFoundContent() {
  return (
    <div className={`docs-not-found ${ui.page().className}`}>
      <meta name="robots" content="noindex, nofollow" />
      <div {...ui.intro()}>
        <h1 {...ui.title()}>Page not found</h1>
        <p {...ui.lede()}>
          This page doesn't exist or has moved. Search the docs, or start from a common task.
        </p>
        <button type="button" onClick={openDocsSearch} {...ui.searchButton()}>
          <SearchIcon aria-hidden="true" width="16" height="16" />
          Search docs
        </button>
      </div>
      <section aria-labelledby="not-found-tasks" {...ui.section()}>
        <h2 id="not-found-tasks" {...ui.sectionTitle()}>
          Top tasks
        </h2>
        <ul {...ui.taskList()}>
          {topTasks.map((task) => (
            <li key={task.href}>
              <Link to={task.href} {...ui.taskLink()}>
                {task.label}
                <ArrowRightIcon aria-hidden="true" width="14" height="14" {...ui.taskIcon()} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="not-found-areas" {...ui.section()}>
        <h2 id="not-found-areas" {...ui.sectionTitle()}>
          Browse the docs
        </h2>
        <ul {...ui.areaGrid()}>
          {docsAreas.map((area) => (
            <li key={area.id}>
              <Link to={area.href} {...ui.areaCard()}>
                <span {...ui.areaLabel()}>{area.label}</span>
                <span {...ui.areaDescription()}>{area.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** The 404 page inside the docs shell: header, section nav and footer around the content. */
export default function DocsNotFound() {
  const { path } = useRouter()
  const page = (
    <MdxPageContextProvider
      frontmatter={{
        title: 'Page not found',
        description: 'This page does not exist or has moved.',
        layout: 'minimal',
      }}
    >
      <Layout includeJsonLd={false}>
        <NotFoundContent />
      </Layout>
    </MdxPageContextProvider>
  )
  // The entry layout already wraps Get Started routes in the docs shell.
  const inShell = /^(?:\/developers)?\/get-started(?:\/|$)/.test(path ?? '')
  return inShell ? page : <DocsLayout path="/404">{page}</DocsLayout>
}
