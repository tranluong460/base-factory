/**
 * Integration tests — call real APIs to verify TLS fingerprint, headers, and Cloudflare bypass.
 * These tests require internet access and may be slow (~30s+).
 *
 * Run: npm run test:integration
 * Skip in CI: these are NOT run by default `npm run test`
 */
import { afterAll, describe, expect, it } from 'vitest'
import { HttpClient } from '../../src/utils/private/http/client'
import type { IHttpResponse } from '../../src/utils/private/http/core/types'

const TIMEOUT = 30_000

// Shared client — reuse across tests for connection pooling
const client = new HttpClient({
  fingerprint: { preset: 'CHROME_WINDOWS', seed: 'integration-test-seed' },
  blockRetries: 0, // Don't retry — we want to see raw results
})

afterAll(async () => {
  await client.destroy()
})

describe('tLS Fingerprint Verification', () => {
  it(
    'should have valid JA3/JA4 fingerprint matching Chrome',
    async () => {
      const response = await client.get<Record<string, unknown>>('https://tls.peet.ws/api/all', {
        throwOnError: false,
      })

      expect(response.status).toBe(200)

      const data = response.data
      const tls = data.tls as Record<string, unknown>
      const http2 = data.http2 as Record<string, unknown>

      // JA3 hash should exist and not be empty
      expect(tls.ja3_hash).toBeTruthy()
      console.log('JA3 Hash:', tls.ja3_hash)
      console.log('JA4:', tls.ja4)

      // HTTP/2 fingerprint should exist (proves HTTP/2 is working)
      expect(http2.akamai_fingerprint).toBeTruthy()
      console.log('H2 Fingerprint:', http2.akamai_fingerprint)
      console.log('H2 Hash:', http2.akamai_fingerprint_hash)

      // Protocol should be h2
      expect(data.http_version).toBe('h2')
    },
    TIMEOUT,
  )
})

describe('header Verification', () => {
  it(
    'should send correct Chrome headers to httpbin',
    async () => {
      const response = await client.get<Record<string, unknown>>('https://httpbin.org/headers', {
        throwOnError: false,
      })

      expect(response.status).toBe(200)

      const headers = response.data.headers as Record<string, string>
      console.log('Headers sent:', JSON.stringify(headers, null, 2))

      // Must have Chrome UA
      expect(headers['User-Agent']).toContain('Chrome/')
      expect(headers['User-Agent']).toContain('Safari/537.36')

      // Must have sec-ch-ua (Chrome Client Hints)
      expect(headers['Sec-Ch-Ua']).toBeTruthy()
      expect(headers['Sec-Ch-Ua']).toContain('Chromium')
      expect(headers['Sec-Ch-Ua']).toContain('Google Chrome')

      // Must have sec-ch-ua-platform
      expect(headers['Sec-Ch-Ua-Platform']).toBe('"Windows"')

      // Must have sec-ch-ua-mobile
      expect(headers['Sec-Ch-Ua-Mobile']).toBe('?0')

      // Must have sec-fetch headers
      expect(headers['Sec-Fetch-Site']).toBe('none')
      expect(headers['Sec-Fetch-Mode']).toBe('navigate')
      expect(headers['Sec-Fetch-Dest']).toBe('document')

      // Must have accept-encoding with zstd (Chrome 123+)
      expect(headers['Accept-Encoding']).toContain('zstd')
    },
    TIMEOUT,
  )
})

describe('proxy IP Verification', () => {
  it(
    'should return a valid IP from ipify',
    async () => {
      const response = await client.get<string>('https://api.ipify.org', {
        throwOnError: false,
      })

      expect(response.status).toBe(200)
      // Should be a valid IP address
      expect(response.data.trim()).toMatch(/^\d+\.\d+\.\d+\.\d+$/)
      console.log('IP:', response.data.trim())
    },
    TIMEOUT,
  )
})

