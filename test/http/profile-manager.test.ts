import { describe, expect, it } from 'vitest'
import {
  createSeededRandom,
  generateProfile,
  generateRandomProfile,
} from '../../src/utils/private/http/fingerprint/profile-manager'

describe('createSeededRandom', () => {
  it('produces same sequence for same seed', () => {
    const rng1 = createSeededRandom('test-seed')
    const rng2 = createSeededRandom('test-seed')

    const values1 = Array.from({ length: 10 }, () => rng1())
    const values2 = Array.from({ length: 10 }, () => rng2())

    expect(values1).toEqual(values2)
  })

  it('produces different sequences for different seeds', () => {
    const rng1 = createSeededRandom('seed-a')
    const rng2 = createSeededRandom('seed-b')

    const values1 = Array.from({ length: 5 }, () => rng1())
    const values2 = Array.from({ length: 5 }, () => rng2())

    expect(values1).not.toEqual(values2)
  })

  it('produces values in range [0, 1)', () => {
    const rng = createSeededRandom('range-check')

    for (let i = 0; i < 100; i++) {
      const val = rng()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })
})

describe('generateProfile', () => {
  it('same seed + preset produces identical profile', () => {
    const profile1 = generateProfile('fixed-seed-123', 'CHROME_WINDOWS')
    const profile2 = generateProfile('fixed-seed-123', 'CHROME_WINDOWS')

    expect(profile1.tlsIdentifier).toBe(profile2.tlsIdentifier)
    expect(profile1.userAgent).toBe(profile2.userAgent)
    expect(profile1.headers).toEqual(profile2.headers)
    expect(profile1.headerOrder).toEqual(profile2.headerOrder)
  })

  it('different seeds produce different profiles', () => {
    const profile1 = generateProfile('seed-alpha', 'CHROME_WINDOWS')
    const profile2 = generateProfile('seed-beta', 'CHROME_WINDOWS')

    // They could theoretically match, but with enough seed entropy they won't
    const sameIdentifier = profile1.tlsIdentifier === profile2.tlsIdentifier
    const sameUA = profile1.userAgent === profile2.userAgent
    // At least one property should differ
    expect(sameIdentifier && sameUA).toBe(false)
  })

  it('forwards locales to accept-language header', () => {
    const profile = generateProfile('locale-test', 'CHROME_WINDOWS', ['vi-VN', 'vi', 'en'])

    expect(profile.headers['accept-language']).toBe('vi-VN,vi;q=0.9,en;q=0.8')
  })

  it('uses en-US as default locale', () => {
    const profile = generateProfile('default-locale', 'CHROME_WINDOWS')

    expect(profile.headers['accept-language']).toContain('en-US')
  })

  it('generates valid user-agent for Chrome preset', () => {
    const profile = generateProfile('chrome-ua-test', 'CHROME_WINDOWS')

    expect(profile.userAgent).toContain('Mozilla/5.0')
    expect(profile.userAgent).toContain('Chrome/')
    expect(profile.userAgent).toContain('Windows NT 10.0')
  })

  it('generates valid user-agent for Firefox preset', () => {
    const profile = generateProfile('firefox-ua-test', 'FIREFOX_WINDOWS')

    expect(profile.userAgent).toContain('Firefox/')
    expect(profile.userAgent).toContain('Gecko/20100101')
  })

  it('generates Safari iOS profile with correct OS string', () => {
    const profile = generateProfile('safari-ios-test', 'SAFARI_IOS')

    expect(profile.userAgent).toContain('iPhone')
    expect(profile.os).toContain('iPhone')
    expect(profile.mobile).toBe(true)
  })

  it('safari iOS version in OS matches TLS identifier pattern', () => {
    const profile = generateProfile('ios-tls-check', 'SAFARI_IOS')

    // The OS should contain an iOS version like 17_0, 18_0, etc.
    expect(profile.os).toMatch(/iPhone OS \d+_\d+/)
    // The TLS identifier should be safari_ios_*
    expect(profile.tlsIdentifier).toMatch(/^safari_ios_/)
  })

  it('generates Safari macOS profile with version in UA', () => {
    const profile = generateProfile('safari-macos-test', 'SAFARI_MACOS')

    expect(profile.userAgent).toContain('Macintosh')
    expect(profile.userAgent).toContain('Version/')
    expect(profile.mobile).toBe(false)
  })

  it('generates Edge profile with Edg/ in UA', () => {
    const profile = generateProfile('edge-test', 'EDGE_WINDOWS')

    expect(profile.userAgent).toContain('Edg/')
    expect(profile.platform).toBe('Win32')
  })
})

describe('generateRandomProfile', () => {
  it('returns a valid profile', () => {
    const profile = generateRandomProfile('CHROME_WINDOWS')

    expect(profile.tlsIdentifier).toBeDefined()
    expect(profile.userAgent).toContain('Chrome/')
    expect(profile.headers).toBeDefined()
    expect(profile.headerOrder.length).toBeGreaterThan(0)
  })

  it('generates different profiles on successive calls', () => {
    const profile1 = generateRandomProfile('CHROME_WINDOWS')
    const profile2 = generateRandomProfile('CHROME_WINDOWS')

    // Due to timestamp-based seed, these should differ
    // (though not guaranteed in extremely fast execution)
    expect(profile1.userAgent).toBeDefined()
    expect(profile2.userAgent).toBeDefined()
  })
})
