import { Embedding, Reranker, Retriever } from 'vocs/config'

export function docsRetriever(endpoint?: string) {
  return Retriever.local({
    embedding: Embedding.cloudflare(),
    endpoint,
    hybrid: true,
    reranker: Reranker.cloudflare(),
    sources: [
      { url: 'https://viem.sh/llms.txt', label: 'viem' },
      { url: 'https://wagmi.sh/llms.txt', label: 'wagmi' },
      { url: 'https://mpp.dev/llms.txt', label: 'mpp' },
      { url: 'https://accounts.tempo.com/llms.txt', label: 'accounts' },
    ],
  })
}
