/** The website must deploy these posts before the docs redirects are released. */
export const engineeringBlogUrl = 'https://tempo.xyz/blog/?channel=engineering'

// Keep original files and public/blog assets for rollback and inbound media links.
export const migratedBlogSlugs = [
  'human-authorization-in-agentic-workflows',
  'introducing-mercator',
  'introducing-stable-bench-v1',
  'privacy-with-tempo-zones',
  't6',
  't7-network-upgrade',
] as const

const blogAliases = [
  ...migratedBlogSlugs.map((slug) => [slug, slug] as const),
  ['inside-tempo-zones', 'privacy-with-tempo-zones'],
] as const

/** Exact page routes only: a /blog/:path* redirect would swallow images and video. */
export const blogMigrationRedirects = [
  { source: '/blog', destination: engineeringBlogUrl },
  ...['/blog.md', '/blog/index.md', '/assets/md/blog.md', '/assets/md/blog/index.md'].map(
    (source) => ({ source, destination: 'https://tempo.xyz/blog.md' }),
  ),
  ...blogAliases.flatMap(([sourceSlug, destinationSlug]) =>
    [`/blog/${sourceSlug}`, `/blog/${sourceSlug}.md`, `/assets/md/blog/${sourceSlug}.md`].map(
      (source) => ({
        source,
        destination: source.endsWith('.md')
          ? `https://tempo.xyz/blog/${destinationSlug}.md`
          : `https://tempo.xyz/blog/${destinationSlug}/`,
      }),
    ),
  ),
].flatMap((redirect) => [redirect, { ...redirect, source: `${redirect.source}/` }])
