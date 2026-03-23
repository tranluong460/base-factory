import type { ClientProfile } from 'tlsclientwrapper'
import type { FingerprintPreset, IBrandEntry, ITlsProfileConfig } from '../core/types'

// ─── Template Placeholders ─────────────────────────────────────
// Used in uaTemplate strings, replaced at profile generation time via .replaceAll()
export const TPL_VERSION = '{{VERSION}}'
export const TPL_MAJOR = '{{MAJOR}}'
export const TPL_IOS_VERSION = '{{IOS_VERSION}}'

// ─── Chromium GREASE Brand Algorithm ───────────────────────────
// Source: chromium/components/embedder_support/user_agent_utils.cc

const GREASE_CHARS = [' ', '(', ':', '-', '.', '/', ')', ';', '=', '?', '_'] as const
const GREASE_VERSIONS = ['8', '99', '24'] as const
const BRAND_PERMUTATIONS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
] as const

/**
 * Generate GREASE brand entries matching exact Chromium algorithm.
 * Each Chrome version produces a unique GREASE brand string, version, and ordering.
 */
export function generateChromeGreaseBrands(
  majorVersion: number,
  browserBrand: string,
): IBrandEntry[] {
  const greaseChar1 = GREASE_CHARS[majorVersion % 11]!
  const greaseChar2 = GREASE_CHARS[(majorVersion + 1) % 11]!
  const greaseBrand = `Not${greaseChar1}A${greaseChar2}Brand`
  const greaseVersion = GREASE_VERSIONS[majorVersion % 3]!

  const original: IBrandEntry[] = [
    { brand: greaseBrand, version: greaseVersion },
    { brand: 'Chromium', version: String(majorVersion) },
    { brand: browserBrand, version: String(majorVersion) },
  ]

  // Permute brand order based on version
  const order = BRAND_PERMUTATIONS[majorVersion % 6]!
  const shuffled: IBrandEntry[] = Array.from({ length: 3 }) as IBrandEntry[]
  for (let i = 0; i < 3; i++) {
    shuffled[order[i]!] = original[i]!
  }

  return shuffled
}

// ─── Preset Map ────────────────────────────────────────────────

/**
 * Maps FingerprintPreset → TLS profile config with browser-specific metadata.
 * Brands are now generated dynamically via generateChromeGreaseBrands() —
 * the `brands` field is kept empty and populated at profile generation time.
 */
