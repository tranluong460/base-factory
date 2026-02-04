import { createHash } from 'node:crypto'
import type {
  BrowserHeaders,
  BrowserInfo,
  BrowserName,
  FingerprintConfig,
  FingerprintPreset,
  MobileDeviceBrand,
  OperatingSystem,
} from '../types'
import { getRandomAndroidVersion, getRandomDevice, getRandomIOSVersion } from './devices'
import { getPreset } from './presets'

// ==================== Seeded Random Utilities ====================

/**
 * Create a seeded random number generator.
 * Uses SHA-256 hash for deterministic pseudo-random numbers.
 */
function createSeededRandom(seed: string) {
  let hashIndex = 0
  const hash = createHash('sha256').update(seed).digest('hex')

  return {
    /** Get next random float [0, 1) */
    next(): number {
      // Use 8 hex chars (32 bits) for each random number
      const segment = hash.slice(hashIndex * 8, (hashIndex + 1) * 8)
      hashIndex = (hashIndex + 1) % 8 // Cycle through 8 segments
      return Number.parseInt(segment, 16) / 0xFFFFFFFF
    },
    /** Random integer in range [min, max] */
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min
    },
    /** Random item from array */
    item<T>(arr: readonly T[] | T[]): T {
      return arr[Math.floor(this.next() * arr.length)]
    },
  }
}

/** Global random state for non-seeded operations */
const globalRandom = {
  next: () => Math.random(),
  int: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  item: <T>(arr: readonly T[] | T[]): T => arr[Math.floor(Math.random() * arr.length)],
}

/** Get random generator (seeded or global) */
function getRandom(seed?: string) {
  return seed ? createSeededRandom(seed) : globalRandom
}

