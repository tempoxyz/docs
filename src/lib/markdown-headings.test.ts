import { describe, expect, test } from 'vitest'
import { demoteMarkdownHeadings } from './markdown-headings'

describe('demoteMarkdownHeadings', () => {
  test('nests ATX and setext headings below the release title', () => {
    expect(
      demoteMarkdownHeadings(
        '# Release\n\n## Changes\n\n##### Detail\n\n###### Limit\n\nSetext title\n===\n\nSetext subtitle\n---',
      ),
    ).toBe(
      '### Release\n\n#### Changes\n\n###### Detail\n\n###### Limit\n\n### Setext title\n\n#### Setext subtitle',
    )
  })

  test('preserves code fences and handles nested headings', () => {
    expect(
      demoteMarkdownHeadings(
        '> # Quoted\n\n- # Listed\n\n> Setext quote\n> ---\n\n```sh\n# shell comment\n## still code\n```',
      ),
    ).toBe(
      '> ### Quoted\n\n- ### Listed\n\n> #### Setext quote\n\n```sh\n# shell comment\n## still code\n```',
    )
  })

  test('uses the minimum shift needed to nest headings below a release title', () => {
    expect(demoteMarkdownHeadings('## Changes\n\n### Fixes')).toBe('### Changes\n\n#### Fixes')
    expect(demoteMarkdownHeadings('### Changes\n\n#### Fixes')).toBe('### Changes\n\n#### Fixes')
  })
})