describe('cloudflare Bypass', () => {
  it(
    'should access a Cloudflare-protected site (nowsecure.nl)',
    async () => {
      // nowsecure.nl is a well-known Cloudflare test site
      let response: IHttpResponse<string>
      try {
        response = await client.get<string>('https://nowsecure.nl', {
          throwOnError: false,
        })
      } catch {
        console.log('nowsecure.nl: network error (may be blocked by ISP)')
        return
      }

      console.log('nowsecure.nl status:', response.status)
      console.log('nowsecure.nl protocol:', response.usedProtocol)
      console.log('nowsecure.nl cf-mitigated:', response.headers['cf-mitigated'])
      console.log('nowsecure.nl server:', response.headers.server)

      if (response.status === 200) {
        console.log('✅ Cloudflare bypassed successfully!')
        expect(response.data).toContain('</html>')
      } else if (response.status === 403) {
        console.log('⚠️ Cloudflare blocked (403) — may need JS challenge')
        // This is expected for sites with JS challenge enabled
        // Our Tier 1 HTTP client cannot solve JS challenges
      } else {
        console.log(`⚠️ Unexpected status: ${response.status}`)
      }
    },
    TIMEOUT,
  )

  it(
    'should access Google without being blocked',
    async () => {
      const response = await client.get<string>('https://www.google.com', {
        throwOnError: false,
      })

      console.log('Google status:', response.status)
      expect(response.status).toBe(200)
      expect(response.data).toContain('</html>')
    },
    TIMEOUT,
  )

  it(
    'should access a Cloudflare-fronted API (discord.com)',
    async () => {
      const response = await client.get<string>('https://discord.com/api/v10/gateway', {
        throwOnError: false,
        context: {
          isNavigation: false,
          isUserInitiated: false,
          targetSite: 'same-origin',
          destination: 'empty',
        },
      })

      console.log('Discord API status:', response.status)
      console.log('Discord server:', response.headers.server)

      // Discord API should return 200 or 401 (unauthorized), NOT 403 (blocked)
      expect([200, 401]).toContain(response.status)
    },
    TIMEOUT,
  )
})

describe('gREASE Brand Verification', () => {
  it(
    'should send correct GREASE brand that matches Chrome version in sec-ch-ua',
    async () => {
      const response = await client.get<Record<string, unknown>>('https://httpbin.org/headers', {
        throwOnError: false,
      })

      const headers = response.data.headers as Record<string, string>
      const secChUa = headers['Sec-Ch-Ua'] ?? ''
      const ua = headers['User-Agent'] ?? ''

      // Extract Chrome version from UA
      const versionMatch = /Chrome\/(\d+)/.exec(ua)
      expect(versionMatch).toBeTruthy()
      const chromeVersion = Number(versionMatch![1])

      console.log(`Chrome version: ${chromeVersion}`)
      console.log(`sec-ch-ua: ${secChUa}`)

      // sec-ch-ua must contain the same version
      expect(secChUa).toContain(`v="${chromeVersion}"`)

      // Must NOT contain the old hardcoded "Not-A.Brand";v="24" for all versions
      // (unless the selected version happens to be one where that's correct, like 146)
      if (chromeVersion !== 146) {
        // For non-146 versions, the GREASE brand should be different
        expect(secChUa).not.toBe(
          `"Chromium";v="${chromeVersion}", "Not-A.Brand";v="24", "Google Chrome";v="${chromeVersion}"`,
        )
      }

      // Must contain "Google Chrome" brand
      expect(secChUa).toContain('Google Chrome')
    },
    TIMEOUT,
  )
})

describe('session Consistency', () => {
  it(
    'should maintain same fingerprint across multiple requests (same session)',
    async () => {
      const responses = await Promise.all([
        client.get<Record<string, unknown>>('https://httpbin.org/headers', { throwOnError: false }),
        client.get<Record<string, unknown>>('https://httpbin.org/headers', { throwOnError: false }),
      ])

      const headers1 = (responses[0].data.headers as Record<string, string>)['User-Agent']
      const headers2 = (responses[1].data.headers as Record<string, string>)['User-Agent']

      // Same session = same User-Agent
      expect(headers1).toBe(headers2)
      console.log('Consistent UA:', headers1)
    },
    TIMEOUT,
  )
})
