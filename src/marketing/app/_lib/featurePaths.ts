import { developersPath } from './developersPaths'

const featurePaths: Record<string, string> = {
  transactions: developersPath('/build/tempo-transactions'),
  tokens: developersPath('/build/tip20-tokens'),
}

export function featurePath(slug: string): string {
  return featurePaths[slug] ?? developersPath('/build')
}
