'use client'

import { Layout, MdxPageContextProvider } from 'vocs'
import { Link, useRouter } from 'waku'
import ChevronRightIcon from '~icons/lucide/chevron-right'
import KeyRoundIcon from '~icons/lucide/key-round'
import NetworkIcon from '~icons/lucide/network'
import SearchIcon from '~icons/lucide/search'
import SendIcon from '~icons/lucide/send'
import ServerIcon from '~icons/lucide/server'
import DocsLayout from '../pages/docs/_layout'
import { button } from '../styles/controls'
import * as ui from './DocsNotFound.recipes'

const topTasks = [
  { label: 'Send your first payment', href: '/get-started/quickstart', Icon: SendIcon },
  { label: 'Create an API key', href: '/docs/api/console/api-keys', Icon: KeyRoundIcon },
  { label: 'Network details', href: '/docs/quickstart/connection-details', Icon: NetworkIcon },
  { label: 'Run a node', href: '/docs/guide/node', Icon: ServerIcon },
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

// Search and the four top tasks; the nav already lists the areas.
function NotFoundContent() {
  return (
    <div className={`docs-not-found ${ui.page().className}`}>
      <meta name="robots" content="noindex, nofollow" />
      <h1 {...ui.title()}>Page not found</h1>
      <p {...ui.lede()}>
        This page doesn't exist or has moved. Search the docs, or start from a common task.
      </p>
      <button
        type="button"
        onClick={openDocsSearch}
        {...button({ className: ui.searchButton().className })}
      >
        <SearchIcon aria-hidden="true" width="16" height="16" />
        Search docs
      </button>
      <section aria-labelledby="not-found-tasks" {...ui.section()}>
        <h2 id="not-found-tasks" {...ui.sectionTitle()}>
          Top tasks
        </h2>
        <ul {...ui.taskList()}>
          {topTasks.map(({ label, href, Icon }) => (
            <li key={href}>
              <Link to={href} {...ui.taskLink()}>
                <span {...ui.taskTile()}>
                  <Icon aria-hidden="true" width="16" height="16" />
                </span>
                <span {...ui.taskLabel()}>{label}</span>
                <ChevronRightIcon aria-hidden="true" width="16" height="16" {...ui.taskChevron()} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** The 404 page inside the docs shell: header and the Full footer around the content. */
export default function DocsNotFound() {
  const { path } = useRouter()
  const page = (
    <MdxPageContextProvider
      frontmatter={{
        title: 'Page not found',
        description: 'This page does not exist or has moved.',
        layout: 'minimal',
        // DocsFooter shows the Full footer here, as on Home.
        footer: 'full',
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
