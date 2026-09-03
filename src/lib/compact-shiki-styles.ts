type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

type HastRoot = HastNode & { children: HastNode[] }

function classNames(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean)
  return []
}

function styleClassName(style: string): string {
  let high = 0xdeadbeef
  let low = 0x41c6ce57

  for (let index = 0; index < style.length; index += 1) {
    const code = style.charCodeAt(index)
    high = Math.imul(high ^ code, 2_654_435_761)
    low = Math.imul(low ^ code, 1_597_334_677)
  }

  high =
    Math.imul(high ^ (high >>> 16), 2_246_822_507) ^ Math.imul(low ^ (low >>> 13), 3_266_489_909)
  low =
    Math.imul(low ^ (low >>> 16), 2_246_822_507) ^ Math.imul(high ^ (high >>> 13), 3_266_489_909)

  return `s-${(high >>> 0).toString(36)}${(low >>> 0).toString(36)}`
}

function compactNodeStyles(
  node: HastNode,
  inheritedShikiContext: boolean,
  styles: Map<string, string>,
) {
  const properties = node.properties
  const nodeClasses = [...classNames(properties?.class), ...classNames(properties?.className)]
  const shikiContext = inheritedShikiContext || nodeClasses.includes('shiki')

  if (shikiContext && properties && typeof properties.style === 'string') {
    const style = properties.style.trim()
    if (style) {
      const className = styleClassName(style)
      const registeredStyle = styles.get(className)

      if (registeredStyle && registeredStyle !== style) {
        throw new Error(`Shiki style hash collision for ${className}`)
      }

      styles.set(className, style)
      if ('className' in properties) properties.className = [...nodeClasses, className]
      else properties.class = [...nodeClasses, className].join(' ')
      delete properties.style
    }
  }

  for (const child of node.children ?? []) compactNodeStyles(child, shikiContext, styles)
}

/**
 * Replaces repeated Shiki inline styles with deterministic classes and one
 * page-level style registry. Vocs otherwise serializes the same light/dark
 * token colors thousands of times into the initial React Flight response.
 */
export function rehypeCompactShikiStyles() {
  return (tree: HastRoot) => {
    const styles = new Map<string, string>()
    compactNodeStyles(tree, false, styles)
    if (styles.size === 0) return

    const css = [...styles]
      .map(([className, style]) => `.${className}{${style.endsWith(';') ? style : `${style};`}}`)
      .join('')

    const styleNode: HastNode = {
      type: 'element',
      tagName: 'style',
      properties: { 'data-shiki-styles': '' },
      children: [{ type: 'text', value: css }],
    }

    let insertionIndex = 0
    while (tree.children[insertionIndex]?.type === 'mdxjsEsm') insertionIndex += 1
    tree.children.splice(insertionIndex, 0, styleNode)
  }
}
