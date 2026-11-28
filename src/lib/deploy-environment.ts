export function deployEnvironment() {
  return process.env.DOCS_DEPLOY_ENV ?? process.env.VERCEL_ENV
}
