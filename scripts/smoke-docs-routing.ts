import { canonicalDevelopersOrigin, routingSmokeCases } from '../src/lib/docs-routing'

type SmokeCase =
  | (typeof routingSmokeCases.canonical)[number]
  | (typeof routingSmokeCases.legacy)[number]

function originFromEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return new URL(value).origin
}

function urlFor(origin: string, path: string) {
  return new URL(path, `${origin}/`).toString()
}

async function request(url: string) {
  return fetch(url, { redirect: 'manual' })
}

async function checkCase(origin: string, testCase: SmokeCase) {
  const source = urlFor(origin, testCase.path)
  const response = await request(source)

  if ('expectedStatus' in testCase) {
    if (response.status !== testCase.expectedStatus) {
      throw new Error(`${source} returned ${response.status}; expected ${testCase.expectedStatus}`)
    }
    return
  }

  if ('expectedNonRedirect' in testCase) {
    if (response.status >= 300 && response.status < 400) {
      throw new Error(`${source} unexpectedly redirected to ${response.headers.get('location')}`)
    }
    return
  }

  const location = response.headers.get('location')
  if (location !== testCase.expectedLocation) {
    throw new Error(`${source} redirected to ${location}; expected ${testCase.expectedLocation}`)
  }

  const finalResponse = await request(new URL(location, source).toString())
  if (finalResponse.status !== testCase.expectedFinalStatus) {
    throw new Error(
      `${source} reached ${location} with ${finalResponse.status}; expected ${testCase.expectedFinalStatus}`,
    )
  }
}

const canonicalOrigin = originFromEnv('DOCS_ROUTING_SMOKE_CANONICAL_ORIGIN')
const legacyOrigin = originFromEnv('DOCS_ROUTING_SMOKE_LEGACY_ORIGIN')

if (canonicalOrigin !== new URL(canonicalDevelopersOrigin).origin) {
  console.warn(
    `Canonical smoke target is ${canonicalOrigin}; expected production origin ${new URL(canonicalDevelopersOrigin).origin}.`,
  )
}

for (const testCase of routingSmokeCases.canonical) await checkCase(canonicalOrigin, testCase)
for (const testCase of routingSmokeCases.legacy) await checkCase(legacyOrigin, testCase)

console.log(
  `Validated ${routingSmokeCases.canonical.length + routingSmokeCases.legacy.length} deployed routing cases.`,
)
