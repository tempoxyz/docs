const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const BECH32M_CONST = 0x2bc830a3
const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

function polymod(values: number[]): number {
  let chk = 1
  for (const v of values) {
    const b = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) {
      chk ^= (b >> i) & 1 ? GEN[i] : 0
    }
  }
  return chk
}

function hrpExpand(hrp: string): number[] {
  const ret: number[] = []
  for (const c of hrp) ret.push(c.charCodeAt(0) >> 5)
  ret.push(0)
  for (const c of hrp) ret.push(c.charCodeAt(0) & 31)
  return ret
}

function verifyChecksum(hrp: string, data: number[]): boolean {
  return polymod([...hrpExpand(hrp), ...data]) === BECH32M_CONST
}

function createChecksum(hrp: string, data: number[]): number[] {
  const values = [...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]
  const mod = polymod(values) ^ BECH32M_CONST
  return Array.from({ length: 6 }, (_, i) => (mod >> (5 * (5 - i))) & 31)
}

function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0
  let bits = 0
  const maxv = (1 << toBits) - 1
  const ret: number[] = []

  for (const value of data) {
    acc = (acc << fromBits) | value
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxv)
    }
  }

  if (pad) {
    if (bits > 0) ret.push((acc << (toBits - bits)) & maxv)
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) !== 0) {
    throw new Error('Invalid padding')
  }

  return ret
}

function bech32mEncode(hrp: string, dataBytes: number[]): string {
  const data5 = convertBits(dataBytes, 8, 5, true)
  const checksum = createChecksum(hrp, data5)
  return hrp + '1' + [...data5, ...checksum].map((d) => CHARSET[d]).join('')
}

function bech32mDecode(addr: string): { hrp: string; data: number[] } {
  if (addr.length > 90) throw new Error('Address exceeds 90 characters')

  for (const c of addr) {
    const code = c.charCodeAt(0)
    if (code < 33 || code > 126) throw new Error('Character outside printable ASCII range')
  }

  const hasLower = /[a-z]/.test(addr)
  const hasUpper = /[A-Z]/.test(addr)
  if (hasLower && hasUpper) throw new Error('Mixed case rejected per BIP-350')

  addr = addr.toLowerCase()
  const pos = addr.lastIndexOf('1')
  if (pos < 1) throw new Error('No separator character found')

  const hrp = addr.slice(0, pos)
  const dataPart = addr.slice(pos + 1)
  if (dataPart.length < 6) throw new Error('Data part too short for checksum')

  const data5 = Array.from(dataPart, (c) => CHARSET.indexOf(c))
  if (data5.some((d) => d === -1)) throw new Error('Invalid character in data part')

  if (!verifyChecksum(hrp, data5)) throw new Error('Invalid checksum — address is corrupted')

  const payload = convertBits(data5.slice(0, -6), 5, 8, false)
  return { hrp, data: payload }
}

const CURRENT_VERSION = 0

export function encodeTempoAddress(hexAddress: string): string {
  const hex = hexAddress.replace(/^0x/i, '')
  if (hex.length !== 40 || !/^[0-9a-fA-F]{40}$/.test(hex))
    throw new Error('Invalid hex address: must be 20 bytes (40 hex chars)')

  const rawBytes = Array.from({ length: 20 }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16))
  const data = [CURRENT_VERSION, ...rawBytes]
  return bech32mEncode('tempo', data)
}

