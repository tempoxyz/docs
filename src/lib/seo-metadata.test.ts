import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import vocsConfig from '../../vocs.config'
import { canonicalDevelopersOrigin } from './docs-routing'
import {
  canonicalUrlForRoute,
  descriptionProblems,
  docsTitleSuffix,
  duplicateTitles,
  explainerTitleSuffix,
  seoCanonicalOrigin,
  titleProblems,
} from './seo-metadata'

const pagesRoot = path.resolve('src/pages')

type PageMetadata = {
  description: string | undefined
  error?: string | undefined
  file: string
  renderedTitle: string | undefined
  route: string
  title: string | undefined
}

function markdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filepath = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(filepath)
    return entry.isFile() && /\.mdx?$/.test(entry.name) ? [filepath] : []
  })
}

function frontmatterValue(frontmatter: string, key: string): string | undefined {
  const serialized = frontmatter.match(new RegExp(`^${key}:(.*)$`, 'm'))?.[1]?.trim()
  if (serialized === undefined) return undefined
  // The lint reads single-line scalars only. Block scalars hide length problems.
  if (/^[|>]/.test(serialized)) throw new Error(`${key} must be a single-line string`)
  if (serialized.startsWith('"')) return JSON.parse(serialized)
  if (serialized.startsWith("'") && serialized.endsWith("'"))
    return serialized.slice(1, -1).replaceAll("''", "'")
  // A plain scalar can't hold ": ", which YAML reads as a nested mapping.
  if (/: /.test(serialized)) throw new Error(`${key} must be quoted: ${serialized}`)
  return serialized.replace(/\s+#.*$/, '')
}

function routeFor(file: string) {
  const route = `/${path.relative(pagesRoot, file).split(path.sep).join('/')}`
    .replace(/\.mdx?$/, '')
    .replace(/(?:^|\/)index$/, '')
  return route || '/'
}

/** Mirrors Vocs' resolveTitleTemplate + replace('%s', title). */
function renderTitle(route: string, frontmatter: Record<string, unknown>) {
  const title = typeof frontmatter.title === 'string' ? frontmatter.title : vocsConfig.title
  // Pages under the OpenAPI mount render through Vocs' OpenAPI layout, which
  // uses seoTitle or the bare title and skips the title template.
  if (route === '/docs/api' || route.startsWith('/docs/api/')) {
    return typeof frontmatter.seoTitle === 'string' ? frontmatter.seoTitle.trim() : title
  }
  const template =
    typeof vocsConfig.titleTemplate === 'function'
      ? vocsConfig.titleTemplate(route, { frontmatter, siteTitle: vocsConfig.title, title })
      : vocsConfig.titleTemplate
  const resolved = title.includes(vocsConfig.title) ? undefined : template
  return resolved ? resolved.replace('%s', title) : title
}

function readPages(): PageMetadata[] {
  return markdownFiles(pagesRoot).map((file) => {
    const source = fs.readFileSync(file, 'utf8')
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
    const route = routeFor(file)
    const relative = path.relative(process.cwd(), file)
    try {
      const title = frontmatterValue(frontmatter, 'title')
      const seoTitle = frontmatterValue(frontmatter, 'seoTitle')
      return {
        description: frontmatterValue(frontmatter, 'description'),
        file: relative,
        renderedTitle: title ? renderTitle(route, { seoTitle, title }) : undefined,
        route,
        title,
      }
    } catch (error) {
      return {
        description: undefined,
        error: (error as Error).message,
        file: relative,
        renderedTitle: undefined,
        route,
        title: undefined,
      }
    }
  })
}

describe('docs SEO lint', () => {
  const pages = readPages()

  test('reads every authored page', () => {
    expect(pages.length).toBeGreaterThan(300)
    expect(pages.map((page) => page.route)).toContain('/')
    expect(pages.map((page) => page.route)).toContain('/docs/accounts/access-keys')
  })

  test('writes title, seoTitle, and description as single-line YAML strings', () => {
    expect(pages.flatMap(({ file, error }) => (error ? [`${file}: ${error}`] : []))).toEqual([])
  })

  test('gives every page a title and a description', () => {
    const missing = pages.flatMap(({ file, title, description }) => [
      ...(title?.trim() ? [] : [`${file}: missing title`]),
      ...(description?.trim() ? [] : [`${file}: missing description`]),
    ])
    expect(missing).toEqual([])
  })

  test('renders every title with the docs suffix in 60 characters or fewer', () => {
    const problems = pages.flatMap(({ file, route, renderedTitle }) =>
      titleProblems(route, renderedTitle).map(
        (problem) => `${file}: ${problem} (${renderedTitle})`,
      ),
    )
    expect(problems).toEqual([])
  })

  test('renders a unique title for every page', () => {
    const duplicates = duplicateTitles(
      pages.flatMap(({ route, renderedTitle }) =>
        renderedTitle ? [{ route, title: renderedTitle }] : [],
      ),
    )
    expect(duplicates).toEqual([])
  })

  test('keeps every description between 50 and 160 characters', () => {
    const problems = pages.flatMap(({ file, description }) =>
      descriptionProblems(description).map((problem) => `${file}: ${problem}`),
    )
    expect(problems).toEqual([])
  })
})

describe('docs SEO rules', () => {
  test('uses the docs title suffix in the Vocs title template', () => {
    expect(renderTitle('/docs/guide/payments/send-a-payment', { title: 'Send a Payment' })).toBe(
      `Send a Payment${docsTitleSuffix}`,
    )
    expect(renderTitle('/get-started', { title: 'Get Started' })).toBe(
      `Get Started${docsTitleSuffix}`,
    )
    expect(
      renderTitle('/docs/api', {
        title: 'Tempo API',
        seoTitle: 'Tempo API Reference | Tempo Docs',
      }),
    ).toBe('Tempo API Reference | Tempo Docs')
  })

  test('flags long titles, wrong suffixes, and the explainer exception', () => {
    expect(titleProblems('/docs/api', 'Tempo API | Tempo Docs')).toEqual([])
    expect(titleProblems('/docs/api', 'Tempo API ⋅ Tempo Docs')).toEqual([
      'title must end with " | Tempo Docs"',
    ])
    expect(titleProblems('/docs/api', 'Tempo API | Docs')).toHaveLength(1)
    expect(titleProblems('/docs/api', `${'x'.repeat(48)}${docsTitleSuffix}`)).toEqual([
      'title is 61 characters (max 60)',
    ])
    expect(titleProblems('/docs/api', undefined)).toEqual(['missing title'])
    expect(
      titleProblems('/docs/resources/guides/prefunding', `Prefunding${explainerTitleSuffix}`),
    ).toEqual([])
    expect(titleProblems('/docs/resources/guides', `Guides${explainerTitleSuffix}`)).toHaveLength(1)
  })

  test('flags missing, short, and long descriptions', () => {
    expect(descriptionProblems(undefined)).toEqual(['missing description'])
    expect(descriptionProblems('Too short.')).toEqual(['description is 10 characters (min 50)'])
    expect(descriptionProblems('x'.repeat(161))).toEqual([
      'description is 161 characters (max 160)',
    ])
    expect(descriptionProblems('x'.repeat(50))).toEqual([])
  })

  test('finds duplicate titles regardless of case', () => {
    expect(
      duplicateTitles([
        { route: '/a', title: 'Wallets | Tempo Docs' },
        { route: '/b', title: 'wallets | Tempo Docs' },
        { route: '/c', title: 'Bridges | Tempo Docs' },
      ]),
    ).toEqual([{ title: 'wallets | tempo docs', routes: ['/a', '/b'] }])
  })

  test('builds no-slash canonical URLs on the public docs mount', () => {
    expect(seoCanonicalOrigin).toBe(canonicalDevelopersOrigin)
    expect(canonicalUrlForRoute('/')).toBe('https://tempo.xyz/developers')
    expect(canonicalUrlForRoute('')).toBe('https://tempo.xyz/developers')
    expect(canonicalUrlForRoute('/docs/api/')).toBe('https://tempo.xyz/developers/docs/api')
    expect(canonicalUrlForRoute('get-started')).toBe('https://tempo.xyz/developers/get-started')
  })
})
