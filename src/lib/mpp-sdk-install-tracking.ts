/** Classify install intent without collecting arbitrary copied code or shell arguments. */
export function classifyMppSdkInstall(command: string) {
  const match = command.trim().match(/^\$?\s*(npm|pnpm|bun|yarn)\s+(install|i|add)\s+(.+)$/)
  if (!match) return null

  const [, packageManager, action, argumentsText] = match
  if (packageManager === 'yarn' && action !== 'add') return null
  if (packageManager !== 'npm' && action === 'i') return null
  const packages = argumentsText.split(/\s+/)
  if (!packages.some((argument) => /^mppx(?:@[^\s]+)?$/.test(argument))) return null

  return { package_manager: packageManager, sdk_package: 'mppx' }
}

/** Observe Vocs copy-button clicks; this does not confirm clipboard writes or installation. */
export function trackMppSdkInstallCopyClicks(
  document: Document,
  capture: (properties: Record<string, string>) => void,
) {
  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    const button = target.closest(
      'button[aria-label="Copy code"],button[aria-label="Copy command"]',
    )
    const pre = button?.closest('pre')
    if (!button || !pre) return

    const shellLine = button.hasAttribute('data-v-shell-copy') ? button.closest('.line') : null
    const lines = shellLine ? [shellLine] : [...pre.querySelectorAll('.line:not(.diff.remove)')]
    for (const line of lines) {
      const clone = line.cloneNode(true) as Element
      for (const extra of clone.querySelectorAll(
        'button,[data-v-shell-prompt],.twoslash-popup-info-hover,.twoslash-popup-info,.twoslash-meta-line,.twoslash-tag-line',
      )) {
        extra.remove()
      }
      const install = classifyMppSdkInstall(clone.textContent ?? '')
      if (!install) continue
      capture({
        ...install,
        site: 'docs',
        page_path: document.location.pathname,
        install_product: 'mpp_sdk',
        measurement: 'install_intent',
      })
      break
    }
  }

  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}
