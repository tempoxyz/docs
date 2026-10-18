// E2E shards install dependencies while the E2E Build job compiles the site,
// then wait here for its artifact instead of rebuilding. Writes the artifact
// name to GITHUB_OUTPUT for actions/download-artifact.
import { appendFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const [jobName = 'E2E Build', prefix = 'e2e-dist'] = process.argv.slice(2)
const {
  GITHUB_API_URL,
  GITHUB_OUTPUT,
  GITHUB_REPOSITORY,
  GITHUB_RUN_ATTEMPT,
  GITHUB_RUN_ID,
  GITHUB_TOKEN,
} = process.env
const deadline = Date.now() + 15 * 60_000

async function api(path) {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}${path}`,
    {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${GITHUB_TOKEN}`,
        'x-github-api-version': '2022-11-28',
      },
    },
  )
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${path}`)
  return response.json()
}

for (;;) {
  const { jobs } = await api('/jobs?filter=latest&per_page=100')
  const build = jobs.find((job) => job.name === jobName)
  if (!build) throw new Error(`No "${jobName}" job in this run`)

  if (build.status === 'completed' && build.conclusion !== 'success') {
    console.error(`"${jobName}" finished with ${build.conclusion}; no build to test.`)
    process.exit(1)
  }

  // A build still running belongs to this attempt and uploads under its number.
  // A partial re-run carries a finished build forward without uploading again,
  // so a finished build means the newest upload.
  const { artifacts } = await api('/artifacts?per_page=100')
  const names = artifacts
    .filter((artifact) => !artifact.expired && artifact.name.startsWith(`${prefix}-`))
    .map((artifact) => artifact.name)
    .sort((a, b) => Number(b.slice(prefix.length + 1)) - Number(a.slice(prefix.length + 1)))
  const name =
    build.status === 'completed'
      ? names[0]
      : names.find((name) => name === `${prefix}-${GITHUB_RUN_ATTEMPT}`)
  if (name) {
    appendFileSync(GITHUB_OUTPUT, `name=${name}\n`)
    console.log(`Found ${name}`)
    break
  }

  if (Date.now() > deadline) {
    console.error(`Timed out waiting for the ${jobName} artifact.`)
    process.exit(1)
  }
  await sleep(5_000)
}
