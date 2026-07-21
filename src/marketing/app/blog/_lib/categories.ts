// Category definitions, post metadata shape, and date helpers for the blog.
// Kept free of node/build imports so client components can use it directly.

export const categories = [
  { slug: 'network-upgrades', label: 'Network upgrades', badge: 'network upgrade' },
  { slug: 'events', label: 'Events', badge: 'events' },
  { slug: 'technical', label: 'Technical posts', badge: 'technical' },
  { slug: 'case-studies', label: 'Case studies', badge: 'case study' },
] as const

export type Category = (typeof categories)[number]
export type CategorySlug = Category['slug']

export type PostMeta = {
  slug: string
  title: string
  excerpt: string
  date: string
  category: CategorySlug
  authors: string
  featured: boolean
}

export function categoryBySlug(slug: CategorySlug): Category {
  return categories.find((c) => c.slug === slug) ?? categories[0]
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// Posts published within this window get a "New" tag next to their date.
const NEW_WINDOW_DAYS = 14

export function isNew(date: string): boolean {
  const ageMs = Date.now() - new Date(`${date}T00:00:00Z`).getTime()
  return ageMs >= 0 && ageMs < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
}
