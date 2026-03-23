import { beforeEach, describe, expect, it } from 'vitest'
import { AcceptChTracker } from '../../src/utils/private/http/anti-detect/accept-ch'

describe('acceptChTracker', () => {
  let tracker: AcceptChTracker

  beforeEach(() => {
    tracker = new AcceptChTracker()
  })

  it('stores hints per origin from Accept-CH response header', () => {
    tracker.processResponse('https://example.com/page', {
      'accept-ch': 'sec-ch-ua-arch, sec-ch-ua-bitness',
    })

    const headers = tracker.getHeaders('https://example.com/other', 146, '"Chromium"', '15.0.0')

    expect(headers['sec-ch-ua-arch']).toBe('"x86"')
    expect(headers['sec-ch-ua-bitness']).toBe('"64"')
  })

  it('returns empty object when no hints stored for origin', () => {
    const headers = tracker.getHeaders('https://unknown.com/page', 146, '"Chromium"', '15.0.0')

    expect(headers).toEqual({})
  })

  it('returns empty object when response has no Accept-CH header', () => {
    tracker.processResponse('https://example.com/page', {
      'content-type': 'text/html',
    })

    const headers = tracker.getHeaders('https://example.com/other', 146, '"Chromium"', '15.0.0')

    expect(headers).toEqual({})
  })

  it('generates sec-ch-ua-full-version-list with patch version format', () => {
    tracker.processResponse('https://example.com/', {
      'accept-ch': 'sec-ch-ua-full-version-list',
    })

    const secChUa = '"Not-A.Brand";v="146", "Chromium";v="146", "Google Chrome";v="146"'
    const headers = tracker.getHeaders('https://example.com/api', 146, secChUa, '15.0.0')

    // Should replace v="146" with v="146.0.6245.0" (6099 + 146 = 6245)
    expect(headers['sec-ch-ua-full-version-list']).toContain('v="146.0.6245.0"')
  })

  it('generates sec-ch-ua-platform-version when requested', () => {
    tracker.processResponse('https://example.com/', {
      'accept-ch': 'sec-ch-ua-platform-version',
    })

    const headers = tracker.getHeaders('https://example.com/api', 146, '', '15.0.0')

    expect(headers['sec-ch-ua-platform-version']).toBe('"15.0.0"')
  })

  it('generates sec-ch-ua-model as empty string when requested', () => {
    tracker.processResponse('https://example.com/', {
      'accept-ch': 'sec-ch-ua-model',
    })

    const headers = tracker.getHeaders('https://example.com/api', 146, '', '15.0.0')

    expect(headers['sec-ch-ua-model']).toBe('""')
  })

  it('handles Accept-CH header with mixed case', () => {
    tracker.processResponse('https://example.com/', {
      'Accept-CH': 'sec-ch-ua-arch',
    })

    const headers = tracker.getHeaders('https://example.com/api', 146, '', '15.0.0')

    expect(headers['sec-ch-ua-arch']).toBe('"x86"')
  })

  it('only returns hints for the origin that requested them', () => {
    tracker.processResponse('https://site-a.com/', {
      'accept-ch': 'sec-ch-ua-arch',
    })

    const headersA = tracker.getHeaders('https://site-a.com/page', 146, '', '15.0.0')
    const headersB = tracker.getHeaders('https://site-b.com/page', 146, '', '15.0.0')

    expect(headersA['sec-ch-ua-arch']).toBe('"x86"')
    expect(headersB).toEqual({})
  })

  it('clear removes all tracking', () => {
    tracker.processResponse('https://example.com/', {
      'accept-ch': 'sec-ch-ua-arch',
    })
    tracker.clear()

    const headers = tracker.getHeaders('https://example.com/api', 146, '', '15.0.0')

    expect(headers).toEqual({})
  })
})
