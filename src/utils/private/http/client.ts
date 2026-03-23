import type { SessionClient, TlsClientResponse } from 'tlsclientwrapper'
import type {
  FingerprintPreset,
  IHttpClientConfig,
  IHttpResponse,
  IProxyConfig,
  IRequestConfig,
  ISessionConfig,
} from './core/types'
import {
  AcceptChTracker,
  RefererPolicy,
  executeWithBlockRetry,
  extractCfClearance,
} from './anti-detect'
import { handleChallenge } from './challenge'
import { NetworkError, TimeoutError } from './core/errors'
import { formatProxyUrl } from './core/proxy'
import { buildSecFetchHeaders } from './fingerprint/header-generator'
import { SessionManager } from './session'

const DEFAULT_SESSION_ID = '__default__'
const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_BLOCK_RETRIES = 2

/**
 * HTTP client with TLS/HTTP2 fingerprint impersonation.
 * Uses tlsclientwrapper (bogdanfinn/tls-client FFI) for browser-grade fingerprints.
 */
export class HttpClient {
  private readonly config: IHttpClientConfig
  private readonly sessionManager: SessionManager
  private readonly refererPolicy = new RefererPolicy()
  private readonly acceptChTracker = new AcceptChTracker()
  private initPromise: Promise<void> | null = null

  constructor(config: IHttpClientConfig = {}) {
    this.config = config
    this.sessionManager = new SessionManager(config.maxThreads ?? 4)
  }

  // ─── HTTP Methods ──────────────────────────────────────────

  async get<T = string>(url: string, config?: IRequestConfig): Promise<IHttpResponse<T>> {
    return this.request<T>('GET', url, undefined, config)
  }

