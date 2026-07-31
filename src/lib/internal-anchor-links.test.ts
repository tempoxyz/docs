import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { checkInternalAnchors } from './internal-anchor-links'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

function pages(files: Record<string, string>): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'internal-anchor-links-'))
  temporaryDirectories.push(directory)
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(directory, file)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content)
  }
  return directory
}

describe('internal anchor links', () => {
  it('accepts generated, duplicate, and JSX anchors', () => {
    const directory = pages({
      'docs/index.mdx': `
[Generated](/docs/target#hello-world)
[Duplicate](/docs/target#repeat-1)
<Card to="/docs/target#custom-id" />
`,
      'docs/target.mdx': `
## Hello, world!
## Repeat
## Repeat
<span id="custom-id" />
`,
    })

    expect(checkInternalAnchors(directory)).toMatchObject({ linksChecked: 3, failures: [] })
  })

  it('reports stale Markdown and JSX fragments with source locations', () => {
    const directory = pages({
      'docs/index.mdx': '[Old](/docs/target#old-heading)\n<Card to="/docs/target#also-old" />\n',
      'docs/target.mdx': '## New heading\n',
    })

    expect(checkInternalAnchors(directory).failures).toEqual([
      expect.objectContaining({ line: 1, href: '/docs/target#old-heading' }),
      expect.objectContaining({ line: 2, href: '/docs/target#also-old' }),
    ])
  })

  it('expands imported MDX snippets at their render position', () => {
    const directory = pages({
      'docs/index.mdx': '[Imported heading](/docs/target#imported-heading)\n',
      'docs/target.mdx': `
import Shared from '../snippets/shared.mdx'

# Target

<Shared />
`,
      'snippets/shared.mdx': '### Imported heading\n',
    })

    expect(checkInternalAnchors(directory).failures).toEqual([])
  })

  it('resolves same-page, relative, and developers-mounted links', () => {
    const directory = pages({
      'docs/guide/index.mdx': `
# Guide
[Same](#guide)
[Relative](./target#target)
[Mounted](/developers/docs/guide/target#target)
`,
      'docs/guide/target.mdx': '# Target\n',
    })

    expect(checkInternalAnchors(directory)).toMatchObject({ linksChecked: 3, failures: [] })
  })

  it('leaves missing pages to the Vocs dead-link check', () => {
    const directory = pages({
      'docs/index.mdx': '[Missing](/docs/not-a-page#heading)\n',
    })

    expect(checkInternalAnchors(directory)).toMatchObject({ linksChecked: 0, failures: [] })
  })
})
