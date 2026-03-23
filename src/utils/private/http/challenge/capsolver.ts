import type { ICapSolverConfig, IChallengeResult, IChallengeSolver } from './types'

const CAPSOLVER_API = 'https://api.capsolver.com'
const DEFAULT_TIMEOUT = 120_000
const POLL_INTERVAL = 3000

/**
 * CapSolver API client for solving Cloudflare challenges without a browser binary.
 * Supports both Turnstile tokens and full Managed Challenge (cf_clearance).
 *
 * Pricing: ~$1.20 per 1000 solves
 * @see https://docs.capsolver.com/en/guide/captcha/cloudflare_challenge/
 */
export class CapSolver implements IChallengeSolver {
  private readonly apiKey: string
  private readonly timeout: number

  constructor(config: ICapSolverConfig) {
    this.apiKey = config.apiKey
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT
  }

  async solve(siteUrl: string, siteKey: string, proxy?: string): Promise<IChallengeResult> {
    const startTime = Date.now()

    const taskPayload: Record<string, unknown> = {
      type: proxy ? 'AntiCloudflareTask' : 'AntiTurnstileTaskProxyLess',
      websiteURL: siteUrl,
      websiteKey: siteKey,
    }

    if (proxy) {
      // CapSolver requires proxy in specific format
      const parsed = this.parseProxy(proxy)
      Object.assign(taskPayload, parsed)
    }

    // Create task
    const createResponse = await this.apiRequest<{
      taskId: string
      errorId: number
      errorDescription?: string
    }>('/createTask', { task: taskPayload })

    if (createResponse.errorId !== 0) {
      throw new Error(`[CapSolver] Create task failed: ${createResponse.errorDescription}`)
    }

    // Poll for result
    const result = await this.pollResult(createResponse.taskId)

    return {
      token: result.token ?? '',
      cfClearance: result.cookies?.cf_clearance,
      userAgent: result.userAgent,
      duration: Date.now() - startTime,
    }
  }

  private async pollResult(taskId: string): Promise<{
    token?: string
    cookies?: Record<string, string>
    userAgent?: string
  }> {
    const deadline = Date.now() + this.timeout

    while (Date.now() < deadline) {
      const response = await this.apiRequest<{
        status: string
        solution?: {
          token?: string
          cookies?: Record<string, string>
          userAgent?: string
        }
        errorId: number
        errorDescription?: string
      }>('/getTaskResult', { taskId })

      if (response.errorId !== 0) {
        throw new Error(`[CapSolver] Task failed: ${response.errorDescription}`)
      }

      if (response.status === 'ready' && response.solution) {
        return response.solution
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    }

    throw new Error(`[CapSolver] Task timed out after ${this.timeout}ms`)
  }

  private async apiRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${CAPSOLVER_API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientKey: this.apiKey, ...body }),
    })

    if (!response.ok) {
      throw new Error(`[CapSolver] API error: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as T
  }

  private parseProxy(proxyUrl: string): Record<string, string> {
    try {
      const url = new URL(proxyUrl)
      return {
        proxyType: url.protocol.replace(':', ''),
        proxyAddress: url.hostname,
        proxyPort: url.port,
        ...(url.username ? { proxyLogin: decodeURIComponent(url.username) } : {}),
        ...(url.password ? { proxyPassword: decodeURIComponent(url.password) } : {}),
      }
    } catch {
      return {}
    }
  }
}
