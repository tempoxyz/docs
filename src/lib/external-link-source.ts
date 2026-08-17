const markdownDestination = /(\]\()<?(?:\/|#|\.\.?\/)[^\s)>]+>?/g
const markdownDefinition = /(^\s*\[[^\]]+\]:\s*<?)(?:\/|#|\.\.?\/)[^\s>]+>?/gm
const jsxAttribute = /(\b(?:href|src|to)\s*=\s*["'])(?:\/|#|\.\.?\/)[^"']*(["'])/g
const autolink = /<(?:\/(?:docs|developers)(?:\/[^>\s]*)?|#[^>\s]*|\.\.?\/[^>\s]*)>/g

export function externalLinkSource(source: string): string {
  return source
    .replace(markdownDestination, '$1#')
    .replace(markdownDefinition, '$1#')
    .replace(jsxAttribute, '$1#$2')
    .replace(autolink, '<#>')
}
