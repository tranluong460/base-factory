import type { ClientProfile } from 'tlsclientwrapper'
import { describe, expect, it } from 'vitest'
import {
  extractMajorVersion,
  generateChromeGreaseBrands,
  getBrowserBrand,
  getIOSVersion,
  getSafariVersion,
} from '../../src/utils/private/http/fingerprint/presets'

describe('generateChromeGreaseBrands', () => {
  it('generates correct GREASE brand for Chrome 133', () => {
    const brands = generateChromeGreaseBrands(133, 'Google Chrome')

    // Find the GREASE brand entry
    const grease = brands.find((b) => b.brand !== 'Chromium' && b.brand !== 'Google Chrome')
    expect(grease).toBeDefined()

    // 133 % 11 = 1 → char '(' ; (133+1) % 11 = 2 → char ':' → "Not(A:Brand"
    expect(grease!.brand).toBe('Not(A:Brand')
    // 133 % 3 = 1 → version '99'
    expect(grease!.version).toBe('99')
  })

  it('generates correct GREASE brand for Chrome 144', () => {
    const brands = generateChromeGreaseBrands(144, 'Google Chrome')

    const grease = brands.find((b) => b.brand !== 'Chromium' && b.brand !== 'Google Chrome')
    expect(grease).toBeDefined()

    // 144 % 11 = 1 → '(' ; (144+1) % 11 = 2 → ':' → "Not(A:Brand"
    expect(grease!.brand).toBe('Not(A:Brand')
    // 144 % 3 = 0 → version '8'
    expect(grease!.version).toBe('8')
  })

  it('generates correct GREASE brand for Chrome 146', () => {
    const brands = generateChromeGreaseBrands(146, 'Google Chrome')

    const grease = brands.find((b) => b.brand !== 'Chromium' && b.brand !== 'Google Chrome')
    expect(grease).toBeDefined()

    // 146 % 11 = 3 → '-' ; (146+1) % 11 = 4 → '.' → "Not-A.Brand"
    expect(grease!.brand).toBe('Not-A.Brand')
    // 146 % 3 = 2 → version '24'
    expect(grease!.version).toBe('24')
  })

  it('uses "Microsoft Edge" brand for Edge preset', () => {
    const brands = generateChromeGreaseBrands(144, 'Microsoft Edge')

    const edge = brands.find((b) => b.brand === 'Microsoft Edge')
    expect(edge).toBeDefined()
    expect(edge!.version).toBe('144')

    // Confirm no "Google Chrome" entry
    const chrome = brands.find((b) => b.brand === 'Google Chrome')
    expect(chrome).toBeUndefined()
  })

  it('always includes Chromium entry with correct version', () => {
    const brands = generateChromeGreaseBrands(133, 'Google Chrome')

    const chromium = brands.find((b) => b.brand === 'Chromium')
    expect(chromium).toBeDefined()
    expect(chromium!.version).toBe('133')
  })

  it('returns exactly 3 brand entries', () => {
    const brands = generateChromeGreaseBrands(131, 'Google Chrome')
    expect(brands).toHaveLength(3)
  })

  it('permutes brand order based on version % 6', () => {
    // version 133 % 6 = 1 → permutation [0,2,1]
    // Original order: [grease, Chromium, Google Chrome]
    // Permuted: shuffled[0]=original[0], shuffled[2]=original[1], shuffled[1]=original[2]
    const brands133 = generateChromeGreaseBrands(133, 'Google Chrome')
    expect(brands133[0]!.brand).toBe('Not(A:Brand')
    expect(brands133[1]!.brand).toBe('Google Chrome')
    expect(brands133[2]!.brand).toBe('Chromium')

    // version 146 % 6 = 2 → permutation [1,0,2]
    // Permuted: shuffled[1]=original[0], shuffled[0]=original[1], shuffled[2]=original[2]
    const brands146 = generateChromeGreaseBrands(146, 'Google Chrome')
    expect(brands146[0]!.brand).toBe('Chromium')
    expect(brands146[1]!.brand).toBe('Not-A.Brand')
    expect(brands146[2]!.brand).toBe('Google Chrome')
  })
})

describe('extractMajorVersion', () => {
  it('extracts version from chrome identifier', () => {
    expect(extractMajorVersion('chrome_146' as ClientProfile)).toBe(146)
  })

  it('extracts version from firefox identifier', () => {
    expect(extractMajorVersion('firefox_135' as ClientProfile)).toBe(135)
  })

  it('extracts version from safari_ios identifier', () => {
    expect(extractMajorVersion('safari_ios_17_0' as ClientProfile)).toBe(17)
  })

  it('returns 100 for identifier with no digits', () => {
    expect(extractMajorVersion('unknown' as ClientProfile)).toBe(100)
  })
})

describe('getIOSVersion', () => {
  it('returns correct iOS version for known identifier', () => {
    expect(getIOSVersion('safari_ios_17_0' as ClientProfile)).toBe('17_0')
    expect(getIOSVersion('safari_ios_18_5' as ClientProfile)).toBe('18_5')
  })

  it('falls back to 18_0 for unknown identifier', () => {
    expect(getIOSVersion('safari_ios_99_0' as ClientProfile)).toBe('18_0')
  })
})

describe('getSafariVersion', () => {
  it('returns correct Safari version for known identifier', () => {
    expect(getSafariVersion('safari_15_6_1' as ClientProfile)).toBe('15.6.1')
    expect(getSafariVersion('safari_16_0' as ClientProfile)).toBe('16.0')
  })

  it('falls back to 16.0 for unknown identifier', () => {
    expect(getSafariVersion('safari_99_0' as ClientProfile)).toBe('16.0')
  })
})

describe('getBrowserBrand', () => {
  it('returns "Microsoft Edge" for EDGE_WINDOWS', () => {
    expect(getBrowserBrand('EDGE_WINDOWS')).toBe('Microsoft Edge')
  })

  it('returns "Google Chrome" for Chrome presets', () => {
    expect(getBrowserBrand('CHROME_WINDOWS')).toBe('Google Chrome')
    expect(getBrowserBrand('CHROME_MACOS')).toBe('Google Chrome')
    expect(getBrowserBrand('CHROME_LINUX')).toBe('Google Chrome')
    expect(getBrowserBrand('CHROME_ANDROID')).toBe('Google Chrome')
  })

  it('returns "Google Chrome" for non-Edge presets', () => {
    expect(getBrowserBrand('FIREFOX_WINDOWS')).toBe('Google Chrome')
    expect(getBrowserBrand('SAFARI_MACOS')).toBe('Google Chrome')
  })
})
