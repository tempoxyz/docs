import { compile, match } from 'path-to-regexp'
import build from '../dist/cloudflare/cloudflare-build.json'
import * as Redirects from '../node_modules/vocs/dist/internal/redirects.js'
import config from '../vercel.json'

function createRoute(source: string, destination: string) {
  const matches = match(source)
  // Vercel accepts destination parameters inside absolute URLs and fragments.
  // Compile only the path/query/fragment after the fixed origin.
  const origin = destination.match(/^https:\/\/[^/]+/)?.[0] ?? ''
  const template = destination.slice(origin.length)
  const interpolate = /:\w+/.test(template)
    ? compile(template, { validate: false })
    : () => template

  return (pathname: string) => {
    const result = matches(pathname)
    return result ? origin + interpolate(result.params) : undefined
  }
}

const redirects = config.redirects.map(({ source, destination, permanent, has }) => ({
  route: createRoute(source, destination),
  status: permanent ? 308 : 307,
  hosts: has?.map(({ value }) => (value.startsWith('^') ? new RegExp(value) : value)),
}))
const rewrites = config.rewrites.map(({ source, destination }) => createRoute(source, destination))

function withQuery(destination: string, source: URL) {
  const location = Redirects.appendSearch(destination, source.search)
  // A wildcard may begin with a slash. Relative paths stay on this origin.
  return new URL(location.startsWith('/') ? source.origin + location : location)
}

const nativeRedirects = Redirects.from(build.redirects as Redirects.Inputs)

export function edgeRedirect(url: URL) {
  for (const { route, status, hosts } of redirects) {
    if (
      hosts &&
      !hosts.every((host) =>
        typeof host === 'string' ? host === url.hostname : host.test(url.hostname),
      )
    )
      continue
    const destination = route(url.pathname)
    if (destination) {
      const location = withQuery(destination, url)
      if (location.href !== url.href) return Response.redirect(location, status)
    }
  }
  const native = Redirects.resolve(url.pathname, nativeRedirects)
  if (native) {
    const location = withQuery(native.destination, url)
    if (location.href !== url.href) return Response.redirect(location, native.status)
  }
}

export function edgeRewrite(url: URL) {
  for (const route of rewrites) {
    const destination = route(url.pathname)
    if (destination) return withQuery(destination, url)
  }
  return url
}
