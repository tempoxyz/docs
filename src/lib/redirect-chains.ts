export type RedirectRule = {
  source: string
  destination: string
  has?: unknown
}

export type RedirectHop = {
  from: string
  to: string
}

export type RedirectTrace = {
  start: string
  hops: RedirectHop[]
  final: string
  loop: boolean
}

export type CompiledRule = {
  rule: RedirectRule
  regex: RegExp
  keys: string[]
}

// Vercel's path-to-regexp source syntax as used in this repository: `:name`, `:name*`,
// `:name+`, `:name?` and `:name(custom)` with an optional modifier.
const parameterPattern = /(\/)?:([A-Za-z_]\w*)(\((?:[^()]|\([^()]*\))*\))?([*+?])?/g

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isMounted(path: string) {
  return path === '/developers' || path.startsWith('/developers/')
}

function pathOf(location: string) {
  return location.split('#')[0]?.split('?')[0] || '/'
}

export function compileSource(source: string): { regex: RegExp; keys: string[] } {
  const keys: string[] = []
  let pattern = ''
  let lastIndex = 0
  for (const match of source.matchAll(parameterPattern)) {
    const [token, slash = '', name = '', group, modifier] = match
    pattern += escapeRegExp(source.slice(lastIndex, match.index))
    lastIndex = match.index + token.length
    keys.push(name)
    const repeated = modifier === '*' || modifier === '+'
    const inner = group ? group.slice(1, -1) : repeated ? '[^/#?]+?(?:/[^/#?]+?)*' : '[^/#?]+?'
    const prefix = escapeRegExp(slash)
    pattern +=
      modifier === '*' || modifier === '?' ? `(?:${prefix}(${inner}))?` : `${prefix}(${inner})`
  }
  pattern += escapeRegExp(source.slice(lastIndex))
  return { regex: new RegExp(`^${pattern}$`), keys }
}

export function compileRules(rules: readonly RedirectRule[]): CompiledRule[] {
  return rules.map((rule) => ({ rule, ...compileSource(rule.source) }))
}

