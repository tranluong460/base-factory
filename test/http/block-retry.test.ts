import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IHttpResponse } from '../../src/utils/private/http/core/types'

// Mock randomDelay to avoid actual waiting in tests (ESM requires unstable_mockModule)
vi.mock('../../src/utils/private/http/utils/behavior', () => ({
  randomDelay: vi.fn().mockResolvedValue(undefined),
}))

const { executeWithBlockRetry }
  = await import('../../src/utils/private/http/anti-detect/block-retry')

function makeResponse<T>(
  status: number,
  data: T,
  headers: Record<string, string> = {},
): IHttpResponse<T> {
  return {
    status,
    headers,
    data,
    cookies: {},
    retryCount: 0,
    duration: 100,
  }
}

describe('executeWithBlockRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onSuccess on first successful response', async () => {
    const onSuccess = vi.fn()
    const response = makeResponse(200, 'ok')

    const result = await executeWithBlockRetry(
      {
        executeFn: vi.fn().mockResolvedValue(response),
        rotateFn: vi.fn(),
        maxRetries: 2,
        onSuccess,
      },
      true,
    )

    expect(result.status).toBe(200)
    expect(onSuccess).toHaveBeenCalledWith(response)
  })

  it('rotates fingerprint and retries on 403 Cloudflare block', async () => {
    const blockedResponse = makeResponse(403, 'blocked', {
      'cf-mitigated': 'challenge',
    })
    const okResponse = makeResponse(200, 'ok')

    const executeFn = vi
      .fn()
      .mockResolvedValueOnce(blockedResponse)
      .mockResolvedValueOnce(okResponse)

    const rotateFn = vi.fn().mockResolvedValue(undefined)

    const result = await executeWithBlockRetry(
      {
        executeFn,
        rotateFn,
        maxRetries: 2,
      },
      true,
    )

    expect(executeFn).toHaveBeenCalledTimes(2)
    expect(rotateFn).toHaveBeenCalledTimes(1)
    expect(result.status).toBe(200)
  })

  it('throws BlockedError when max retries exhausted on blocked response', async () => {
    const blockedResponse = makeResponse(403, 'blocked', {
      'cf-mitigated': 'challenge',
    })

    const executeFn = vi
      .fn()
      .mockResolvedValue(blockedResponse)
    const rotateFn = vi.fn().mockResolvedValue(undefined)

    await expect(
      executeWithBlockRetry(
        {
          executeFn,
          rotateFn,
          maxRetries: 2,
        },
        true,
      ),
    ).rejects.toThrow('Cloudflare blocked')

    // 1 initial + 2 retries = 3 total calls
    expect(executeFn).toHaveBeenCalledTimes(3)
    expect(rotateFn).toHaveBeenCalledTimes(2)
  })

  it('returns error response when throwOnError is false', async () => {
    const errorResponse = makeResponse(404, 'not found')

    const result = await executeWithBlockRetry(
      {
        executeFn: vi.fn().mockResolvedValue(errorResponse),
        rotateFn: vi.fn(),
        maxRetries: 2,
      },
      false,
    )

    expect(result.status).toBe(404)
  })

  it('calls challenge solver before fingerprint rotation', async () => {
    const callOrder: string[] = []
    const blockedResponse = makeResponse(403, 'blocked', {
      'cf-mitigated': 'challenge',
    })
    const okResponse = makeResponse(200, 'ok')

    const challengeSolver = vi
      .fn()
      .mockImplementation(async () => {
        callOrder.push('challenge')
        return false // Not solved, will fall through to rotation
      })

    const rotateFn = vi.fn().mockImplementation(async () => {
      callOrder.push('rotate')
    })

    const executeFn = vi
      .fn()
      .mockResolvedValueOnce(blockedResponse)
      .mockResolvedValueOnce(okResponse)

    await executeWithBlockRetry(
      {
        executeFn,
        rotateFn,
        maxRetries: 2,
        challengeSolver,
      },
      true,
    )

    expect(callOrder).toEqual(['challenge', 'rotate'])
    expect(challengeSolver).toHaveBeenCalledWith(blockedResponse)
  })

  it('skips rotation when challenge solver succeeds', async () => {
    const blockedResponse = makeResponse(403, 'blocked', {
      'cf-mitigated': 'challenge',
    })
    const okResponse = makeResponse(200, 'ok')

    const challengeSolver = vi
      .fn()
      .mockResolvedValue(true)
    const rotateFn = vi.fn()

    const executeFn = vi
      .fn()
      .mockResolvedValueOnce(blockedResponse)
      .mockResolvedValueOnce(okResponse)

    await executeWithBlockRetry(
      {
        executeFn,
        rotateFn,
        maxRetries: 2,
        challengeSolver,
      },
      true,
    )

    expect(challengeSolver).toHaveBeenCalledTimes(1)
    expect(rotateFn).not.toHaveBeenCalled()
  })

  it('throws on non-blocked 4xx errors with throwOnError=true', async () => {
    const errorResponse = makeResponse(401, 'unauthorized')

    await expect(
      executeWithBlockRetry(
        {
          executeFn: vi
            .fn()
            .mockResolvedValue(errorResponse),
          rotateFn: vi.fn(),
          maxRetries: 2,
        },
        true,
      ),
    ).rejects.toThrow()
  })
})
