declare module '*cloudflare-build.json' {
  const build: {
    redirects: { source: string; destination: string; status?: 301 | 302 | 307 | 308 }[]
    aiSearch: boolean
    posthog: { key?: string; host?: string }
  }
  export default build
}

declare module '*.wasm' {
  const module: WebAssembly.Module
  export default module
}

declare module '*.otf' {
  const data: ArrayBuffer
  export default data
}

declare module '*.png' {
  const data: ArrayBuffer
  export default data
}

declare module '*.gz' {
  const data: ArrayBuffer
  export default data
}
