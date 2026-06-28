export function normalizeRscFetchUrl(url: string, currentHref: string, origin: string) {
  const requestUrl = new URL(url, currentHref)
  if (!requestUrl.pathname.startsWith('/RSC/R/')) return url

  const pathname = requestUrl.pathname
    .replace(/\/RSC\/R\/developers\.txt$/, '/RSC/R/_root.txt')
    .replace(/\/RSC\/R\/developers\//, '/RSC/R/')

  return new URL(pathname + requestUrl.search + requestUrl.hash, origin).toString()
}
