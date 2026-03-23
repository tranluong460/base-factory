import type { ClientProfile } from 'tlsclientwrapper'
import type { FingerprintPreset, IBrowserProfile } from '../core/types'
import { generateBrowserHeaders } from './header-generator'
import {
  PRESET_MAP,
  TPL_IOS_VERSION,
  TPL_MAJOR,
  TPL_VERSION,
  extractMajorVersion,
  getIOSVersion,
  getSafariVersion,
} from './presets'

/**
 * Create a seeded PRNG using a simple hash-based approach.
 * Same seed always produces the same sequence of numbers.
 */
export function createSeededRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }

  return () => {
    h = (Math.imul(h ^ (h >>> 16), 0x45D9F3B) + 0x1234567) | 0
    h = (Math.imul(h ^ (h >>> 16), 0x45D9F3B) + 0x89ABCDE) | 0
    h ^= h >>> 16
    return (h >>> 0) / 0x100000000
  }
}

/** Pick a deterministic element from an array using seeded random */
function seededPick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]!
}

/**
 * Generate a deterministic browser profile from a seed + preset.
 * Same seed + preset = same profile every time (consistent identity).
 */
export function generateProfile(
  seed: string,
  preset: FingerprintPreset,
  locales?: string[],
): IBrowserProfile {
  const config = PRESET_MAP[preset]
  const rng = createSeededRandom(seed)

  const identifier = seededPick(config.identifiers, rng) as ClientProfile
  const majorVersion = extractMajorVersion(identifier)

  // Safari needs special version handling
  let resolvedVersion = String(majorVersion)
  let resolvedOs = config.os

  if (preset === 'SAFARI_IOS') {
    const iosVer = getIOSVersion(identifier)
    resolvedOs = config.os.replaceAll(TPL_IOS_VERSION, iosVer)
    resolvedVersion = iosVer.split('_')[0] ?? resolvedVersion
  } else if (preset === 'SAFARI_MACOS') {
    resolvedVersion = getSafariVersion(identifier)
  }

  const userAgent = config.uaTemplate
    .replaceAll(TPL_VERSION, resolvedVersion)
    .replaceAll(TPL_MAJOR, String(majorVersion))
    .replaceAll(TPL_IOS_VERSION, preset === 'SAFARI_IOS' ? getIOSVersion(identifier) : '')

  const headers = generateBrowserHeaders({
    preset,
    majorVersion,
    userAgent,
    config,
    locales,
    rng,
  })

  return {
    tlsIdentifier: identifier,
    userAgent,
    headers: headers.headers,
    headerOrder: headers.headerOrder,
    os: resolvedOs,
    platform: config.platform,
    mobile: config.mobile,
  }
}

/**
 * Generate a profile with a default seed when no seed is provided.
 * Uses timestamp-based randomness for one-off requests.
 */
export function generateRandomProfile(
  preset: FingerprintPreset,
  locales?: string[],
): IBrowserProfile {
  const randomSeed = `${Date.now()}-${Math.random()}`
  return generateProfile(randomSeed, preset, locales)
}