export function decodeTempoAddress(address: string): string {
  const { hrp, data } = bech32mDecode(address)

  if (hrp !== 'tempo') throw new Error(`Invalid HRP: expected "tempo", got "${hrp}"`)
  if (data.length < 1) throw new Error('Address data too short')

  const version = data[0]
  if (version !== CURRENT_VERSION) throw new Error(`Unsupported version: ${version}`)

  const rawAddress = data.slice(1)
  if (rawAddress.length !== 20)
    throw new Error(`Invalid address length: ${rawAddress.length} bytes (expected 20)`)

  return '0x' + rawAddress.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function validateTempoAddress(address: string): { valid: boolean; error?: string } {
  try {
    decodeTempoAddress(address)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export function formatTempoAddress(address: string): string {
  if (address.length < 12) return address
  return `${address.slice(0, 6)} ${address.slice(6).replace(/(.{5})/g, '$1 ')}`.trim()
}

export type CorrectionResult = {
  status: 'valid' | 'corrected' | 'detected' | 'invalid_format'
  corrected?: string
  errors?: { position: number; was: string; correctedTo: string }[]
  candidates?: number
  searchedErrors?: number
  error?: string
}

/**
 * Attempts to correct a corrupted tempo1 address using brute-force BCH
 * decoding. Tries single-error correction first (1,280 candidates), then
 * two-error correction (~800K candidates). Returns the unique valid address
 * if one is found, or reports detection-only if correction is ambiguous or
 * the search space is exceeded.
 */
export function correctTempoAddress(address: string): CorrectionResult {
  const addr = address.toLowerCase()

  if (addr.length > 90)
    return { status: 'invalid_format', error: 'Address exceeds 90 characters' }
  if (/[A-Z]/.test(address) && /[a-z]/.test(address))
    return { status: 'invalid_format', error: 'Mixed case rejected per BIP-350' }

  const pos = addr.lastIndexOf('1')
  if (pos < 1) return { status: 'invalid_format', error: 'No separator found' }

  const hrp = addr.slice(0, pos)
  const dataPart = addr.slice(pos + 1)
  if (dataPart.length < 6)
    return { status: 'invalid_format', error: 'Data part too short' }

  const data5 = Array.from(dataPart, (c) => CHARSET.indexOf(c))
  if (data5.some((d) => d === -1))
    return { status: 'invalid_format', error: 'Invalid character in data part' }

  const expanded = hrpExpand(hrp)

  if (polymod([...expanded, ...data5]) === BECH32M_CONST) {
    try {
      decodeTempoAddress(address)
      return { status: 'valid' }
    } catch (e) {
      return { status: 'invalid_format', error: e instanceof Error ? e.message : 'Invalid' }
    }
  }

  // 1-error correction: try each position × each of 32 characters
  const dataLen = dataPart.length
  const found: { addr: string; errors: { position: number; was: string; correctedTo: string }[] }[] = []

  for (let i = 0; i < dataLen; i++) {
    const original = data5[i]
    for (let c = 0; c < 32; c++) {
      if (c === original) continue
      data5[i] = c
      if (polymod([...expanded, ...data5]) === BECH32M_CONST) {
        const fixed = addr.slice(0, pos + 1 + i) + CHARSET[c] + addr.slice(pos + 1 + i + 1)
        try {
          decodeTempoAddress(fixed)
          found.push({
            addr: fixed,
            errors: [{ position: pos + 1 + i, was: CHARSET[original], correctedTo: CHARSET[c] }],
          })
        } catch {
          // valid checksum but fails higher-level validation (e.g. wrong version)
        }
      }
      data5[i] = original
    }
  }

  if (found.length === 1) {
    return {
      status: 'corrected',
      corrected: found[0].addr,
      errors: found[0].errors,
      candidates: 1,
      searchedErrors: 1,
    }
  }
  if (found.length > 1) {
    return {
      status: 'detected',
      candidates: found.length,
      searchedErrors: 1,
      error: `${found.length} candidates found — correction is ambiguous`,
    }
  }

  // 2-error correction: try each pair of positions × each pair of characters
  for (let i = 0; i < dataLen; i++) {
    const origI = data5[i]
    for (let j = i + 1; j < dataLen; j++) {
      const origJ = data5[j]
      for (let ci = 0; ci < 32; ci++) {
        if (ci === origI) continue
        data5[i] = ci
        for (let cj = 0; cj < 32; cj++) {
          if (cj === origJ) continue
          data5[j] = cj
          if (polymod([...expanded, ...data5]) === BECH32M_CONST) {
            const fixed =
              addr.slice(0, pos + 1 + i) +
              CHARSET[ci] +
              addr.slice(pos + 1 + i + 1, pos + 1 + j) +
              CHARSET[cj] +
              addr.slice(pos + 1 + j + 1)
            try {
              decodeTempoAddress(fixed)
              found.push({
                addr: fixed,
                errors: [
                  { position: pos + 1 + i, was: CHARSET[origI], correctedTo: CHARSET[ci] },
                  { position: pos + 1 + j, was: CHARSET[origJ], correctedTo: CHARSET[cj] },
                ],
              })
            } catch {
              // valid checksum but fails higher-level validation
            }
          }
          data5[j] = origJ
        }
        data5[i] = origI
      }
    }
    if (found.length > 5) break // early exit if ambiguous
  }

  if (found.length === 1) {
    return {
      status: 'corrected',
      corrected: found[0].addr,
      errors: found[0].errors,
      candidates: 1,
      searchedErrors: 2,
    }
  }
  if (found.length > 1) {
    return {
      status: 'detected',
      candidates: found.length,
      searchedErrors: 2,
      error: `${found.length} candidates found — correction is ambiguous`,
    }
  }

  return {
    status: 'detected',
    searchedErrors: 2,
    error: 'More than 2 errors — detected but cannot correct',
  }
}
