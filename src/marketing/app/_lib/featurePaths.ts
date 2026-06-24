const featurePaths: Record<string, string> = {
  transactions: '/build/tempo-transactions',
  tokens: '/build/tip20-tokens',
}

export function featurePath(slug: string): string {
  return featurePaths[slug] ?? '/build'
}
