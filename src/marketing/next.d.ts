declare module 'next' {
  export type Metadata = Record<string, unknown>
}

declare module 'virtual:blog-posts' {
  export const posts: {
    slug: string
    title: string
    excerpt: string
    date: string
    category: string
    featured: boolean
    html: string
  }[]
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
