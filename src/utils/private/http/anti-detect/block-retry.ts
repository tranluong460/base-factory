import type { IHttpResponse } from '../core/types'
import { BlockedError, NetworkError, classifyError } from '../core/errors'
import { randomDelay } from '../utils/behavior'

export interface IBlockRetryOptions<T> {
  /** Function that executes the actual HTTP request */
  executeFn: () => Promise<IHttpResponse<T>>
  /** Function to rotate fingerprint on block detection */
  rotateFn: () => Promise<void>
  /** Max number of block retries (default: 2) */
  maxRetries: number
  /** Called on successful response */
  onSuccess?: (result: IHttpResponse<T>) => void
  /** Optional challenge solver — called before fingerprint rotation */
  challengeSolver?: (result: IHttpResponse<T>) => Promise<boolean>
}

/**
 * Execute request with Cloudflare block detection, optional challenge solving,
 * and fingerprint rotation retry with exponential backoff.
 *
 * Flow: request → if blocked → try challenge solve → if unsolved → rotate fingerprint → backoff → retry
 */
export async function executeWithBlockRetry<T>(
  options: IBlockRetryOptions<T>,
  throwOnError: boolean,
): Promise<IHttpResponse<T>> {
  const { executeFn, rotateFn, maxRetries, onSuccess, challengeSolver } = options

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await executeFn()

    if (result.status < 400) {
      onSuccess?.(result)
      return result
    }

    const error = classifyError(result.status, result.headers, result.data as string, '')

    if (error instanceof BlockedError && attempt < maxRetries) {
      // Try challenge solver first (e.g. CapSolver) if configured
      if (challengeSolver) {
        const solved = await challengeSolver(result)
        if (solved) {
          continue
        }
      }

      // Fallback: rotate fingerprint + exponential backoff
      await rotateFn()
      const baseMs = 2000 * 2 ** attempt
      await randomDelay(baseMs, baseMs * 2.5)
      continue
    }

    if (!throwOnError) {
      return result
    }

    throw error
  }

  throw new NetworkError('[HttpClient] All block retries exhausted')
}
