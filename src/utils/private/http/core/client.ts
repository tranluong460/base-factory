import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { createStealthAgent, generateHeaders } from '../fingerprint'
import { createProxyAgents, setupInterceptors } from '../helpers'
import { PublicMethods } from '../public-methods'
import type {
  BrowserHeaders,
  FingerprintConfig,
  HttpClientConfig,
  ProxyConfig,
  ResolvedLoggingConfig,
} from '../types'

/**
 * HTTP client with proxy support, fingerprint evasion, and interceptors.
 * Extends PublicMethods for user-facing API.
 */
export class HttpClient extends PublicMethods {
  protected readonly client: AxiosInstance
  protected _proxy?: ProxyConfig
  private _fingerprintConfig?: FingerprintConfig

  public constructor(config: HttpClientConfig) {
    super()
    this._proxy = config.proxy
    this._fingerprintConfig = config.fingerprint

    // Resolve logging config with defaults
    const loggingConfig: ResolvedLoggingConfig = {
      logRequests: false,
      logResponses: false,
      logErrors: true,
      logPerformance: false,
      logger: this.logger,
      ...config.logging,
    }

    // Create axios instance
    this.client = axios.create(this.buildAxiosConfig(config))

    // Setup interceptors
    setupInterceptors(this.client, config, loggingConfig)
  }

  /** Set proxy at runtime */
  public setProxy(proxy: ProxyConfig): void {
    this._proxy = proxy
    const agents = createProxyAgents(proxy)
    this.client.defaults.httpAgent = agents.httpAgent
    this.client.defaults.httpsAgent = agents.httpsAgent
  }

  /** Remove proxy */
  public removeProxy(): void {
    this._proxy = undefined
    this.client.defaults.httpAgent = undefined
    this.client.defaults.httpsAgent = undefined
  }

  /** Get current fingerprint config */
  public getFingerprintConfig(): FingerprintConfig | undefined {
    return this._fingerprintConfig
  }

  /** Generate new browser headers (useful for rotation) */
  public generateBrowserHeaders(): BrowserHeaders | undefined {
    if (!this._fingerprintConfig?.enabled && !this._fingerprintConfig?.preset) {
      return undefined
    }
    return generateHeaders(this._fingerprintConfig)
  }

  /** Update fingerprint headers (for rotation between requests) */
  public rotateFingerprintHeaders(): void {
    const headers = this.generateBrowserHeaders()
    if (headers) {
      this.applyBrowserHeaders(headers)
    }
  }

  // ==================== Private ====================

  /** Build axios config from HttpClientConfig */
  private buildAxiosConfig(config: HttpClientConfig): Record<string, unknown> {
    // Generate fingerprint headers if enabled
    let fingerprintHeaders: Record<string, string> = {}
    if (config.fingerprint?.enabled || config.fingerprint?.preset) {
      const browserHeaders = generateHeaders(config.fingerprint)
      fingerprintHeaders = this.convertBrowserHeaders(browserHeaders)
    }

    const axiosConfig: Record<string, unknown> = {
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        // Fingerprint headers first (can be overridden by user)
        ...fingerprintHeaders,
        // Default content-type (can be overridden)
        'Content-Type': 'application/json',
        // User headers last (highest priority)
        ...config.headers,
      },
    }

    // Add stealth agent if cipher shuffling is enabled
    if (config.fingerprint?.shuffleCiphers) {
      const stealthAgent = createStealthAgent()
      axiosConfig.httpsAgent = stealthAgent
    }

    // Add proxy agents if configured (overrides stealth agent for httpsAgent)
    if (config.proxy) {
      const agents = createProxyAgents(config.proxy)
      axiosConfig.httpAgent = agents.httpAgent
      axiosConfig.httpsAgent = agents.httpsAgent
    }

    return axiosConfig
  }

  /** Convert BrowserHeaders to plain Record */
  private convertBrowserHeaders(headers: BrowserHeaders): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) {
        result[key] = value
      }
    }
    return result
  }

  /** Apply browser headers to client defaults */
  private applyBrowserHeaders(headers: BrowserHeaders): void {
    const converted = this.convertBrowserHeaders(headers)
    for (const [key, value] of Object.entries(converted)) {
      this.client.defaults.headers.common[key] = value
    }
  }
}
