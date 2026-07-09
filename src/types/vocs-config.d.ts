import 'vocs/config'

declare module 'vocs/config' {
  export function defineConfig(config: unknown): Config
}
