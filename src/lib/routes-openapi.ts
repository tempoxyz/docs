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

/**
 * Names the v1 create operation `createRoutesDepositAddressV2` when the spec has no v2 operation.
 * Transitional: remove once the deployed API publishes `/v2/routes/deposit-addresses`.
 */
export function aliasRoutesDepositAddressV2(spec: Record<string, unknown>) {
  const paths = spec.paths as Record<string, Record<string, Record<string, unknown>>> | undefined
  if (paths?.['/v2/routes/deposit-addresses']?.post) return spec
  const operation = paths?.['/v1/routes/deposit-addresses']?.post
  if (operation?.operationId === 'createRoutesDepositAddress')
    operation.operationId = 'createRoutesDepositAddressV2'
  return spec
}
