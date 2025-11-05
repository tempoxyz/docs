interface ImportMetaEnv {
  readonly VITE_LOCAL: string
  readonly VITE_RPC_CREDENTIALS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