/** Applies the first matching rule, as Vercel and Vocs do, and returns its destination. */
export function applyFirstMatch(compiled: readonly CompiledRule[], path: string) {
  for (const { rule, regex, keys } of compiled) {
    const match = regex.exec(path)
    if (!match) continue
    const values = new Map(keys.map((key, index) => [key, match[index + 1] ?? '']))
    const destination = rule.destination.replace(
      /:([A-Za-z_]\w*)(?:\((?:[^()]|\([^()]*\))*\))?[*+?]?/g,
      (token, key: string) => (values.has(key) ? (values.get(key) as string) : token),
    )
    // An empty optional trailing segment would leave a trailing slash.
    const trailingParameter = /:[A-Za-z_]\w*(?:\([^)]*\))?[*?](?=$|[?#])/.test(rule.destination)
    return {
      rule,
      destination: trailingParameter
        ? destination.replace(/(?<=[^/])\/+(?=$|[?#])/, '')
        : destination,
    }
  }
  return undefined
}

/**
 * Follows a request through the docs redirects as a browser on the public mount sees it.
 *
 * The public site proxies `${canonicalOrigin}/*` to this deployment with the mount stripped and
 * passes `Location` headers through unchanged. A canonical destination lands on the deployment
 * again at its unprefixed path. A root-relative destination resolves on the public site, outside
 * the mount, and costs the public site's own redirect back into it. Paths under `/developers`
 * only reach this deployment when it is requested directly, so their relative destinations stay
 * on the deployment host.
 */
export function traceRedirects({
  path,
  rules,
  canonicalOrigin,
  maxHops = 10,
}: {
  path: string
  rules: readonly CompiledRule[]
  canonicalOrigin: string
  maxHops?: number
}): RedirectTrace {
  const hops: RedirectHop[] = []
  const seen = new Set<string>()
  let onDeploymentHost = isMounted(path)
  let current = path
  let display = onDeploymentHost ? path : `${canonicalOrigin}${path === '/' ? '' : path}`
  while (hops.length < maxHops) {
    const key = `${onDeploymentHost}:${current}`
    if (seen.has(key)) return { start: path, hops, final: display, loop: true }
    seen.add(key)
    const applied = applyFirstMatch(rules, current)
    if (!applied) break
    const { destination } = applied
    hops.push({ from: display, to: destination })
    if (destination === canonicalOrigin || destination.startsWith(`${canonicalOrigin}/`)) {
      current = pathOf(destination.slice(canonicalOrigin.length))
      display = destination
      onDeploymentHost = false
      continue
    }
    if (URL.canParse(destination)) {
      display = destination
      break
    }
    const next = pathOf(destination)
    if (onDeploymentHost) {
      current = next
      display = destination
      onDeploymentHost = isMounted(next)
      continue
    }
    if (isMounted(next)) {
      current = next.slice('/developers'.length) || '/'
    } else {
      current = next
      hops.push({ from: destination, to: `${canonicalOrigin}${next === '/' ? '' : next}` })
    }
    display = `${canonicalOrigin}${current === '/' ? '' : current}`
  }
  return { start: path, hops, final: display, loop: hops.length >= maxHops }
}

function expandGroup(group: string | undefined, modifier: string | undefined): string[] {
  const optional = modifier === '*' || modifier === '?'
  const alternatives =
    group && /^\(([\w-]+(?:\|[\w-]+)*)\)$/.test(group) ? group.slice(1, -1).split('|') : ['sample']
  return optional ? [...alternatives, ''] : alternatives
}

/** Concrete request paths that exercise each alternative of a source pattern. */
export function sampleSourcePaths(source: string): string[] {
  let samples = ['']
  let lastIndex = 0
  for (const match of source.matchAll(parameterPattern)) {
    const [token, slash = '', , group, modifier] = match
    const literal = source.slice(lastIndex, match.index)
    lastIndex = match.index + token.length
    const values = expandGroup(group, modifier)
    samples = samples.flatMap((sample) =>
      values.map((value) => `${sample}${literal}${value ? `${slash}${value}` : ''}`),
    )
  }
  return samples.map((sample) => `${sample}${source.slice(lastIndex)}` || '/')
}

const parameterPlaceholder = '__redirect_parameter__'
const parameterToken = /:([A-Za-z_]\w*)(?:\((?:[^()]|\([^()]*\))*\))?[*+?]?/g

function followDestination(
  compiled: readonly CompiledRule[],
  destination: string,
  maxHops: number,
) {
  const parameters: string[] = []
  let current = destination.replace(parameterToken, (token) => {
    parameters.push(token)
    return `${parameterPlaceholder}${parameters.length - 1}`
  })
  for (let hop = 0; hop < maxHops && current.startsWith('/'); hop++) {
    const [pathAndQuery = '', hash] = current.split('#')
    const next = applyFirstMatch(compiled, pathAndQuery.split('?')[0] || '/')
    if (!next || next.destination === current) break
    current =
      next.destination.includes('#') || hash === undefined
        ? next.destination
        : `${next.destination}#${hash}`
  }
  const resolved = current.replace(
    new RegExp(`${parameterPlaceholder}(\\d+)`, 'g'),
    (_, index: string) => parameters[Number(index)] as string,
  )
  // A parameter that a later rule dropped or moved into a fixed path cannot be expressed.
  return parameters.every((token) => resolved.includes(token)) ? resolved : destination
}

/**
 * Points every redirect at the end of its chain within the same list, so a retired route that
 * moved twice still answers with one redirect. Where a wildcard forwards into a more specific
 * retired route, that route is spelled out ahead of the wildcard. A hash on a later hop wins.
 */
export function collapseRedirectChains<redirect extends RedirectRule>(
  redirects: readonly redirect[],
  maxHops = 10,
): redirect[] {
  let result = [...redirects]
  for (let pass = 0; pass < maxHops; pass++) {
    const compiled = compileRules(result)
    const collapsed = result.map((redirect) => {
      const destination = followDestination(compiled, redirect.destination, maxHops)
      return destination === redirect.destination ? redirect : { ...redirect, destination }
    })
    const sources = new Set(collapsed.map(({ source }) => source))
    const expanded: redirect[] = []
    for (const redirect of collapsed) {
      const wildcard = /^(.*)\/:([A-Za-z_]\w*)\*$/.exec(redirect.source)
      const suffix = wildcard ? `/:${wildcard[2]}*` : undefined
      if (wildcard && suffix && redirect.destination.endsWith(suffix)) {
        const from = wildcard[1] as string
        const to = redirect.destination.slice(0, -suffix.length)
        for (const target of collapsed) {
          if (target === redirect) continue
          if (target.source !== to && !target.source.startsWith(`${to}/`)) continue
          const source = `${from}${target.source.slice(to.length)}`
          if (sources.has(source)) continue
          sources.add(source)
          expanded.push({ ...redirect, source, destination: target.destination })
        }
      }
      expanded.push(redirect)
    }
    const changed =
      expanded.length !== result.length ||
      expanded.some((redirect, index) => redirect !== result[index])
    result = expanded
    if (!changed) break
  }
  return result
}
