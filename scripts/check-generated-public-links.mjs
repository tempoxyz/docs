import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const publicDir = path.resolve(process.cwd(), 'dist/public')

async function filesWithExtension(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return filesWithExtension(entryPath, extension)
      if (entry.isFile() && entry.name.endsWith(extension)) return [entryPath]
      return []
    }),
  )
  return files.flat()
}

const htmlFiles = await filesWithExtension(publicDir, '.html')
const rscFiles = await filesWithExtension(path.join(publicDir, 'RSC'), '.txt')
const markdownFiles = await filesWithExtension(path.join(publicDir, 'assets/md'), '.md')
const llmsFiles = ['llms.txt', 'llms-full.txt'].map((file) => path.join(publicDir, file))

const attributeLink = {
  label: 'HTML or JSX link attribute',
  pattern: /\b(?:href|to)=(?:\\?["'])\/docs(?=\/|[#?]|\\?["'])/g,
}
const serializedHref = {
  label: 'serialized href',
  pattern: /(?:\\?["'])href(?:\\?["'])\s*:\s*(?:\\?["'])\/docs(?=\/|[#?]|\\?["'])/g,
}
const markdownLink = {
  label: 'Markdown link',
  pattern: /\]\(\s*\/docs(?=\/|[#?]|\s|\))/g,
}
const markdownReference = {
  label: 'Markdown reference link',
  pattern: /^\s*\[[^\]]+\]:\s*<?\/docs(?=\/|[#?]|>?(?:\s|$))/gm,
}

const candidateGroups = [
  { files: htmlFiles, patterns: [attributeLink, serializedHref] },
  { files: rscFiles, patterns: [attributeLink, serializedHref] },
  {
    files: [...markdownFiles, ...llmsFiles],
    patterns: [attributeLink, serializedHref, markdownLink, markdownReference],
  },
]

const failures = []
for (const { files, patterns } of candidateGroups) {
  for (const file of files) {
    const content = await readFile(file, 'utf8')
    for (const { label, pattern } of patterns) {
      for (const match of content.matchAll(pattern)) {
        const line = content.slice(0, match.index).split('\n').length
        failures.push(`${path.relative(process.cwd(), file)}:${line} (${label})`)
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Generated public artifacts contain uncanonicalized /docs link targets:')
  console.error(
    failures
      .slice(0, 50)
      .map((failure) => `- ${failure}`)
      .join('\n'),
  )
  if (failures.length > 50) console.error(`- and ${failures.length - 50} more`)
  process.exit(1)
}

console.log(
  `Generated public link audit passed (${htmlFiles.length} HTML, ${rscFiles.length} RSC, ${markdownFiles.length} Markdown, ${llmsFiles.length} LLM files).`,
)
