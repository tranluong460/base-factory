import { BaseClass } from '@vitechgroup/mkt-elec-core'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ProgressCallbacks, ProxyConfig } from './types'

/**
 * Abstract base class providing public HTTP methods.
 * User-facing API for making HTTP requests.
 */
export abstract class PublicMethods extends BaseClass {
  protected abstract readonly client: AxiosInstance
  protected abstract _proxy?: ProxyConfig

  // ==================== HTTP Methods ====================

  /** GET request */
  public async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.get<T>(url, this.withProgress(config, progress))
    return response.data
  }

  /** POST request */
  public async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, this.withProgress(config, progress))
    return response.data
  }

  /** PUT request */
  public async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, this.withProgress(config, progress))
    return response.data
  }

  /** PATCH request */
  public async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, this.withProgress(config, progress))
    return response.data
  }

  /** DELETE request */
  public async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.delete<T>(url, this.withProgress(config, progress))
    return response.data
  }

  /** Custom request */
  public async request<T = unknown>(
    config: AxiosRequestConfig,
    progress?: ProgressCallbacks,
  ): Promise<T> {
    const response = await this.client.request<T>(this.withProgress(config, progress))
    return response.data
  }

  // ==================== Utility Methods ====================

  /** Get underlying Axios instance */
  public getAxiosInstance(): AxiosInstance {
    return this.client
  }

  /** Set request headers */
  public setHeaders(headers: Record<string, string | number | boolean>): void {
    Object.entries(headers).forEach(([key, value]) => {
      this.client.defaults.headers.common[key] = String(value)
    })
  }

  /** Remove a header */
  public removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key]
  }

  /** Set request timeout */
  public setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout
  }

  /** Get current proxy config */
  public getProxy(): ProxyConfig | undefined {
    return this._proxy
  }

  /** Check if proxy is configured */
  public hasProxy(): boolean {
    return this._proxy !== undefined
  }

  // ==================== Protected ====================

  /** Enhance config with progress callbacks */
  protected withProgress(
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
        progress.onUploadProgress?.({ loaded: e.loaded, total, percentage })
      }
    }

    if (progress.onDownloadProgress) {
      enhanced.onDownloadProgress = (e) => {
        const total = e.total || 0
        const percentage = total > 0 ? Math.round((e.loaded * 100) / total) : 0
        progress.onDownloadProgress?.({ loaded: e.loaded, total, percentage })
      }
    }

    return enhanced
  }
}