export const PRESET_MAP: Record<FingerprintPreset, ITlsProfileConfig> = {
  CHROME_WINDOWS: {
    identifiers: ['chrome_131', 'chrome_133', 'chrome_144', 'chrome_146'] as ClientProfile[],
    os: 'Windows NT 10.0; Win64; x64',
    platform: 'Win32',
    platformVersion: '15.0.0',
    secChUaPlatform: '"Windows"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{{VERSION}}.0.0.0 Safari/537.36',
    brands: [], // Dynamic — generated per version
  },

  CHROME_MACOS: {
    identifiers: ['chrome_131', 'chrome_133', 'chrome_144', 'chrome_146'] as ClientProfile[],
    os: 'Macintosh; Intel Mac OS X 10_15_7',
    platform: 'macOS',
    platformVersion: '14.7.1',
    secChUaPlatform: '"macOS"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{{VERSION}}.0.0.0 Safari/537.36',
    brands: [],
  },

  CHROME_LINUX: {
    identifiers: ['chrome_131', 'chrome_133', 'chrome_144', 'chrome_146'] as ClientProfile[],
    os: 'X11; Linux x86_64',
    platform: 'Linux',
    platformVersion: '6.5.0',
    secChUaPlatform: '"Linux"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{{VERSION}}.0.0.0 Safari/537.36',
    brands: [],
  },

  FIREFOX_WINDOWS: {
    identifiers: ['firefox_133', 'firefox_135', 'firefox_147'] as ClientProfile[],
    os: 'Windows NT 10.0; Win64; x64',
    platform: 'Win32',
    platformVersion: '10.0',
    secChUaPlatform: '"Windows"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:{{VERSION}}.0) Gecko/20100101 Firefox/{{VERSION}}.0',
    brands: [],
  },

  FIREFOX_MACOS: {
    identifiers: ['firefox_133', 'firefox_135', 'firefox_147'] as ClientProfile[],
    os: 'Macintosh; Intel Mac OS X 10.15',
    platform: 'MacIntel',
    platformVersion: '10.15',
    secChUaPlatform: '"macOS"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:{{VERSION}}.0) Gecko/20100101 Firefox/{{VERSION}}.0',
    brands: [],
  },

  FIREFOX_LINUX: {
    identifiers: ['firefox_133', 'firefox_135', 'firefox_147'] as ClientProfile[],
    os: 'X11; Linux x86_64',
    platform: 'Linux x86_64',
    platformVersion: '6.5.0',
    secChUaPlatform: '"Linux"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (X11; Linux x86_64; rv:{{VERSION}}.0) Gecko/20100101 Firefox/{{VERSION}}.0',
    brands: [],
  },

  SAFARI_MACOS: {
    identifiers: ['safari_15_6_1', 'safari_16_0'] as ClientProfile[],
    os: 'Macintosh; Intel Mac OS X 10_15_7',
    platform: 'MacIntel',
    platformVersion: '10_15_7',
    secChUaPlatform: '"macOS"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{{VERSION}} Safari/605.1.15',
    brands: [],
  },

  SAFARI_IOS: {
    identifiers: [
      'safari_ios_17_0',
      'safari_ios_18_0',
      'safari_ios_18_5',
      'safari_ios_26_0',
    ] as ClientProfile[],
    os: 'iPhone; CPU iPhone OS {{IOS_VERSION}} like Mac OS X',
    platform: 'iPhone',
    platformVersion: '{{IOS_VERSION}}',
    secChUaPlatform: '"iOS"',
    mobile: true,
    uaTemplate:
      'Mozilla/5.0 (iPhone; CPU iPhone OS {{IOS_VERSION}} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{{VERSION}} Mobile/15E148 Safari/604.1',
    brands: [],
  },

  EDGE_WINDOWS: {
    identifiers: ['chrome_144', 'chrome_146'] as ClientProfile[],
    os: 'Windows NT 10.0; Win64; x64',
    platform: 'Win32',
    platformVersion: '15.0.0',
    secChUaPlatform: '"Windows"',
    mobile: false,
    uaTemplate:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{{VERSION}}.0.0.0 Safari/537.36 Edg/{{VERSION}}.0.0.0',
    brands: [], // Dynamic — uses 'Microsoft Edge' brand
  },

  CHROME_ANDROID: {
    identifiers: ['chrome_131', 'chrome_133', 'chrome_144', 'chrome_146'] as ClientProfile[],
    os: 'Linux; Android 14; Pixel 8',
    platform: 'Linux armv8l',
    platformVersion: '14.0.0',
    secChUaPlatform: '"Android"',
    mobile: true,
    uaTemplate:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{{VERSION}}.0.0.0 Mobile Safari/537.36',
    brands: [],
  },
}

// ─── Version Helpers ───────────────────────────────────────────

/** Extract major version number from a tls-client identifier (e.g. 'chrome_146' → 146) */
export function extractMajorVersion(identifier: ClientProfile): number {
  const match = /(\d+)/.exec(identifier)
  return match ? Number(match[1]) : 100
}

const SAFARI_IOS_VERSION_MAP: Record<string, string> = {
  safari_ios_15_5: '15_5',
  safari_ios_15_6: '15_6',
  safari_ios_16_0: '16_0',
  safari_ios_17_0: '17_0',
  safari_ios_18_0: '18_0',
  safari_ios_18_5: '18_5',
  safari_ios_26_0: '26_0',
}

export function getIOSVersion(identifier: ClientProfile): string {
  return SAFARI_IOS_VERSION_MAP[identifier] ?? '18_0'
}

const SAFARI_MACOS_VERSION_MAP: Record<string, string> = {
  safari_15_6_1: '15.6.1',
  safari_16_0: '16.0',
}

export function getSafariVersion(identifier: ClientProfile): string {
  return SAFARI_MACOS_VERSION_MAP[identifier] ?? '16.0'
}

/** Get the browser brand name for a preset (used in GREASE brand generation) */
export function getBrowserBrand(preset: FingerprintPreset): string {
  if (preset === 'EDGE_WINDOWS') {
    return 'Microsoft Edge'
  }
  return 'Google Chrome'
}
