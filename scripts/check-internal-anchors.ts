import path from 'node:path'
import { checkInternalAnchors } from '../src/lib/internal-anchor-links.ts'

const result = checkInternalAnchors(path.resolve('src/pages'))

if (result.failures.length > 0) {
  console.error('Broken internal anchor links:')
  for (const failure of result.failures) {
    console.error(
      `- ${path.relative(process.cwd(), failure.file)}:${failure.line} ${failure.href} (missing #${failure.fragment} on ${failure.targetRoute})`,
    )
  }
  process.exit(1)
}

console.log(
  `Internal anchor check passed: ${result.linksChecked} links across ${result.pagesChecked} pages.`,
)
