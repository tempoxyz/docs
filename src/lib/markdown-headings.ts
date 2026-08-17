import remarkParse from 'remark-parse'
import { unified } from 'unified'

type MarkdownNode = {
  children?: MarkdownNode[] | undefined
  depth?: number | undefined
  position?:
    | {
        end: { offset?: number | undefined }
        start: { offset?: number | undefined }
      }
    | undefined
  type: string
}

type Edit = {
  end: number
  replacement: string
  start: number
}

const parser = unified().use(remarkParse)

/**
 * Nests rendered Markdown headings below an H2 release title without reserializing the body.
 * This preserves relative hierarchy and release-note formatting while ignoring heading-like
 * text in code fences.
 */
export function demoteMarkdownHeadings(markdown: string): string {
  const tree = parser.parse(markdown) as MarkdownNode
  const edits: Edit[] = []
  const headings: MarkdownNode[] = []

  visit(tree, (node) => {
    if (node.type === 'heading' && node.depth) headings.push(node)
  })

  const minimumDepth = Math.min(...headings.map((heading) => heading.depth ?? 6))
  const depthShift = Math.max(0, 3 - minimumDepth)
  if (depthShift === 0) return markdown

  for (const node of headings) {
    if (!node.depth || node.depth >= 6) continue

    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (start === undefined || end === undefined) continue

    const targetDepth = Math.min(6, node.depth + depthShift)
    const appliedShift = targetDepth - node.depth
    if (appliedShift === 0) continue

    if (markdown[start] === '#') {
      edits.push({ end: start, replacement: '#'.repeat(appliedShift), start })
      continue
    }

    const source = markdown.slice(start, end)
    const underline = /([=-]+)[\t ]*$/.exec(source)
    if (!underline || underline.index === undefined) continue

    if (targetDepth < 3) continue

    const newlineIndex = source.lastIndexOf('\n', underline.index)
    if (newlineIndex === -1) continue

    const lineBreakStart = source[newlineIndex - 1] === '\r' ? newlineIndex - 1 : newlineIndex
    edits.push({ end: start, replacement: `${'#'.repeat(targetDepth)} `, start })
    edits.push({ end, replacement: '', start: start + lineBreakStart })
  }

  return edits
    .sort((a, b) => b.start - a.start)
    .reduce(
      (output, edit) =>
        `${output.slice(0, edit.start)}${edit.replacement}${output.slice(edit.end)}`,
      markdown,
    )
}

function visit(node: MarkdownNode, visitor: (node: MarkdownNode) => void) {
  visitor(node)
  for (const child of node.children ?? []) visit(child, visitor)
}
