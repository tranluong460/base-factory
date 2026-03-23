import { describe, expect, it } from 'vitest'
import type { ITlsProfileConfig } from '../../src/utils/private/http/core/types'
import {
  buildSecFetchHeaders,
  generateBrowserHeaders,
} from '../../src/utils/private/http/fingerprint/header-generator'

// ─── Helpers ──────────────────────────────────────────────────

function makeChromeConfig(overrides?: Partial<ITlsProfileConfig>): ITlsProfileConfig {
  return {
    identifiers: [],
    os: 'Windows NT 10.0; Win64; x64',
    platform: 'Win32',
    platformVersion: '15.0.0',
    secChUaPlatform: '"Windows"',
    mobile: false,
    uaTemplate: '',
    brands: [],
    ...overrides,
  }
}

function makeFirefoxConfig(): ITlsProfileConfig {
  return {
    identifiers: [],
    os: 'Windows NT 10.0; Win64; x64',
    platform: 'Win32',
    platformVersion: '10.0',
    secChUaPlatform: '"Windows"',
    mobile: false,
    uaTemplate: '',
    brands: [],
  }
}

function makeSafariConfig(overrides?: Partial<ITlsProfileConfig>): ITlsProfileConfig {
  return {
    identifiers: [],
    os: 'Macintosh; Intel Mac OS X 10_15_7',
    platform: 'MacIntel',
    platformVersion: '10_15_7',
    secChUaPlatform: '"macOS"',
    mobile: false,
    uaTemplate: '',
    brands: [],
    ...overrides,
  }
}

// ─── Chrome Headers ───────────────────────────────────────────

describe('generateBrowserHeaders - Chrome', () => {
  it('includes sec-ch-ua header', () => {
    const result = generateBrowserHeaders({
      preset: 'CHROME_WINDOWS',
      majorVersion: 146,
      userAgent: 'Mozilla/5.0 Chrome/146',
      config: makeChromeConfig(),
    })

    expect(result.headers['sec-ch-ua']).toBeDefined()
    expect(result.headers['sec-ch-ua']).toContain('Chromium')
  })

  it('sec-ch-ua-platform matches preset config', () => {
    const config = makeChromeConfig({ secChUaPlatform: '"Windows"' })
    const result = generateBrowserHeaders({
      preset: 'CHROME_WINDOWS',
      majorVersion: 146,
      userAgent: 'test-ua',
      config,
    })

    expect(result.headers['sec-ch-ua-platform']).toBe('"Windows"')
  })

  it('header order starts with sec-ch-ua for Chrome', () => {
    const result = generateBrowserHeaders({
      preset: 'CHROME_WINDOWS',
      majorVersion: 146,
      userAgent: 'test-ua',
      config: makeChromeConfig(),
    })

    expect(result.headerOrder[0]).toBe('sec-ch-ua')
    expect(result.headerOrder[1]).toBe('sec-ch-ua-mobile')
    expect(result.headerOrder[2]).toBe('sec-ch-ua-platform')
  })

  it('includes priority header for Chrome 124+', () => {
    const result = generateBrowserHeaders({
      preset: 'CHROME_WINDOWS',
      majorVersion: 146,
      userAgent: 'test-ua',
      config: makeChromeConfig(),
    })

    expect(result.headers.priority).toBe('u=0, i')
    expect(result.headerOrder).toContain('priority')
  })

  it('omits priority header for Chrome < 124', () => {
    const result = generateBrowserHeaders({
      preset: 'CHROME_WINDOWS',
      majorVersion: 120,
      userAgent: 'test-ua',
      config: makeChromeConfig(),
    })

    expect(result.headers.priority).toBeUndefined()
    expect(result.headerOrder).not.toContain('priority')
  })

  it('sets mobile flag correctly', () => {
    const result = generateBrowserHeaders({
      preset: 'CHROME_ANDROID',
      majorVersion: 146,
      userAgent: 'test-ua',
      config: makeChromeConfig({ mobile: true }),
    })

    expect(result.headers['sec-ch-ua-mobile']).toBe('?1')
  })

  it('forwards locales to accept-language', () => {
    const result = generateBrowserHeaders({
      preset: 'CHROME_WINDOWS',
      majorVersion: 146,
      userAgent: 'test-ua',
      config: makeChromeConfig(),
      locales: ['vi-VN', 'vi', 'en'],
    })

    expect(result.headers['accept-language']).toBe('vi-VN,vi;q=0.9,en;q=0.8')
  })

  it('defaults accept-language to en-US when no locales', () => {
    const result = generateBrowserHeaders({
      preset: 'CHROME_WINDOWS',
      majorVersion: 146,
      userAgent: 'test-ua',
      config: makeChromeConfig(),
    })

    expect(result.headers['accept-language']).toBe('en-US,en;q=0.9')
  })
})

