/**
 * Real session simulation test — verifies the tool behaves like a real user session.
 * Tests fingerprint consistency, navigation flow, referer chain, and multi-site access.
 */
import { afterAll, describe, expect, it } from 'vitest'
import { HttpClient } from '../../src/utils/private/http/client'

const TIMEOUT = 30_000

const client = new HttpClient({
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    seed: 'real-session-test',
    locales: ['vi-VN', 'vi', 'en'],
  },
  blockRetries: 1,
})

afterAll(async () => {
  await client.destroy()
})

describe('fingerprint Consistency (same session)', () => {
  it(
    'should send identical fingerprint across 3 sequential requests',
    async () => {
      const urls = [
        'https://httpbin.org/headers',
        'https://httpbin.org/headers',
        'https://httpbin.org/headers',
      ]

      const results: Record<string, string>[] = []
      for (const url of urls) {
        const res = await client.get<Record<string, unknown>>(url, { throwOnError: false })
        results.push(res.data.headers as Record<string, string>)
      }

      // All 3 requests must have identical UA
      expect(results[0]!['User-Agent']).toBe(results[1]!['User-Agent'])
      expect(results[1]!['User-Agent']).toBe(results[2]!['User-Agent'])

      // All 3 must have identical sec-ch-ua
      expect(results[0]!['Sec-Ch-Ua']).toBe(results[1]!['Sec-Ch-Ua'])

      // All 3 must have identical platform
      expect(results[0]!['Sec-Ch-Ua-Platform']).toBe(results[1]!['Sec-Ch-Ua-Platform'])

      console.log('UA:', results[0]!['User-Agent'])
      console.log('sec-ch-ua:', results[0]!['Sec-Ch-Ua'])
      console.log('platform:', results[0]!['Sec-Ch-Ua-Platform'])
      console.log('language:', results[0]!['Accept-Language'])
    },
    TIMEOUT,
  )
})

describe('locales / accept-language', () => {
  it(
    'should send vi-VN accept-language (matching config)',
    async () => {
      const res = await client.get<Record<string, unknown>>('https://httpbin.org/headers', {
        throwOnError: false,
      })
      const headers = res.data.headers as Record<string, string>
      expect(headers['Accept-Language']).toContain('vi-VN')
      console.log('Accept-Language:', headers['Accept-Language'])
    },
    TIMEOUT,
  )
})

describe('referer Chain', () => {
  it(
    'should build referer chain across navigation',
    async () => {
      // First request — no referer
      await client.get('https://httpbin.org/get', { throwOnError: false })

      // Second request — should have referer from first
      const res2 = await client.get<Record<string, unknown>>('https://httpbin.org/headers', {
        throwOnError: false,
      })
      const headers2 = res2.data.headers as Record<string, string>

      // Same origin → full URL as referer
      expect(headers2.Referer).toContain('httpbin.org')
      console.log('Referer (same-origin):', headers2.Referer)
    },
    TIMEOUT,
  )
})

describe('tLS Fingerprint Deep Check', () => {
  it(
    'should have Chrome-matching TLS + H2 fingerprint',
    async () => {
      const res = await client.get<Record<string, unknown>>('https://tls.peet.ws/api/all', {
        throwOnError: false,
      })

      expect(res.status).toBe(200)
      const data = res.data
      const tls = data.tls as Record<string, unknown>
      const http2 = data.http2 as Record<string, unknown>
      const ip = data.ip as string

      console.log('=== TLS Layer ===')
      console.log('JA3:', tls.ja3)
      console.log('JA3 Hash:', tls.ja3_hash)
      console.log('JA4:', tls.ja4)
      console.log('TLS Version:', tls.tls_version)
      console.log('Cipher:', tls.cipher)

      console.log('\n=== HTTP/2 Layer ===')
      console.log('H2 Fingerprint:', http2.akamai_fingerprint)
      console.log('H2 Hash:', http2.akamai_fingerprint_hash)
      console.log('Sent Frames:', http2.sent_frames)

      console.log('\n=== Network ===')
      console.log('IP:', ip)
      console.log('Protocol:', data.http_version)

      // Must be h2
      expect(data.http_version).toBe('h2')
      // JA3 must exist
      expect(tls.ja3_hash).toBeTruthy()
      // H2 fingerprint must exist
      expect(http2.akamai_fingerprint).toBeTruthy()
    },
    TIMEOUT,
  )
})

describe('multi-Site Access (no block)', () => {
  const sites = [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Bing', url: 'https://www.bing.com' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
    { name: 'StackOverflow', url: 'https://stackoverflow.com' },
    { name: 'Reddit', url: 'https://www.reddit.com' },
    { name: 'Amazon', url: 'https://www.amazon.com' },
  ]

  for (const site of sites) {
    it(
      `should access ${site.name} without being blocked`,
      async () => {
        const res = await client.get<string>(site.url, { throwOnError: false })

        console.log(`${site.name}: ${res.status} (${res.duration}ms)`)

        // Should NOT be 403/429 blocked
        expect(res.status).not.toBe(403)
        expect(res.status).not.toBe(429)

        // Should get HTML back
        if (res.status === 200) {
          expect(res.data.length).toBeGreaterThan(100)
        }
      },
      TIMEOUT,
    )
  }
})

describe('aPI-style Request (sec-fetch context)', () => {
  it(
    'should send correct sec-fetch for API calls (not navigate)',
    async () => {
      const res = await client.get<Record<string, unknown>>('https://httpbin.org/headers', {
        throwOnError: false,
        context: {
          isNavigation: false,
          isUserInitiated: false,
          targetSite: 'same-origin',
          destination: 'empty',
        },
      })

      const headers = res.data.headers as Record<string, string>
      console.log('API sec-fetch-mode:', headers['Sec-Fetch-Mode'])
      console.log('API sec-fetch-dest:', headers['Sec-Fetch-Dest'])
      console.log('API sec-fetch-site:', headers['Sec-Fetch-Site'])
      console.log('API sec-fetch-user:', headers['Sec-Fetch-User'])

      // API call should be cors/empty, NOT navigate/document
      expect(headers['Sec-Fetch-Mode']).toBe('cors')
      expect(headers['Sec-Fetch-Dest']).toBe('empty')
      expect(headers['Sec-Fetch-Site']).toBe('same-origin')
      // sec-fetch-user should be absent for API calls
      expect(headers['Sec-Fetch-User']).toBeUndefined()
    },
    TIMEOUT,
  )
})

describe('cookie Persistence', () => {
  it(
    'should maintain cookies across requests to same domain',
    async () => {
      // Set a cookie via httpbin
      await client.get('https://httpbin.org/cookies/set/test_session/abc123', {
        throwOnError: false,
      })

      // Check cookies are sent back
      const res = await client.get<Record<string, unknown>>('https://httpbin.org/cookies', {
        throwOnError: false,
      })

      console.log('Cookies:', res.data)
      const cookies = res.data.cookies as Record<string, string> | undefined
      if (cookies) {
        expect(cookies.test_session).toBe('abc123')
        console.log('✅ Cookie persisted across requests')
      }
    },
    TIMEOUT,
  )
})
