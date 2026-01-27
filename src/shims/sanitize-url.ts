const blankUrl = 'about:blank'
const invalidProtocolRegex = /^(?:javascript|data|vbscript):/i
const urlSchemeRegex = /^[a-zA-Z][a-zA-Z\d+.-]*:/
const relativeFirstCharacters = ['.', '/', '#', '?']

const sanitizeUrl = (url?: string): string => {
  if (!url) {
    return blankUrl
  }

  const trimmed = url.trim()
  if (!trimmed) {
    return blankUrl
  }

  if (relativeFirstCharacters.includes(trimmed[0] ?? '')) {
    return trimmed
  }

  const schemeMatch = trimmed.match(urlSchemeRegex)
  if (!schemeMatch) {
    return trimmed
  }

  const scheme = schemeMatch[0].toLowerCase().trim()
  if (invalidProtocolRegex.test(scheme)) {
    return blankUrl
  }

  if (scheme === 'http:' || scheme === 'https:' || scheme === 'mailto:') {
    if (scheme !== 'mailto:' && typeof URL?.canParse === 'function' && !URL.canParse(trimmed)) {
      return blankUrl
    }
    return trimmed
  }

  return trimmed
}

export { sanitizeUrl }
