import { describe, expect, it } from 'vitest'
import { getGeoLocale, getSupportedCountryCodes } from '../../src/utils/private/http/utils/behavior'

describe('getGeoLocale', () => {
  it('returns Vietnamese config for VN', () => {
    const config = getGeoLocale('VN')

    expect(config.locales).toEqual(['vi-VN', 'vi', 'en'])
    expect(config.timezone).toBe('Asia/Ho_Chi_Minh')
    expect(config.acceptLanguage).toBe('vi-VN,vi;q=0.9,en;q=0.8')
  })

  it('returns US config for US', () => {
    const config = getGeoLocale('US')

    expect(config.locales).toEqual(['en-US', 'en'])
    expect(config.timezone).toBe('America/New_York')
    expect(config.acceptLanguage).toBe('en-US,en;q=0.9')
  })

  it('returns Japanese config for JP', () => {
    const config = getGeoLocale('JP')

    expect(config.locales).toEqual(['ja-JP', 'ja', 'en'])
    expect(config.timezone).toBe('Asia/Tokyo')
  })

  it('falls back to US for unknown country code', () => {
    const config = getGeoLocale('XX')

    expect(config.locales).toEqual(['en-US', 'en'])
    expect(config.timezone).toBe('America/New_York')
  })

  it('handles lowercase country code', () => {
    const config = getGeoLocale('vn')

    expect(config.locales).toEqual(['vi-VN', 'vi', 'en'])
    expect(config.timezone).toBe('Asia/Ho_Chi_Minh')
  })

  it('returns Korean config for KR', () => {
    const config = getGeoLocale('KR')

    expect(config.locales).toEqual(['ko-KR', 'ko', 'en'])
    expect(config.timezone).toBe('Asia/Seoul')
  })
})

describe('getSupportedCountryCodes', () => {
  it('returns array of country codes', () => {
    const codes = getSupportedCountryCodes()

    expect(codes).toContain('US')
    expect(codes).toContain('VN')
    expect(codes).toContain('JP')
    expect(codes).toContain('KR')
    expect(codes.length).toBeGreaterThan(10)
  })
})
