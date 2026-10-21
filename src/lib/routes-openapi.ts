/** Keep unavailable composed operations visibly distinct without hiding their contract. */
export function annotateRoutesAvailability(spec: Record<string, unknown>) {
  const paths = spec.paths as Record<string, { post?: Record<string, unknown> }> | undefined
  for (const path of ['/v1/routes/transfers/vault', '/v1/routes/transfers/zone']) {
    const operation = paths?.[path]?.post
    const responses = operation?.responses as Record<string, unknown> | undefined
    if (
      !operation ||
      !responses?.['501'] ||
      Object.keys(responses).some((status) => /^2/.test(status))
    )
      continue
    operation.summary = `${operation.summary ?? 'Create transfer'} (not implemented)`
    operation.description = `**Not implemented.** This operation returns HTTP \`501\`. Fund a Tempo account first, then use the separate Earn or Zone deposit flow.\n\n${operation.description ?? ''}`
  }
  return spec
}
