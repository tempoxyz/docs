import * as z from 'zod/mini'

export const rowValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])

export const responseSchema = z.object({
  columns: z.array(
    z.object({
      name: z.string(),
    }),
  ),
  rows: z.array(z.array(rowValueSchema)),
})

export type QueryResponse = z.infer<typeof responseSchema>

type RunQueryOptions = {
  chainId: number
  signatures?: string[]
}

export async function runTidxQuery(query: string, options: RunQueryOptions) {
  const response = await fetch('/api/tidx', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      chainId: options.chainId,
      query: query.replace(/\s+/g, ' ').trim(),
      signatures: options.signatures,
    }),
  })

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new Error('API returned invalid JSON')
  }

  if (!response.ok) {
    const message =
      typeof json === 'object' &&
      json !== null &&
      'error' in json &&
      typeof (json as { error?: string }).error === 'string'
        ? (json as { error: string }).error
        : response.statusText
    throw new Error(`API error (${response.status}): ${message}`)
  }

  return z.parse(responseSchema, json)
}
