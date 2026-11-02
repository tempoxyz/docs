/** The reader's own device, for naming the passkeys and keys they create. */
export type ThisDevice = {
  /** Such as `Mac` or `iPhone`. */
  name: string
  /** How a passkey on it unlocks, such as `Touch ID`. */
  unlock: string
}

export function thisDevice(): ThisDevice {
  if (typeof navigator === 'undefined') return { name: 'device', unlock: 'passkey' }
  const { userAgent, maxTouchPoints } = navigator
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    ''
  if (/iPhone/.test(userAgent)) return { name: 'iPhone', unlock: 'Face ID' }
  // iPadOS reports a Mac user agent, but a Mac has no touch points.
  if (/iPad/.test(userAgent) || (/Mac/.test(platform) && maxTouchPoints > 1))
    return { name: 'iPad', unlock: 'Touch ID' }
  if (/Mac/.test(platform) || /Macintosh/.test(userAgent))
    return { name: 'Mac', unlock: 'Touch ID' }
  if (/Android/.test(userAgent)) return { name: 'Android phone', unlock: 'fingerprint' }
  if (/Win/.test(platform)) return { name: 'Windows PC', unlock: 'Windows Hello' }
  if (/Linux|CrOS/.test(platform)) return { name: 'computer', unlock: 'passkey' }
  return { name: 'device', unlock: 'passkey' }
}

/** A passkey's detail line on the reader's device, such as `WebAuthn · Touch ID · this Mac`. */
export function thisDevicePasskey() {
  const { name, unlock } = thisDevice()
  return { subject: `this ${name}`, detail: `WebAuthn · ${unlock} · this ${name}` }
}
