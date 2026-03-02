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