/** Build User-Agent string */
function buildUserAgent(info: BrowserInfo, random = globalRandom): string {
  const { name, version, os, mobile } = info

  // Chrome/Edge on Windows
  if ((name === 'chrome' || name === 'edge') && os === 'windows') {
    const edgeStr = name === 'edge' ? ` Edg/${version}.0.0.0` : ''
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36${edgeStr}`
  }

  // Chrome on macOS
  if (name === 'chrome' && os === 'macos') {
    return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`
  }

  // Chrome on Linux
  if (name === 'chrome' && os === 'linux') {
    return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`
  }

  // Chrome on Android - use device's Android version if available
  if (name === 'chrome' && os === 'android' && mobile) {
    const androidVer = mobile.osVersions?.[0] || getRandomAndroidVersion(mobile)
    return `Mozilla/5.0 (Linux; Android ${androidVer}; ${mobile.modelCode}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Mobile Safari/537.36`
  }

  // Chrome on iOS - use device's iOS version if available
  if (name === 'chrome' && os === 'ios' && mobile) {
    const iosVer = (mobile.osVersions?.[0] || getRandomIOSVersion(mobile)).replace('.', '_')
    return `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVer} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${version}.0.0.0 Mobile/15E148 Safari/604.1`
  }

  // Chrome on iOS (no device info)
  if (name === 'chrome' && os === 'ios') {
    const iosVer = random.item(['17_0', '17_5', '18_0', '18_2'])
    return `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVer} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${version}.0.0.0 Mobile/15E148 Safari/604.1`
  }

  // Firefox on Windows
  if (name === 'firefox' && os === 'windows') {
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`
  }

  // Firefox on macOS
  if (name === 'firefox' && os === 'macos') {
    return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`
  }

  // Firefox on Linux
  if (name === 'firefox' && os === 'linux') {
    return `Mozilla/5.0 (X11; Linux x86_64; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`
  }

  // Firefox on Android - use device's Android version if available
  if (name === 'firefox' && os === 'android' && mobile) {
    const androidVer = mobile.osVersions?.[0] || getRandomAndroidVersion(mobile)
    return `Mozilla/5.0 (Android ${androidVer}; Mobile; rv:${version}.0) Gecko/${version}.0 Firefox/${version}.0`
  }

  // Firefox on Android (no device info)
  if (name === 'firefox' && os === 'android') {
    const androidVer = random.item(['13', '14', '15'])
    return `Mozilla/5.0 (Android ${androidVer}; Mobile; rv:${version}.0) Gecko/${version}.0 Firefox/${version}.0`
  }

  // Safari on macOS
  if (name === 'safari' && os === 'macos') {
    return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0 Safari/605.1.15`
  }

  // Safari on iOS (iPhone) - use device's iOS version if available
  if (name === 'safari' && os === 'ios' && mobile?.brand === 'iphone') {
    const iosVer = (mobile.osVersions?.[0] || getRandomIOSVersion(mobile)).replace('.', '_')
    return `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVer} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0 Mobile/15E148 Safari/604.1`
  }

  // Safari on iOS (iPad) - use device's iOS version if available
  if (name === 'safari' && os === 'ios' && mobile?.brand === 'ipad') {
    const iosVer = (mobile.osVersions?.[0] || getRandomIOSVersion(mobile)).replace('.', '_')
    return `Mozilla/5.0 (iPad; CPU OS ${iosVer} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0 Mobile/15E148 Safari/604.1`
  }

  // Default fallback
  return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`
}

/** Build sec-ch-ua header */
function buildSecChUa(browser: BrowserName, version: number, random = globalRandom): string {
  const notABrands = ['"Not_A Brand"', '"Not A(Brand"', '"Not/A)Brand"', '"Not)A;Brand"']
  const notABrand = random.item(notABrands)

  if (browser === 'chrome') {
    return `${notABrand};v="8", "Chromium";v="${version}", "Google Chrome";v="${version}"`
  }
  if (browser === 'edge') {
    return `${notABrand};v="8", "Chromium";v="${version}", "Microsoft Edge";v="${version}"`
  }
  // Firefox and Safari don't send sec-ch-ua
  return ''
}

/** Get platform string for sec-ch-ua-platform */
function getPlatformString(os: OperatingSystem): string {
  const platforms: Record<OperatingSystem, string> = {
    windows: '"Windows"',
    macos: '"macOS"',
    linux: '"Linux"',
    android: '"Android"',
    ios: '"iOS"',
  }
  return platforms[os]
}

/** Generate headers from browser info */
function generateHeadersFromInfo(info: BrowserInfo, random = globalRandom): BrowserHeaders {
  const { name, version, os, device } = info
  const userAgent = buildUserAgent(info, random)

  // Base headers for all browsers
  const headers: BrowserHeaders = {
    'user-agent': userAgent,
    'accept':
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'connection': 'keep-alive',
    'upgrade-insecure-requests': '1',
  }

  // Chrome/Edge specific headers (essential sec-ch-ua only)
  if (name === 'chrome' || name === 'edge') {
    const secChUa = buildSecChUa(name, version, random)
    if (secChUa) {
      headers['sec-ch-ua'] = secChUa
      headers['sec-ch-ua-mobile'] = device === 'mobile' ? '?1' : '?0'
      headers['sec-ch-ua-platform'] = getPlatformString(os)
      // Note: Advanced headers (full-version-list, platform-version, arch, etc.)
      // are NOT included. Use client.setHeaders() if server requires them.
    }

    // Sec-Fetch headers
    headers['sec-fetch-dest'] = 'document'
    headers['sec-fetch-mode'] = 'navigate'
    headers['sec-fetch-site'] = 'none'
    headers['sec-fetch-user'] = '?1'
  }

  // Firefox specific
  if (name === 'firefox') {
    headers.dnt = '1'
    // Firefox uses different accept header
    headers.accept
      = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
  }

  // Safari specific
  if (name === 'safari') {
    // Safari has simpler accept header
    headers.accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }

  return headers
}

/**
 * Generate headers from preset
 * @param preset - Fingerprint preset name
 * @param seed - Optional seed for consistent fingerprint
 */
export function generateFromPreset(preset: FingerprintPreset, seed?: string): BrowserHeaders {
  const random = getRandom(seed)
  const data = getPreset(preset)
  const version = random.int(data.minVersion, data.maxVersion)

  let mobile
  if (data.mobile && data.mobile.brands.length > 0) {
    const brand = random.item(data.mobile.brands)
    mobile = getRandomDevice(brand, seed)
  }

  const info: BrowserInfo = {
    name: data.browser,
    version,
    os: data.os,
    device: data.device,
    mobile,
  }

  return generateHeadersFromInfo(info, random)
}

/**
 * Generate headers from config
 * @param config - Fingerprint configuration
 */
export function generateHeaders(config: FingerprintConfig): BrowserHeaders {
  const seed = config.seed
  const random = getRandom(seed)

  // Use preset if specified
  if (config.preset) {
    return generateFromPreset(config.preset, seed)
  }

  // Build from config options
  const browsers = config.browsers || ['chrome']
  const oses = config.operatingSystems || ['windows']
  const devices = config.devices || ['desktop']

  // Pick random options (seeded if seed provided)
  const browserSpec = random.item(browsers)
  const browser: BrowserName = typeof browserSpec === 'string' ? browserSpec : browserSpec.name
  const minVer = typeof browserSpec === 'object' ? browserSpec.minVersion || 120 : 120
  const maxVer = typeof browserSpec === 'object' ? browserSpec.maxVersion || 125 : 125

  const os = random.item(oses)
  const device = random.item(devices)

  let mobile
  if (device === 'mobile' && config.mobileDevices && config.mobileDevices.length > 0) {
    const brand = random.item(config.mobileDevices)
    mobile = getRandomDevice(brand, seed)
  } else if (device === 'mobile' && (os === 'android' || os === 'ios')) {
    // Default mobile device based on OS
    const defaultBrand: MobileDeviceBrand = os === 'ios' ? 'iphone' : 'samsung'
    mobile = getRandomDevice(defaultBrand, seed)
  }

  const info: BrowserInfo = {
    name: browser,
    version: random.int(minVer, maxVer),
    os,
    device,
    mobile,
  }

  return generateHeadersFromInfo(info, random)
}

/**
 * Create a header generator instance for multiple generations
 * @param config - Fingerprint configuration
 */
export function createHeaderGenerator(config: FingerprintConfig) {
  return {
    /** Generate headers (uses seed from config if provided) */
    generate: () => generateHeaders(config),
    /** Generate headers from preset (uses seed from config if provided) */
    generateFromPreset: (preset: FingerprintPreset) => generateFromPreset(preset, config.seed),
  }
}
