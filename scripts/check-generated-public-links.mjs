import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const publicOutputs = [
  { label: 'Vite', directory: path.resolve(process.cwd(), 'dist/public') },
  { label: 'Vercel', directory: path.resolve(process.cwd(), '.vercel/output/static') },
]

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

const attributeLink = {
  label: 'HTML or JSX link attribute',
  pattern: /\b(?:href|to)=(?:\\?["'])(?:\/developers)?\/docs(?=\/|[#?]|\\?["'])/g,
}
const serializedHref = {
  label: 'serialized href',
  pattern:
    /(?:\\?["'])href(?:\\?["'])\s*:\s*(?:\\?["'])(?:\/developers)?\/docs(?=\/|[#?]|\\?["'])/g,
}
const markdownLink = {
  label: 'Markdown link',
  pattern: /\]\(\s*(?:\/developers)?\/docs(?=\/|[#?]|\s|\))/g,
}
const markdownReference = {
  label: 'Markdown reference link',
  pattern: /^\s*\[[^\]]+\]:\s*<?(?:\/developers)?\/docs(?=\/|[#?]|>?(?:\s|$))/gm,
}

const outputArtifacts = await Promise.all(
  publicOutputs.map(async (output) => {
    const htmlFiles = await filesWithExtension(output.directory, '.html')
    const rscFiles = await filesWithExtension(path.join(output.directory, 'RSC'), '.txt')
    const markdownFiles = await filesWithExtension(path.join(output.directory, 'assets/md'), '.md')
    const llmsFiles = ['llms.txt', 'llms-full.txt'].map((file) => path.join(output.directory, file))

    return { ...output, htmlFiles, rscFiles, markdownFiles, llmsFiles }
  }),
)

const candidateGroups = outputArtifacts.flatMap(
  ({ htmlFiles, rscFiles, markdownFiles, llmsFiles }) => [
    { files: htmlFiles, patterns: [attributeLink, serializedHref] },
    { files: rscFiles, patterns: [attributeLink, serializedHref] },
    {
      files: [...markdownFiles, ...llmsFiles],
      patterns: [attributeLink, serializedHref, markdownLink, markdownReference],
    },
  ],
)

const failures = []
const canonicalApiPrefix = 'https://tempo.xyz/developers/docs/api/'
for (const { label, directory, htmlFiles, rscFiles, markdownFiles } of outputArtifacts) {
  for (const [artifact, files] of [
    ['HTML', htmlFiles],
    ['RSC', rscFiles],
    ['Markdown', markdownFiles],
  ]) {
    if (files.length === 0) failures.push(`${label} output has no generated ${artifact} artifacts`)
  }

  for (const relativePath of [
    'docs/api/index.html',
    'RSC/R/docs/api.txt',
    'assets/md/docs/api.md',
  ]) {
    const file = path.join(directory, relativePath)
    const content = await readFile(file, 'utf8')
    if (!content.includes(canonicalApiPrefix)) {
      failures.push(
        `${path.relative(process.cwd(), file)} does not contain canonical Tempo API links`,
      )
    }
  }
}

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
  console.error('Generated public artifact link audit failed:')
  console.error(
    failures
      .slice(0, 50)
      .map((failure) => `- ${failure}`)
      .join('\n'),
  )
  if (failures.length > 50) console.error(`- and ${failures.length - 50} more`)
  process.exit(1)
}

console.log('Generated public link audit passed:')
for (const { label, htmlFiles, rscFiles, markdownFiles, llmsFiles } of outputArtifacts) {
  console.log(
    `- ${label}: ${htmlFiles.length} HTML, ${rscFiles.length} RSC, ${markdownFiles.length} Markdown, ${llmsFiles.length} LLM files`,
  )
}
