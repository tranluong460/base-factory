import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { HttpError } from '../core'
import type { FingerprintConfig } from './fingerprint'
import type { LoggingConfig } from './logging'
import type { ProxyConfig } from './proxy'

/** HTTP client configuration */
export interface HttpClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  proxy?: ProxyConfig
  logging?: LoggingConfig
  /** Browser fingerprint configuration for stealth requests */
  fingerprint?: FingerprintConfig
  transformRequest?: (data: unknown, headers: Record<string, string>) => unknown
  transformResponse?: <T>(data: unknown) => T
  onRequest?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  onResponse?: <T>(response: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>
  onError?: (error: HttpError) => Promise<never> | never
}

// Axios module augmentation
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: { startTime: number }
  }
}
