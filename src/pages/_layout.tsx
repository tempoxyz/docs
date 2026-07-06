import type { PropsWithChildren } from 'react'

export const normalizeProxiedRscFetch = `
(() => {
  if (window.__tempoNormalizeProxiedRscFetch) return;
  window.__tempoNormalizeProxiedRscFetch = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
    const requestUrl = new URL(url, window.location.href);
    let rewritten = url;
    if (requestUrl.pathname.startsWith('/RSC/R/')) {
      const pathname = requestUrl.pathname
        .replace(/\\/RSC\\/R\\/developers\\.txt$/, '/RSC/R/_root.txt')
        .replace(/\\/RSC\\/R\\/developers\\//, '/RSC/R/');
      rewritten = new URL(
        pathname + requestUrl.search + requestUrl.hash,
        window.location.origin,
      ).toString();
    }

    if (rewritten === url) return originalFetch(input, init);
    if (typeof input === 'string' || input instanceof URL) return originalFetch(rewritten, init);

    return originalFetch(new Request(rewritten, input), init);
  };
})();
`

export default function Layout(
  props: PropsWithChildren<{
    path: string
    frontmatter?: { interactive?: boolean; mipd?: boolean }
  }>,
) {
  return (
    <>
      <link
        rel="preload"
        href="/fonts/pilat/Pilat-Book.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <meta name="twitter:site" content="@tempo" />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static bootstrap must run before the RSC client bundle. */}
      <script dangerouslySetInnerHTML={{ __html: normalizeProxiedRscFetch }} />
      {props.children}
    </>
  )
}
