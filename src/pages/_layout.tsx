import type { PropsWithChildren } from 'react'

const normalizeProxiedRscFetch = `
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
    const rewritten = url
      .replace(/\\/RSC\\/R\\/developers\\.txt(?=($|\\?))/, '/RSC/R/%2F.txt')
      .replace(/\\/RSC\\/R\\/developers\\//, '/RSC/R/');

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
      <script dangerouslySetInnerHTML={{ __html: normalizeProxiedRscFetch }} />
      {props.children}
    </>
  )
}
