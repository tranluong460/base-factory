import { beforeEach, describe, expect, it } from 'vitest'
import { RefererPolicy } from '../../src/utils/private/http/anti-detect/referer-policy'

describe('refererPolicy', () => {
  let policy: RefererPolicy

  beforeEach(() => {
    policy = new RefererPolicy()
  })

  it('returns undefined when no previous URL tracked', () => {
    const referer = policy.getReferer('session-1', 'https://example.com/page')

    expect(referer).toBeUndefined()
  })

  it('returns full URL for same-origin requests', () => {
    policy.trackUrl('session-1', 'https://example.com/page-a?query=1')

    const referer = policy.getReferer('session-1', 'https://example.com/page-b')

    expect(referer).toBe('https://example.com/page-a?query=1')
  })

  it('returns origin only for cross-origin requests', () => {
    policy.trackUrl('session-1', 'https://example.com/page-a')

    const referer = policy.getReferer('session-1', 'https://other.com/page')

    expect(referer).toBe('https://example.com/')
  })

  it('returns undefined for HTTPS to HTTP downgrade', () => {
    policy.trackUrl('session-1', 'https://example.com/secure')

    const referer = policy.getReferer('session-1', 'http://example.com/insecure')

    expect(referer).toBeUndefined()
  })

  it('allows HTTP to HTTPS (upgrade)', () => {
    policy.trackUrl('session-1', 'http://example.com/page')

    const referer = policy.getReferer('session-1', 'https://example.com/secure')

    // Cross-scheme but same host is cross-origin, so origin-only
    expect(referer).toBe('http://example.com/')
  })

  it('track + get chain works across multiple navigations', () => {
    // Visit page A
    policy.trackUrl('s1', 'https://example.com/a')

    // Navigate to page B (same-origin)
    const ref1 = policy.getReferer('s1', 'https://example.com/b')
    expect(ref1).toBe('https://example.com/a')

    // Track page B
    policy.trackUrl('s1', 'https://example.com/b')

    // Navigate to page C (cross-origin)
    const ref2 = policy.getReferer('s1', 'https://other.com/c')
    expect(ref2).toBe('https://example.com/')
  })

  it('isolates sessions from each other', () => {
    policy.trackUrl('session-1', 'https://site-a.com/page')
    policy.trackUrl('session-2', 'https://site-b.com/page')

    const ref1 = policy.getReferer('session-1', 'https://site-a.com/other')
    const ref2 = policy.getReferer('session-2', 'https://site-b.com/other')

    expect(ref1).toBe('https://site-a.com/page')
    expect(ref2).toBe('https://site-b.com/page')
  })

  it('clearSession removes tracking for specific session', () => {
    policy.trackUrl('session-1', 'https://example.com/page')
    policy.clearSession('session-1')

    const referer = policy.getReferer('session-1', 'https://example.com/other')

    expect(referer).toBeUndefined()
  })

  it('clear removes all session tracking', () => {
    policy.trackUrl('s1', 'https://example.com/a')
    policy.trackUrl('s2', 'https://example.com/b')
    policy.clear()

    expect(policy.getReferer('s1', 'https://example.com/c')).toBeUndefined()
    expect(policy.getReferer('s2', 'https://example.com/d')).toBeUndefined()
  })
})
