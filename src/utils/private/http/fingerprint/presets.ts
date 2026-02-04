import type { FingerprintPreset, PresetData } from '../types'

/** Browser version ranges (2024-2026) */
const VERSIONS = {
  chrome: { min: 130, max: 145 },
  firefox: { min: 130, max: 147 },
  safari: { min: 18, max: 26 },
  edge: { min: 130, max: 144 },
} as const

/** Chrome patch versions by major version */
const CHROME_PATCHES: Record<number, string[]> = {
  130: ['130.0.6723.58', '130.0.6723.92', '130.0.6723.102'],
  131: ['131.0.6778.69', '131.0.6778.85', '131.0.6778.108'],
  132: ['132.0.6834.57', '132.0.6834.83', '132.0.6834.110'],
  133: ['133.0.6917.71', '133.0.6917.86', '133.0.6917.98'],
  134: ['134.0.6998.44', '134.0.6998.62', '134.0.6998.89'],
  135: ['135.0.7049.52', '135.0.7049.84', '135.0.7049.96'],
  136: ['136.0.7103.59', '136.0.7103.92', '136.0.7103.113'],
  137: ['137.0.7151.68', '137.0.7151.90', '137.0.7151.104'],
  138: ['138.0.7204.62', '138.0.7204.85', '138.0.7204.99'],
  139: ['139.0.7258.64', '139.0.7258.88', '139.0.7258.102'],
  140: ['140.0.7312.58', '140.0.7312.79', '140.0.7312.95'],
  141: ['141.0.7366.67', '141.0.7366.88', '141.0.7366.105'],
  142: ['142.0.7420.61', '142.0.7420.82', '142.0.7420.98'],
  143: ['143.0.7474.66', '143.0.7474.85', '143.0.7474.101'],
  144: ['144.0.7559.66', '144.0.7559.98', '144.0.7559.110'],
  145: ['145.0.7612.62', '145.0.7612.84', '145.0.7612.99'],
}

/** GREASE brand by Chrome version */
const GREASE_BRANDS: Record<number, string> = {
  130: '"Not/A)Brand"',
  131: '"Not)A;Brand"',
  132: '"Not_A Brand"',
  133: '"Not:A-Brand"',
  134: '"Not/A)Brand"',
  135: '"Not)A;Brand"',
  136: '"Not_A Brand"',
  137: '"Not:A-Brand"',
  138: '"Not/A)Brand"',
  139: '"Not)A;Brand"',
  140: '"Not_A Brand"',
  141: '"Not:A-Brand"',
  142: '"Not/A)Brand"',
  143: '"Not)A;Brand"',
  144: '"Not(A:Brand"',
  145: '"Not:A-Brand"',
}

/** All presets */
const PRESETS: Record<FingerprintPreset, PresetData> = {
  // Desktop
  CHROME_WINDOWS: { browser: 'chrome', version: VERSIONS.chrome, os: 'windows', device: 'desktop' },
  CHROME_MACOS: { browser: 'chrome', version: VERSIONS.chrome, os: 'macos', device: 'desktop' },
  CHROME_LINUX: { browser: 'chrome', version: VERSIONS.chrome, os: 'linux', device: 'desktop' },
  FIREFOX_WINDOWS: {
    browser: 'firefox',
    version: VERSIONS.firefox,
    os: 'windows',
    device: 'desktop',
  },
  FIREFOX_MACOS: { browser: 'firefox', version: VERSIONS.firefox, os: 'macos', device: 'desktop' },
  FIREFOX_LINUX: { browser: 'firefox', version: VERSIONS.firefox, os: 'linux', device: 'desktop' },
  SAFARI_MACOS: { browser: 'safari', version: VERSIONS.safari, os: 'macos', device: 'desktop' },
  EDGE_WINDOWS: { browser: 'edge', version: VERSIONS.edge, os: 'windows', device: 'desktop' },
  // Mobile
  CHROME_ANDROID: { browser: 'chrome', version: VERSIONS.chrome, os: 'android', device: 'mobile' },
  CHROME_IOS: { browser: 'chrome', version: VERSIONS.chrome, os: 'ios', device: 'mobile' },
  FIREFOX_ANDROID: {
    browser: 'firefox',
    version: VERSIONS.firefox,
    os: 'android',
    device: 'mobile',
  },
  SAFARI_IOS: { browser: 'safari', version: VERSIONS.safari, os: 'ios', device: 'mobile' },
}

/** Get preset data */
export function getPreset(name: FingerprintPreset): PresetData {
  return PRESETS[name]
}

/** Get Chrome patch version */
export function getChromePatch(majorVersion: number, seed?: string): string {
  const patches = CHROME_PATCHES[majorVersion]
  if (!patches?.length) {
    return `${majorVersion}.0.0.0`
  }
  if (seed) {
    const hash = [...seed].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
    return patches[Math.abs(hash) % patches.length]
  }
  return patches[Math.floor(Math.random() * patches.length)]
}

/** Get GREASE brand for version */
export function getGreaseBrand(version: number): string {
  return GREASE_BRANDS[version] || '"Not_A Brand"'
}
