import { createHash } from 'node:crypto'
import type {
  BrowserHeaders,
  BrowserName,
  FingerprintConfig,
  FingerprintPreset,
  OperatingSystem,
} from '../types'
import { getChromePatch, getGreaseBrand, getPreset } from './presets'

// ==================== Random Utilities ====================

interface Random {
  int: (min: number, max: number) => number
  item: <T>(arr: readonly T[]) => T | undefined
}

function createRandom(seed?: string): Random {
  if (!seed) {
    return {
      int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
      item: (arr) => arr[Math.floor(Math.random() * arr.length)],
    }
  }
  const hash = createHash('sha256').update(seed).digest('hex')
  let idx = 0
  const next = () => {
    const val = Number.parseInt(hash.slice(idx * 8, (idx + 1) * 8), 16) / 0xFFFFFFFF
    idx = (idx + 1) % 8
    return val
  }
  return {
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    item: (arr) => arr[Math.floor(next() * arr.length)],
  }
}

// ==================== User-Agent Builders ====================

const UA = {
  chrome: (v: number, os: OperatingSystem) => {
    const ver = `${v}.0.0.0`
    const base: Record<OperatingSystem, string> = {
      windows: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver} Safari/537.36`,
      macos: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver} Safari/537.36`,
      linux: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver} Safari/537.36`,
      android: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver} Mobile Safari/537.36`,
      ios: `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${ver} Mobile/15E148 Safari/604.1`,
    }
    return base[os]
  },
  edge: (v: number) =>
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v}.0.0.0 Safari/537.36 Edg/${v}.0.0.0`,
  firefox: (v: number, os: OperatingSystem) => {
    const base: Record<OperatingSystem, string> = {
      windows: `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${v}.0) Gecko/20100101 Firefox/${v}.0`,
      macos: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:${v}.0) Gecko/20100101 Firefox/${v}.0`,
      linux: `Mozilla/5.0 (X11; Linux x86_64; rv:${v}.0) Gecko/20100101 Firefox/${v}.0`,
      android: `Mozilla/5.0 (Android 14; Mobile; rv:${v}.0) Gecko/${v}.0 Firefox/${v}.0`,
      ios: `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/${v}.0 Mobile/15E148 Safari/605.1.15`,
    }
    return base[os]
  },
  safari: (v: number, os: OperatingSystem) => {
    if (os === 'ios') {
      return `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${v}.0 Mobile/15E148 Safari/604.1`
    }
    return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${v}.0 Safari/605.1.15`
  },
}

function buildUserAgent(browser: BrowserName, version: number, os: OperatingSystem): string {
  switch (browser) {
    case 'chrome':
      return UA.chrome(version, os)
    case 'edge':
      return UA.edge(version)
    case 'firefox':
      return UA.firefox(version, os)
    case 'safari':
      return UA.safari(version, os)
  }
}

// ==================== Header Builders ====================

const PLATFORM: Record<OperatingSystem, string> = {
  windows: '"Windows"',
  macos: '"macOS"',
  linux: '"Linux"',
  android: '"Android"',
  ios: '"iOS"',
}

function buildAcceptLanguage(locales?: string[]): string {
  if (!locales?.length) {
    return 'en-US,en;q=0.9'
  }
  return locales.map((l, i) => (i === 0 ? l : `${l};q=${(1 - i * 0.1).toFixed(1)}`)).join(',')
}

// ==================== Header Ordering ====================

/**
 * Chrome header order (based on real Chrome traffic analysis)
 * Order matters for fingerprinting detection
 */
const CHROME_HEADER_ORDER = [
  'host',
  'connection',
  'sec-ch-ua',
  'sec-ch-ua-mobile',
  'sec-ch-ua-platform',
  'upgrade-insecure-requests',
  'user-agent',
  'accept',
  'sec-fetch-site',
  'sec-fetch-mode',
  'sec-fetch-user',
  'sec-fetch-dest',
  'accept-encoding',
  'accept-language',
  'priority',
] as const

/**
 * Firefox header order
 */
const FIREFOX_HEADER_ORDER = [
  'host',
  'user-agent',
  'accept',
  'accept-language',
  'accept-encoding',
  'dnt',
  'connection',
  'upgrade-insecure-requests',
  'sec-fetch-dest',
  'sec-fetch-mode',
  'sec-fetch-site',
  'sec-fetch-user',
  'priority',
] as const

/**
 * Safari header order
 */
const SAFARI_HEADER_ORDER = [
  'host',
  'accept',
  'accept-language',
  'accept-encoding',
  'connection',
  'user-agent',
] as const

/**
 * Order headers according to browser-specific order
 */
function orderHeaders(
  headers: Record<string, string | undefined>,
  order: readonly string[],
): BrowserHeaders {
  const result: Record<string, string> = {}

  // Add headers in specified order
  for (const key of order) {
    if (headers[key] !== undefined) {
      result[key] = headers[key]
    }
  }

  // Add remaining headers not in order list
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && !(key in result)) {
      result[key] = value
    }
  }

  return result as BrowserHeaders
}

// ==================== Main Generator ====================

/**
 * Generate browser headers from preset
 */
export function generateHeaders(config: FingerprintConfig): BrowserHeaders {
  const { preset = 'CHROME_WINDOWS', seed, locales } = config
  const data = getPreset(preset)
  const random = createRandom(seed)
  const version = random.int(data.version.min, data.version.max)
  const { browser, os, device } = data

  const headers: Record<string, string | undefined> = {}

  // Common headers
  headers['user-agent'] = buildUserAgent(browser, version, os)
  headers['accept-language'] = buildAcceptLanguage(locales)
  headers.connection = 'keep-alive'
  headers['upgrade-insecure-requests'] = '1'

  // Browser-specific headers
  if (browser === 'chrome' || browser === 'edge') {
    const brand = getGreaseBrand(version)
    const browserName = browser === 'chrome' ? 'Google Chrome' : 'Microsoft Edge'
    const patch = getChromePatch(version, seed)

    // Low entropy hints (sent by default)
    headers['sec-ch-ua']
      = `${brand};v="8", "Chromium";v="${version}", "${browserName}";v="${version}"`
    headers['sec-ch-ua-mobile'] = device === 'mobile' ? '?1' : '?0'
    headers['sec-ch-ua-platform'] = PLATFORM[os]

    // Accept header for Chrome
    headers.accept
      = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'

    // Accept-Encoding with zstd support (Chrome 123+)
    headers['accept-encoding'] = 'gzip, deflate, br, zstd'

    // Sec-Fetch headers
    headers['sec-fetch-dest'] = 'document'
    headers['sec-fetch-mode'] = 'navigate'
    headers['sec-fetch-site'] = 'none'
    headers['sec-fetch-user'] = '?1'

    // Priority header (Chrome 124+)
    // u=0: highest urgency (document), u=1: high (CSS), u=2: normal (scripts)
    // i: incremental
    headers.priority = 'u=0, i'

    // High entropy hint - only include if needed (sec-ch-ua-full-version-list)
    // Note: This is only sent when server requests via Accept-CH header
    // We include it for completeness, but real Chrome only sends on 2nd request
    headers['sec-ch-ua-full-version-list']
      = `${brand};v="8.0.0.0", "Chromium";v="${patch}", "${browserName}";v="${patch}"`

    return orderHeaders(headers, CHROME_HEADER_ORDER)
  }

  if (browser === 'firefox') {
    headers.accept
      = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8'
    headers['accept-encoding'] = 'gzip, deflate, br, zstd'
    headers.dnt = '1'

    // Firefox sec-fetch headers
    headers['sec-fetch-dest'] = 'document'
    headers['sec-fetch-mode'] = 'navigate'
    headers['sec-fetch-site'] = 'none'
    headers['sec-fetch-user'] = '?1'

    // Firefox priority header
    headers.priority = 'u=0, i'

    return orderHeaders(headers, FIREFOX_HEADER_ORDER)
  }

  if (browser === 'safari') {
    headers.accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    headers['accept-encoding'] = 'gzip, deflate, br'
    // Safari doesn't send sec-fetch or priority headers by default

    return orderHeaders(headers, SAFARI_HEADER_ORDER)
  }

  // Fallback
  headers.accept
    = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
  headers['accept-encoding'] = 'gzip, deflate, br'

  return headers as BrowserHeaders
}

/**
 * Shorthand to generate from preset name
 */
export function generateFromPreset(
  preset: FingerprintPreset,
  seed?: string,
  locales?: string[],
): BrowserHeaders {
  return generateHeaders({ preset, seed, locales })
}
