import { describe, expect, it } from 'vitest'
import { rehypeCompactShikiStyles } from './compact-shiki-styles'

describe('rehypeCompactShikiStyles', () => {
  it('deduplicates inline styles inside Shiki markup', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'mdxjsEsm', value: "import { Tabs } from 'vocs/components'" },
        {
          type: 'element',
          tagName: 'pre',
          properties: { class: 'shiki shiki-themes', style: 'background:#fff;color:#111' },
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { style: 'color:light-dark(#111, #eee);--shiki-light:#111' },
                  children: [{ type: 'text', value: 'const' }],
                },
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { style: 'color:light-dark(#111, #eee);--shiki-light:#111' },
                  children: [{ type: 'text', value: ' value' }],
                },
              ],
            },
          ],
        },
        {
          type: 'element',
          tagName: 'div',
          properties: { style: 'color:red' },
          children: [],
        },
      ],
    }

    rehypeCompactShikiStyles()(tree)

    const styleRegistry = tree.children[1]
    const pre = tree.children[2]
    const spans = pre.children?.[0]?.children ?? []

    expect(styleRegistry).toMatchObject({
      type: 'element',
      tagName: 'style',
      properties: { 'data-shiki-styles': '' },
    })
    expect(styleRegistry.children?.[0]?.value?.match(/color:light-dark/g)).toHaveLength(1)
    expect(pre.properties?.style).toBeUndefined()
    expect(spans[0]?.properties?.style).toBeUndefined()
    expect(spans[0]?.properties?.class).toEqual(spans[1]?.properties?.class)
    expect(tree.children[3]?.properties?.style).toBe('color:red')
  })

  it('does not add a registry when the page has no Shiki markup', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: { style: 'color:red' },
          children: [{ type: 'text', value: 'Tempo' }],
        },
      ],
    }

    rehypeCompactShikiStyles()(tree)

    expect(tree.children).toHaveLength(1)
    expect(tree.children[0]?.properties?.style).toBe('color:red')
  })
})