// ─── Firefox Headers ──────────────────────────────────────────

describe('generateBrowserHeaders - Firefox', () => {
  it('does NOT include sec-ch-ua headers', () => {
    const result = generateBrowserHeaders({
      preset: 'FIREFOX_WINDOWS',
      majorVersion: 135,
      userAgent: 'Mozilla/5.0 Firefox/135.0',
      config: makeFirefoxConfig(),
    })

    expect(result.headers['sec-ch-ua']).toBeUndefined()
    expect(result.headers['sec-ch-ua-mobile']).toBeUndefined()
    expect(result.headers['sec-ch-ua-platform']).toBeUndefined()
  })

  it('includes te: trailers', () => {
    const result = generateBrowserHeaders({
      preset: 'FIREFOX_WINDOWS',
      majorVersion: 135,
      userAgent: 'test-ua',
      config: makeFirefoxConfig(),
    })

    expect(result.headers.te).toBe('trailers')
  })

  it('includes dnt when rng returns < 0.08', () => {
    const result = generateBrowserHeaders({
      preset: 'FIREFOX_WINDOWS',
      majorVersion: 135,
      userAgent: 'test-ua',
      config: makeFirefoxConfig(),
      rng: () => 0.05, // Below 0.08 threshold
    })

    expect(result.headers.dnt).toBe('1')
    expect(result.headerOrder).toContain('dnt')
  })

  it('omits dnt when rng returns >= 0.08', () => {
    const result = generateBrowserHeaders({
      preset: 'FIREFOX_WINDOWS',
      majorVersion: 135,
      userAgent: 'test-ua',
      config: makeFirefoxConfig(),
      rng: () => 0.5,
    })

    expect(result.headers.dnt).toBeUndefined()
    expect(result.headerOrder).not.toContain('dnt')
  })

  it('header order starts with user-agent for Firefox', () => {
    const result = generateBrowserHeaders({
      preset: 'FIREFOX_WINDOWS',
      majorVersion: 135,
      userAgent: 'test-ua',
      config: makeFirefoxConfig(),
      rng: () => 0.5,
    })

    expect(result.headerOrder[0]).toBe('user-agent')
    expect(result.headerOrder[1]).toBe('accept')
  })
})

// ─── Safari Headers ──────────────────────────────────────────

describe('generateBrowserHeaders - Safari macOS', () => {
  it('includes sec-fetch-* for Safari macOS 16+', () => {
    const result = generateBrowserHeaders({
      preset: 'SAFARI_MACOS',
      majorVersion: 16,
      userAgent: 'test-ua',
      config: makeSafariConfig(),
    })

    expect(result.headers['sec-fetch-site']).toBe('none')
    expect(result.headers['sec-fetch-mode']).toBe('navigate')
    expect(result.headers['sec-fetch-dest']).toBe('document')
  })

  it('does NOT include sec-fetch-user for Safari', () => {
    const result = generateBrowserHeaders({
      preset: 'SAFARI_MACOS',
      majorVersion: 16,
      userAgent: 'test-ua',
      config: makeSafariConfig(),
    })

    expect(result.headers['sec-fetch-user']).toBeUndefined()
  })

  it('does NOT include sec-fetch-* for Safari macOS 15', () => {
    const result = generateBrowserHeaders({
      preset: 'SAFARI_MACOS',
      majorVersion: 15,
      userAgent: 'test-ua',
      config: makeSafariConfig(),
    })

    expect(result.headers['sec-fetch-site']).toBeUndefined()
    expect(result.headers['sec-fetch-mode']).toBeUndefined()
    expect(result.headers['sec-fetch-dest']).toBeUndefined()
  })

  it('does NOT include sec-ch-ua for Safari', () => {
    const result = generateBrowserHeaders({
      preset: 'SAFARI_MACOS',
      majorVersion: 16,
      userAgent: 'test-ua',
      config: makeSafariConfig(),
    })

    expect(result.headers['sec-ch-ua']).toBeUndefined()
  })
})

