declare module 'next' {
  export type Metadata = Record<string, unknown>
}

declare module 'next/link' {
  export { default } from './next-shims'
}

declare module 'next/image' {
  export { Image as default } from './next-shims'
}

declare module 'next/navigation' {
  export function notFound(): never
  export function usePathname(): string
}
