import type { FingerprintPreset, PresetData } from '../types'

// ==================== Browser Version Constants ====================

/** Chrome versions (2024-2025): 120-133+ */
const CHROME_MIN = 130
const CHROME_MAX = 133

/** Firefox versions (2024-2025): 120-133+ */
const FIREFOX_MIN = 130
const FIREFOX_MAX = 133

/** Safari versions (iOS 17-18, macOS): 17-18 */
const SAFARI_MIN = 17
const SAFARI_MAX = 18

/** Edge versions (follows Chrome): 130-133+ */
const EDGE_MIN = 130
const EDGE_MAX = 133

// ==================== Desktop Presets ====================

/** Desktop presets configuration */
const DESKTOP_PRESETS: Record<string, PresetData> = {
  CHROME_WINDOWS: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'windows',
    device: 'desktop',
  },
  CHROME_MACOS: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'macos',
    device: 'desktop',
  },
  CHROME_LINUX: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'linux',
    device: 'desktop',
  },
  FIREFOX_WINDOWS: {
    browser: 'firefox',
    minVersion: FIREFOX_MIN,
    maxVersion: FIREFOX_MAX,
    os: 'windows',
    device: 'desktop',
  },
  FIREFOX_MACOS: {
    browser: 'firefox',
    minVersion: FIREFOX_MIN,
    maxVersion: FIREFOX_MAX,
    os: 'macos',
    device: 'desktop',
  },
  FIREFOX_LINUX: {
    browser: 'firefox',
    minVersion: FIREFOX_MIN,
    maxVersion: FIREFOX_MAX,
    os: 'linux',
    device: 'desktop',
  },
  SAFARI_MACOS: {
    browser: 'safari',
    minVersion: SAFARI_MIN,
    maxVersion: SAFARI_MAX,
    os: 'macos',
    device: 'desktop',
  },
  EDGE_WINDOWS: {
    browser: 'edge',
    minVersion: EDGE_MIN,
    maxVersion: EDGE_MAX,
    os: 'windows',
    device: 'desktop',
  },
}

// ==================== Android Presets ====================

/** Android presets configuration */
const ANDROID_PRESETS: Record<string, PresetData> = {
  CHROME_ANDROID: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'android',
    device: 'mobile',
    mobile: { brands: ['samsung', 'pixel', 'xiaomi', 'oppo', 'oneplus', 'generic'] },
  },
  CHROME_ANDROID_SAMSUNG: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'android',
    device: 'mobile',
    mobile: { brands: ['samsung'] },
  },
  CHROME_ANDROID_PIXEL: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'android',
    device: 'mobile',
    mobile: { brands: ['pixel'] },
  },
  CHROME_ANDROID_XIAOMI: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'android',
    device: 'mobile',
    mobile: { brands: ['xiaomi'] },
  },
  FIREFOX_ANDROID: {
    browser: 'firefox',
    minVersion: FIREFOX_MIN,
    maxVersion: FIREFOX_MAX,
    os: 'android',
    device: 'mobile',
    mobile: { brands: ['samsung', 'pixel', 'xiaomi', 'generic'] },
  },
}

// ==================== iOS Presets ====================

/** iOS presets configuration */
const IOS_PRESETS: Record<string, PresetData> = {
  SAFARI_IOS: {
    browser: 'safari',
    minVersion: SAFARI_MIN,
    maxVersion: SAFARI_MAX,
    os: 'ios',
    device: 'mobile',
    mobile: { brands: ['iphone', 'ipad'] },
  },
  SAFARI_IPHONE: {
    browser: 'safari',
    minVersion: SAFARI_MIN,
    maxVersion: SAFARI_MAX,
    os: 'ios',
    device: 'mobile',
    mobile: { brands: ['iphone'] },
  },
  SAFARI_IPAD: {
    browser: 'safari',
    minVersion: SAFARI_MIN,
    maxVersion: SAFARI_MAX,
    os: 'ios',
    device: 'mobile',
    mobile: { brands: ['ipad'] },
  },
  CHROME_IOS: {
    browser: 'chrome',
    minVersion: CHROME_MIN,
    maxVersion: CHROME_MAX,
    os: 'ios',
    device: 'mobile',
    mobile: { brands: ['iphone'] },
  },
}

// ==================== All Presets ====================

/** All presets combined */
export const PRESETS: Record<FingerprintPreset, PresetData> = {
  ...DESKTOP_PRESETS,
  ...ANDROID_PRESETS,
  ...IOS_PRESETS,
} as Record<FingerprintPreset, PresetData>

// ==================== Utility Functions ====================

/** Get preset data by name */
export function getPreset(name: FingerprintPreset): PresetData {
  return PRESETS[name]
}

/** Get all preset names */
export function getPresetNames(): FingerprintPreset[] {
  return Object.keys(PRESETS) as FingerprintPreset[]
}

/** Get presets by device type */
export function getPresetsByDevice(device: 'desktop' | 'mobile'): FingerprintPreset[] {
  return (Object.entries(PRESETS) as [FingerprintPreset, PresetData][])
    .filter(([, data]) => data.device === device)
    .map(([name]) => name)
}

/** Get presets by OS */
export function getPresetsByOS(os: string): FingerprintPreset[] {
  return (Object.entries(PRESETS) as [FingerprintPreset, PresetData][])
    .filter(([, data]) => data.os === os)
    .map(([name]) => name)
}

/** Get presets by browser */
export function getPresetsByBrowser(browser: string): FingerprintPreset[] {
  return (Object.entries(PRESETS) as [FingerprintPreset, PresetData][])
    .filter(([, data]) => data.browser === browser)
    .map(([name]) => name)
}
