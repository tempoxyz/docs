interface EnvironmentVariables {
  readonly NODE_ENV: 'development' | 'production' | 'test'

  readonly VITE_BASE_URL: string
  readonly VITE_POSTHOG_KEY: string
  readonly VITE_POSTHOG_HOST: string
  readonly VITE_TEMPO_ENV: 'localnet' | 'devnet' | 'moderato'

  readonly INDEXSUPPLY_API_KEY: string
  readonly SLACK_FEEDBACK_WEBHOOK: string

  readonly VERCEL_URL: string
  readonly VERCEL_BRANCH_URL: string
  readonly VERCEL_PROJECT_PRODUCTION_URL: string
  readonly VERCEL_ENV: 'development' | 'production' | 'preview'
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}

interface ImportMetaEnv extends EnvironmentVariables {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
