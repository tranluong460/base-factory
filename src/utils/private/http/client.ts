import { BaseClass } from '@vitechgroup/mkt-elec-core'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { createStealthAgent, generateHeaders } from './fingerprint'
import { setupInterceptors } from './interceptors'
import { createProxyAgents } from './proxy'
import type {
  BrowserHeaders,
  FingerprintConfig,
  HttpClientConfig,
  ProgressCallbacks,
  ProgressEvent,
  ProxyConfig,
  ResolvedLoggingConfig,
} from './types'

/**
 * HTTP client with proxy support, fingerprint evasion, and interceptors.
 */
export class HttpClient extends BaseClass {
  private readonly client: AxiosInstance
  private _proxy?: ProxyConfig
  private _fingerprintConfig?: FingerprintConfig

  constructor(config: HttpClientConfig) {
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

  // ==================== HTTP Methods ====================

  /** GET request */
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.get<T>(url, this.withProgress(config, progress))
    return response.data
  }

  /** POST request */
  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, this.withProgress(config, progress))
    return response.data
  }

  /** PUT request */
  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, this.withProgress(config, progress))
    return response.data
  }

  /** PATCH request */
  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, this.withProgress(config, progress))
    return response.data
  }

  /** DELETE request */
  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.delete<T>(url, this.withProgress(config, progress))
    return response.data
  }

  /** Custom request */
  async request<T = unknown>(config: AxiosRequestConfig, progress?: ProgressCallbacks): Promise<T> {
    const response = await this.client.request<T>(this.withProgress(config, progress))
    return response.data
  }

  // ==================== Proxy Methods ====================

  /** Set proxy at runtime */
  setProxy(proxy: ProxyConfig): void {
    this._proxy = proxy
    const agents = createProxyAgents(proxy)
    this.client.defaults.httpAgent = agents.httpAgent
    this.client.defaults.httpsAgent = agents.httpsAgent
  }

  /** Remove proxy */
  removeProxy(): void {
    this._proxy = undefined
    this.client.defaults.httpAgent = undefined
    this.client.defaults.httpsAgent = undefined
  }

  /** Get current proxy config */
  getProxy(): ProxyConfig | undefined {
    return this._proxy
  }

  /** Check if proxy is configured */
  hasProxy(): boolean {
    return this._proxy !== undefined
  }

  // ==================== Fingerprint Methods ====================

  /** Get current fingerprint config */
  getFingerprintConfig(): FingerprintConfig | undefined {
    return this._fingerprintConfig
  }

  /** Generate new browser headers (useful for rotation) */
  generateBrowserHeaders(): BrowserHeaders | undefined {
    if (!this._fingerprintConfig?.enabled && !this._fingerprintConfig?.preset) {
      return undefined
    }
    return generateHeaders(this._fingerprintConfig)
  }

  /** Update fingerprint headers (for rotation between requests) */
  rotateFingerprintHeaders(): void {
    const headers = this.generateBrowserHeaders()
    if (headers) {
      this.applyBrowserHeaders(headers)
    }
  }

  // ==================== Utility Methods ====================

  /** Get underlying Axios instance */
  getAxiosInstance(): AxiosInstance {
    return this.client
  }

  /** Set request headers */
  setHeaders(headers: Record<string, string | number | boolean>): void {
    for (const [key, value] of Object.entries(headers)) {
      this.client.defaults.headers.common[key] = String(value)
    }
  }

  /** Remove a header */
  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key]
  }

  /** Set request timeout */
  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout
  }

  // ==================== Private Methods ====================

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
      axiosConfig.httpsAgent = createStealthAgent()
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

  /** Enhance config with progress callbacks */
  private withProgress(
    config: AxiosRequestConfig = {},
    progress?: ProgressCallbacks,
  ): AxiosRequestConfig {
    if (!progress) {
      return config
    }

    const enhanced = { ...config }

    if (progress.onUploadProgress) {
      enhanced.onUploadProgress = (e) => {
        const total = e.total || 0
        const percentage = total > 0 ? Math.round((e.loaded * 100) / total) : 0
        const event: ProgressEvent = { loaded: e.loaded, total, percentage }
        progress.onUploadProgress?.(event)
      }
    }

    if (progress.onDownloadProgress) {
      enhanced.onDownloadProgress = (e) => {
        const total = e.total || 0
        const percentage = total > 0 ? Math.round((e.loaded * 100) / total) : 0
        const event: ProgressEvent = { loaded: e.loaded, total, percentage }
        progress.onDownloadProgress?.(event)
      }
    }

    return enhanced
  }
}
