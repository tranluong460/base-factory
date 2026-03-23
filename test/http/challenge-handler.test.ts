import { describe, expect, it, vi } from 'vitest'
import {
  extractTurnstileSiteKey,
  handleChallenge,
  isCloudflareChallengePage,
} from '../../src/utils/private/http/challenge/challenge-handler'
import type { IChallengeSolver } from '../../src/utils/private/http/challenge/types'

describe('isCloudflareChallengePage', () => {
  it('detects _cf_chl_opt in HTML', () => {
    const html = '<html><script>var _cf_chl_opt = {};</script></html>'

    expect(isCloudflareChallengePage(html)).toBe(true)
  })

  it('detects cf-challenge-running in HTML', () => {
    const html = '<html><div class="cf-challenge-running"></div></html>'

    expect(isCloudflareChallengePage(html)).toBe(true)
  })

  it('detects challenge-platform in HTML', () => {
    const html = '<html><div id="challenge-platform"></div></html>'

    expect(isCloudflareChallengePage(html)).toBe(true)
  })

  it('detects cf-turnstile in HTML', () => {
    const html = '<html><div class="cf-turnstile"></div></html>'

    expect(isCloudflareChallengePage(html)).toBe(true)
  })

  it('returns false for normal HTML', () => {
    const html = '<html><body><h1>Hello World</h1></body></html>'

    expect(isCloudflareChallengePage(html)).toBe(false)
  })
})

describe('extractTurnstileSiteKey', () => {
  it('extracts sitekey from data-sitekey attribute', () => {
    const html = '<div class="cf-turnstile" data-sitekey="0xABCDEF123456"></div>'

    expect(extractTurnstileSiteKey(html)).toBe('0xABCDEF123456')
  })

  it('extracts sitekey from sitekey: property', () => {
    const html = '<script>sitekey: "0x1234567890abcdef"</script>'

    expect(extractTurnstileSiteKey(html)).toBe('0x1234567890abcdef')
  })

  it('extracts sitekey from turnstileKey property', () => {
    const html = '<script>turnstileKey = "0xDEADBEEF"</script>'

    expect(extractTurnstileSiteKey(html)).toBe('0xDEADBEEF')
  })

  it('returns undefined when no sitekey found', () => {
    const html = '<html><body>No challenge here</body></html>'

    expect(extractTurnstileSiteKey(html)).toBeUndefined()
  })
})

describe('handleChallenge', () => {
  it('returns solved=false when page is not a challenge', async () => {
    const solver: IChallengeSolver = {
      solve: vi.fn() as IChallengeSolver['solve'],
    }

    const result = await handleChallenge(solver, 'https://example.com', '<html>Normal page</html>')

    expect(result.solved).toBe(false)
    expect(solver.solve).not.toHaveBeenCalled()
  })

  it('returns solved=false when no sitekey found in challenge page', async () => {
    const solver: IChallengeSolver = {
      solve: vi.fn() as IChallengeSolver['solve'],
    }

    const html = '<html><script>var _cf_chl_opt = {};</script></html>'
    const result = await handleChallenge(solver, 'https://example.com', html)

    expect(result.solved).toBe(false)
    expect(solver.solve).not.toHaveBeenCalled()
  })

  it('calls solver and returns result when challenge detected with sitekey', async () => {
    const solveFn = vi.fn().mockResolvedValue({
      token: 'solved-token',
      cfClearance: 'cf-clearance-value',
      userAgent: 'Mozilla/5.0',
      duration: 5000,
    }) as unknown as IChallengeSolver['solve']

    const solver: IChallengeSolver = { solve: solveFn }

    const html
      = '<html><script>var _cf_chl_opt = {};</script><div data-sitekey="0xABC123"></div></html>'
    const result = await handleChallenge(solver, 'https://example.com', html, 'http://proxy:8080')

    expect(result.solved).toBe(true)
    expect(result.cfClearance).toBe('cf-clearance-value')
    expect(result.userAgent).toBe('Mozilla/5.0')
    expect(solveFn).toHaveBeenCalledWith('https://example.com', '0xABC123', 'http://proxy:8080')
  })

  it('returns solved=false when solver throws', async () => {
    const solveFn = vi
      .fn()
      .mockRejectedValue(new Error('Solver failed')) as unknown as IChallengeSolver['solve']

    const solver: IChallengeSolver = { solve: solveFn }

    const html
      = '<html><script>var _cf_chl_opt = {};</script><div data-sitekey="0xABC123"></div></html>'
    const result = await handleChallenge(solver, 'https://example.com', html)

    expect(result.solved).toBe(false)
  })
})
