// Base58 (Bitcoin alphabet), used by Solana addresses and Tron's Base58Check addresses.
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function base58Decode(text: string): Uint8Array {
  let n = 0n
  for (const char of text) {
    const digit = alphabet.indexOf(char)
    if (digit < 0) throw new Error(`Invalid base58: ${text}`)
    n = n * 58n + BigInt(digit)
  }
  const bytes: number[] = []
  for (; n > 0n; n /= 256n) bytes.unshift(Number(n % 256n))
  // Each leading "1" stands for a leading zero byte.
  for (let i = 0; i < text.length && text[i] === '1'; i++) bytes.unshift(0)
  return Uint8Array.from(bytes)
}

export function base58Encode(bytes: Uint8Array): string {
  let n = 0n
  for (const byte of bytes) n = n * 256n + BigInt(byte)
  let text = ''
  for (; n > 0n; n /= 58n) text = alphabet[Number(n % 58n)] + text
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) text = `1${text}`
  return text
}
