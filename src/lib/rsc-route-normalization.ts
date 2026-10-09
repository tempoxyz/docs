export function normalizeRscFetchUrl(url: string, currentHref: string, origin: string) {
  const requestUrl = new URL(url, currentHref)
  if (!requestUrl.pathname.startsWith('/RSC/R/')) return url

  const pathname = requestUrl.pathname
    .replace(/\/RSC\/R\/developers\.txt$/, '/RSC/R/_root.txt')
    .replace(/\/RSC\/R\/developers\//, '/RSC/R/')

  return new URL(pathname + requestUrl.search + requestUrl.hash, origin).toString()
}

// Static bootstrap executes before the RSC client initializes.
export const normalizeProxiedRscFetch = `
(() => {
  if (
    window.location.hostname === 'tempo.xyz' &&
    window.location.pathname === '/developers'
  ) {
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + '/' + window.location.search + window.location.hash,
    );
  }

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