describe('generateBrowserHeaders - Safari iOS', () => {
  it('includes sec-fetch-* for Safari iOS 17+', () => {
    const result = generateBrowserHeaders({
      preset: 'SAFARI_IOS',
      majorVersion: 17,
      userAgent: 'test-ua',
      config: makeSafariConfig({ mobile: true }),
    })

    expect(result.headers['sec-fetch-site']).toBe('none')
    expect(result.headers['sec-fetch-mode']).toBe('navigate')
    expect(result.headers['sec-fetch-dest']).toBe('document')
  })

  it('does NOT include sec-fetch-user for Safari iOS', () => {
    const result = generateBrowserHeaders({
      preset: 'SAFARI_IOS',
      majorVersion: 17,
      userAgent: 'test-ua',
      config: makeSafariConfig({ mobile: true }),
    })

    expect(result.headers['sec-fetch-user']).toBeUndefined()
  })

  it('does NOT include sec-fetch-* for Safari iOS < 17', () => {
    const result = generateBrowserHeaders({
      preset: 'SAFARI_IOS',
      majorVersion: 16,
      userAgent: 'test-ua',
      config: makeSafariConfig({ mobile: true }),
    })

    expect(result.headers['sec-fetch-site']).toBeUndefined()
  })
})

// ─── buildSecFetchHeaders ─────────────────────────────────────

describe('buildSecFetchHeaders', () => {
  it('returns navigate mode for navigation context', () => {
    const headers = buildSecFetchHeaders({
      isNavigation: true,
      isUserInitiated: true,
      targetSite: 'none',
      destination: 'document',
    })

    expect(headers['sec-fetch-mode']).toBe('navigate')
    expect(headers['sec-fetch-user']).toBe('?1')
    expect(headers['sec-fetch-dest']).toBe('document')
    expect(headers.priority).toBe('u=0, i')
  })

  it('returns cors mode for XHR/fetch (empty) context', () => {
    const headers = buildSecFetchHeaders({
      isNavigation: false,
      isUserInitiated: false,
      targetSite: 'same-origin',
      destination: 'empty',
    })

    expect(headers['sec-fetch-mode']).toBe('cors')
    expect(headers['sec-fetch-user']).toBeUndefined()
    expect(headers['sec-fetch-dest']).toBe('empty')
    expect(headers.accept).toBe('*/*')
    expect(headers.priority).toBe('u=1')
  })

  it('returns no-cors mode for image/style/script sub-resources', () => {
    const imageHeaders = buildSecFetchHeaders({
      isNavigation: false,
      isUserInitiated: false,
      targetSite: 'same-origin',
      destination: 'image',
    })
    expect(imageHeaders['sec-fetch-mode']).toBe('no-cors')
    expect(imageHeaders.accept).toBe('image/avif,image/webp,image/apng,image/*,*/*;q=0.8')

    const styleHeaders = buildSecFetchHeaders({
      isNavigation: false,
      isUserInitiated: false,
      targetSite: 'same-origin',
      destination: 'style',
    })
    expect(styleHeaders['sec-fetch-mode']).toBe('no-cors')
    expect(styleHeaders.accept).toBe('text/css,*/*;q=0.1')

    const scriptHeaders = buildSecFetchHeaders({
      isNavigation: false,
      isUserInitiated: false,
      targetSite: 'same-origin',
      destination: 'script',
    })
    expect(scriptHeaders['sec-fetch-mode']).toBe('no-cors')
    expect(scriptHeaders.accept).toBe('*/*')
  })

  it('returns cors mode for font sub-resources', () => {
    const headers = buildSecFetchHeaders({
      isNavigation: false,
      isUserInitiated: false,
      targetSite: 'same-origin',
      destination: 'font',
    })
    expect(headers['sec-fetch-mode']).toBe('cors')
    expect(headers.accept).toBe('*/*')
  })

  it('does not include sec-fetch-user for non-user-initiated navigation', () => {
    const headers = buildSecFetchHeaders({
      isNavigation: true,
      isUserInitiated: false,
      targetSite: 'none',
      destination: 'document',
    })

    expect(headers['sec-fetch-user']).toBeUndefined()
  })

  it('defaults to navigation context when no context provided', () => {
    const headers = buildSecFetchHeaders()

    expect(headers['sec-fetch-mode']).toBe('navigate')
    expect(headers['sec-fetch-user']).toBe('?1')
    expect(headers['sec-fetch-site']).toBe('none')
    expect(headers['sec-fetch-dest']).toBe('document')
  })

  it('sets priority based on destination', () => {
    const imageHeaders = buildSecFetchHeaders({
      isNavigation: false,
      isUserInitiated: false,
      targetSite: 'same-origin',
      destination: 'image',
    })
    expect(imageHeaders.priority).toBe('u=4, i')

    const scriptHeaders = buildSecFetchHeaders({
      isNavigation: false,
      isUserInitiated: false,
      targetSite: 'same-origin',
      destination: 'script',
    })
    expect(scriptHeaders.priority).toBe('u=1')
  })
})