  async post<T = string>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>('POST', url, data, config)
  }

  async put<T = string>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>('PUT', url, data, config)
  }

  async patch<T = string>(
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IHttpResponse<T>> {
    return this.request<T>('PATCH', url, data, config)
  }

  async delete<T = string>(url: string, config?: IRequestConfig): Promise<IHttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config)
  }

  async head(url: string, config?: IRequestConfig): Promise<IHttpResponse<string>> {
    return this.request<string>('HEAD', url, undefined, config)
  }

  // ─── Session Management ────────────────────────────────────

  async createSession(id: string, config: ISessionConfig): Promise<void> {
    await this.sessionManager.createSession(id, config)
  }

  async destroySession(id: string): Promise<void> {
    await this.sessionManager.destroySession(id)
  }

  async rotateProxy(sessionId: string, proxy: IProxyConfig): Promise<void> {
    await this.sessionManager.rotateProxy(sessionId, proxy)
  }

  async rotateFingerprint(sessionId: string): Promise<void> {
    await this.sessionManager.rotateFingerprint(sessionId)
  }

  async destroy(): Promise<void> {
    await this.sessionManager.destroyAll()
    this.refererPolicy.clear()
    this.acceptChTracker.clear()
    this.initPromise = null
  }

  get cfTracker(): SessionManager['cfTracker'] {
    return this.sessionManager.cfTracker
  }

  getPoolStats(): ReturnType<SessionManager['getPoolStats']> {
    return this.sessionManager.getPoolStats()
  }

  getTimezone(sessionId?: string): string | undefined {
    return this.sessionManager.getTimezone(sessionId ?? DEFAULT_SESSION_ID)
  }

  // ─── Internal ──────────────────────────────────────────────

  private ensureDefaultSession(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.sessionManager
        .createSession(DEFAULT_SESSION_ID, {
          profile: this.config.fingerprint,
          proxy: this.config.proxy,
          timeout: this.config.timeout ?? DEFAULT_TIMEOUT_MS,
        })
        .then(() => {})
    }
    return this.initPromise!
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: IRequestConfig,
  ): Promise<IHttpResponse<T>> {
    const sessionId = config?.sessionId ?? DEFAULT_SESSION_ID

    if (sessionId === DEFAULT_SESSION_ID) {
      await this.ensureDefaultSession()
    }

    const fullUrl = this.config.baseURL ? `${this.config.baseURL}${url}` : url

    const solver = this.config.challengeSolver
    const proxyUrl = this.config.proxy ? formatProxyUrl(this.config.proxy) : undefined

    return executeWithBlockRetry<T>(
      {
        executeFn: () => this.executeRequest<T>(method, fullUrl, data, config, sessionId),
        rotateFn: () => this.sessionManager.rotateFingerprint(sessionId).then(() => {}),
        maxRetries: this.config.blockRetries ?? DEFAULT_BLOCK_RETRIES,
        onSuccess: (result) => {
          extractCfClearance(sessionId, result.cookies, this.sessionManager.cfTracker)
          this.acceptChTracker.processResponse(fullUrl, result.headers)
          this.refererPolicy.trackUrl(sessionId, fullUrl)
        },
        challengeSolver: solver
          ? async (result) => {
            const body = typeof result.data === 'string' ? result.data : ''
            const { solved, cfClearance } = await handleChallenge(solver, fullUrl, body, proxyUrl)
            if (solved && cfClearance) {
              this.sessionManager.cfTracker.setClearance(sessionId, cfClearance)
            }
            return solved
          }
          : undefined,
      },
      config?.throwOnError ?? true,
    )
  }

  private async executeRequest<T>(
    method: string,
    fullUrl: string,
    data: unknown | undefined,
    config: IRequestConfig | undefined,
    sessionId: string,
  ): Promise<IHttpResponse<T>> {
    const session = this.sessionManager.getSession(sessionId)
    if (!session) {
      throw new NetworkError(`[HttpClient] Session '${sessionId}' not found`)
    }

    const mergedHeaders = { ...this.config.headers, ...config?.headers }

    // Referer policy
    const referer = this.refererPolicy.getReferer(sessionId, fullUrl)
    if (referer && !mergedHeaders.referer && !mergedHeaders.Referer) {
      mergedHeaders.referer = referer
    }

    // Dynamic sec-fetch-* per request context (always applied — simulates real user behavior)
    Object.assign(mergedHeaders, buildSecFetchHeaders(config?.context))

    // Accept-CH high-entropy Client Hints (fixed: use actual majorVersion from session headers)
    const secChUa = mergedHeaders['sec-ch-ua'] ?? ''
    const majorVersion = this.extractMajorFromSecChUa(secChUa)
    Object.assign(
      mergedHeaders,
      this.acceptChTracker.getHeaders(fullUrl, majorVersion, secChUa, '15.0.0'),
    )

    if (data && typeof data === 'object') {
      mergedHeaders['content-type'] ??= 'application/json'
    }

    const tlsOptions = {
      headers: Object.keys(mergedHeaders).length > 0 ? mergedHeaders : undefined,
      requestCookies: config?.cookies,
      followRedirects: config?.followRedirects ?? true,
      timeoutSeconds: config?.timeout ? Math.ceil(config.timeout / 1000) : undefined,
      ...config?.tlsOptions,
    }

    this.config.hooks?.onRequest?.({ method, url: fullUrl, sessionId, headers: mergedHeaders })

    const startTime = Date.now()
    let response: TlsClientResponse

    try {
      response = await this.sendRequest(session, method, fullUrl, data, tlsOptions)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const wrapped
        = message.includes('timeout') || message.includes('Timeout')
          ? new TimeoutError(
            `[HttpClient] Request timed out for ${fullUrl}`,
            config?.timeout ?? DEFAULT_TIMEOUT_MS,
          )
          : new NetworkError(`[HttpClient] Network error for ${fullUrl}: ${message}`)
      this.config.hooks?.onError?.({ method, url: fullUrl, sessionId, error: wrapped })
      throw wrapped
    }

    const duration = Date.now() - startTime
    this.config.hooks?.onResponse?.({
      method,
      url: fullUrl,
      sessionId,
      status: response.status,
      duration,
      headers: response.headers,
    })

    return {
      status: response.status,
      headers: response.headers,
      data: this.parseBody<T>(response.body, response.headers),
      cookies: response.cookies,
      usedProtocol: response.usedProtocol,
      retryCount: response.retryCount,
      duration,
    }
  }

  private async sendRequest(
    session: SessionClient,
    method: string,
    url: string,
    data: unknown | undefined,
    options: Record<string, unknown>,
  ): Promise<TlsClientResponse> {
    switch (method) {
      case 'POST':
        return session.post(url, data as string | object | null, options)
      case 'PUT':
        return session.put(url, data as string | object | null, options)
      case 'PATCH':
        return session.patch(url, data as string | object | null, options)
      case 'DELETE':
        return session.delete(url, options)
      case 'HEAD':
        return session.head(url, options)
      default:
        return session.get(url, options)
    }
  }

  private extractMajorFromSecChUa(secChUa: string): number {
    const match = /v="(\d+)"/.exec(secChUa)
    return match ? Number(match[1]) : 0
  }

  private parseBody<T>(body: string, headers: Record<string, string>): T {
    const ct = headers['content-type'] ?? headers['Content-Type'] ?? ''
    if (ct.includes('application/json')) {
      try {
        return JSON.parse(body) as T
      } catch {
        return body as T
      }
    }
    return body as T
  }
}

export function createHttpClient(config?: IHttpClientConfig): HttpClient {
  return new HttpClient(config)
}

export async function quickFetch<T = string>(
  url: string,
  options?: {
    method?: string
    data?: unknown
    preset?: FingerprintPreset
    proxy?: IProxyConfig
    headers?: Record<string, string>
    timeout?: number
    throwOnError?: boolean
  },
): Promise<IHttpResponse<T>> {
  const client = new HttpClient({
    fingerprint: options?.preset ? { preset: options.preset } : undefined,
    proxy: options?.proxy,
    headers: options?.headers,
    timeout: options?.timeout,
  })

  try {
    const requestConfig: IRequestConfig = { throwOnError: options?.throwOnError }
    const method = options?.method?.toUpperCase() ?? 'GET'
    switch (method) {
      case 'POST':
        return await client.post<T>(url, options?.data, requestConfig)
      case 'PUT':
        return await client.put<T>(url, options?.data, requestConfig)
      case 'PATCH':
        return await client.patch<T>(url, options?.data, requestConfig)
      case 'DELETE':
        return await client.delete<T>(url, requestConfig)
      default:
        return await client.get<T>(url, requestConfig)
    }
  } finally {
    await client.destroy()
  }
}
