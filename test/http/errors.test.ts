import { describe, expect, it } from 'vitest'
import {
  AuthenticationError,
  BlockedError,
  HttpError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
  classifyError,
  isAuthenticationError,
  isBlockedError,
  isCloudflareBlock,
  isHttpError,
  isNetworkError,
  isNotFoundError,
  isRateLimitError,
  isServerError,
  isValidationError,
} from '../../src/utils/private/http/core/errors'

describe('classifyError', () => {
  it('returns AuthenticationError for 401', () => {
    const error = classifyError(401, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error.status).toBe(401)
  })

  it('returns BlockedError for 403 with cf-mitigated header', () => {
    const error = classifyError(403, { 'cf-mitigated': 'challenge' }, '', 'https://api.com')

    expect(error).toBeInstanceOf(BlockedError)
    expect(error.status).toBe(403)
  })

  it('returns BlockedError for 403 with cloudflare server header', () => {
    const error = classifyError(403, { server: 'cloudflare' }, '', 'https://api.com')

    expect(error).toBeInstanceOf(BlockedError)
    expect(error.status).toBe(403)
  })

  it('returns NotFoundError for 404', () => {
    const error = classifyError(404, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.status).toBe(404)
  })

  it('returns RateLimitError for 429', () => {
    const error = classifyError(429, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(RateLimitError)
    expect(error.status).toBe(429)
  })

  it('returns ServerError for 500', () => {
    const error = classifyError(500, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(ServerError)
    expect(error.status).toBe(500)
  })

  it('returns ServerError for 502', () => {
    const error = classifyError(502, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(ServerError)
    expect(error.status).toBe(502)
  })

  it('returns ValidationError for other 4xx errors', () => {
    const error = classifyError(422, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(ValidationError)
    expect(error.status).toBe(422)
  })

  it('returns ValidationError for 403 without cloudflare markers', () => {
    const error = classifyError(403, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(ValidationError)
    expect(error.status).toBe(403)
  })

  it('returns HttpError for unexpected status codes', () => {
    const error = classifyError(399, {}, '', 'https://api.com')

    expect(error).toBeInstanceOf(HttpError)
    expect(error).not.toBeInstanceOf(ServerError)
    expect(error).not.toBeInstanceOf(ValidationError)
  })
})

describe('rateLimitError', () => {
  it('parses retry-after header as number', () => {
    const error = new RateLimitError('rate limited', { 'retry-after': '30' })

    expect(error.retryAfter).toBe(30)
  })

  it('sets retryAfter to undefined when header is missing', () => {
    const error = new RateLimitError('rate limited')

    expect(error.retryAfter).toBeUndefined()
  })

  it('sets retryAfter to undefined for non-numeric header', () => {
    const error = new RateLimitError('rate limited', { 'retry-after': 'Thu, 01 Jan 2099' })

    expect(error.retryAfter).toBeUndefined()
  })

  it('handles Retry-After with capital casing', () => {
    const error = new RateLimitError('rate limited', { 'Retry-After': '60' })

    expect(error.retryAfter).toBe(60)
  })
})

describe('isCloudflareBlock', () => {
  it('returns true for 403 with cf-mitigated challenge', () => {
    expect(isCloudflareBlock(403, { 'cf-mitigated': 'challenge' })).toBe(true)
  })

  it('returns true for 403 with Cf-Mitigated challenge', () => {
    expect(isCloudflareBlock(403, { 'Cf-Mitigated': 'challenge' })).toBe(true)
  })

  it('returns true for 403 with cloudflare server', () => {
    expect(isCloudflareBlock(403, { server: 'cloudflare' })).toBe(true)
  })

  it('returns true for 403 with Server: cloudflare (capital)', () => {
    expect(isCloudflareBlock(403, { Server: 'cloudflare' })).toBe(true)
  })

  it('returns false for non-403 status', () => {
    expect(isCloudflareBlock(200, { 'cf-mitigated': 'challenge' })).toBe(false)
    expect(isCloudflareBlock(500, { server: 'cloudflare' })).toBe(false)
  })

  it('returns false for 403 without cloudflare markers', () => {
    expect(isCloudflareBlock(403, {})).toBe(false)
    expect(isCloudflareBlock(403, { server: 'nginx' })).toBe(false)
  })
})

describe('type guards', () => {
  it('isHttpError identifies HttpError instances', () => {
    expect(isHttpError(new HttpError('test', 500))).toBe(true)
    expect(isHttpError(new BlockedError('test', 403))).toBe(true)
    expect(isHttpError(new Error('test'))).toBe(false)
    expect(isHttpError('string')).toBe(false)
  })

  it('isNetworkError identifies NetworkError instances', () => {
    expect(isNetworkError(new NetworkError('test'))).toBe(true)
    expect(isNetworkError(new HttpError('test', 0))).toBe(false)
  })

  it('isBlockedError identifies BlockedError instances', () => {
    expect(isBlockedError(new BlockedError('test', 403))).toBe(true)
    expect(isBlockedError(new HttpError('test', 403))).toBe(false)
  })

  it('isRateLimitError identifies RateLimitError instances', () => {
    expect(isRateLimitError(new RateLimitError('test'))).toBe(true)
    expect(isRateLimitError(new HttpError('test', 429))).toBe(false)
  })

  it('isAuthenticationError identifies AuthenticationError instances', () => {
    expect(isAuthenticationError(new AuthenticationError('test'))).toBe(true)
  })

  it('isNotFoundError identifies NotFoundError instances', () => {
    expect(isNotFoundError(new NotFoundError('test'))).toBe(true)
  })

  it('isValidationError identifies ValidationError instances', () => {
    expect(isValidationError(new ValidationError('test', 422))).toBe(true)
  })

  it('isServerError identifies ServerError instances', () => {
    expect(isServerError(new ServerError('test', 500))).toBe(true)
  })
})
