import https from 'node:https'
import tls from 'node:tls'

/** Shuffle array in place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i] as T
    arr[i] = arr[j] as T
    arr[j] = temp
  }
  return arr
}

/**
 * Get shuffled cipher list.
 * TLS 1.3 ciphers (first 3) are shuffled separately for security.
 * Other ciphers are shuffled together.
 */
export function getShuffledCiphers(): string {
  const defaultCiphers = tls.DEFAULT_CIPHERS.split(':')

  // TLS 1.3 ciphers (first 3) - safe to shuffle among themselves
  const tls13Ciphers = [...defaultCiphers.slice(0, 3)]
  shuffle(tls13Ciphers)

  // Other ciphers - shuffle for fingerprint variation
  const otherCiphers = [...defaultCiphers.slice(3)]
  shuffle(otherCiphers)

  return [...tls13Ciphers, ...otherCiphers].join(':')
}

/**
 * Create HTTPS agent with shuffled ciphers.
 * This provides partial TLS fingerprint evasion.
 *
 * Note: This won't bypass advanced fingerprinting (JA4+)
 * but helps against basic JA3 detection.
 */
export function createStealthAgent(options?: https.AgentOptions): https.Agent {
  return new https.Agent({
    ...options,
    ciphers: getShuffledCiphers(),
    // Keep connections alive for better performance
    keepAlive: true,
    // Reasonable timeout
    timeout: 30000,
  })
}

/** Get default cipher list (for reference) */
export function getDefaultCiphers(): string[] {
  return tls.DEFAULT_CIPHERS.split(':')
}

/** Check if cipher shuffling is supported */
export function isCipherShufflingSupported(): boolean {
  try {
    const ciphers = tls.DEFAULT_CIPHERS
    return typeof ciphers === 'string' && ciphers.length > 0
  } catch {
    return false
  }
}
