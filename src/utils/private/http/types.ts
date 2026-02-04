import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ICoreLogger } from '@vitechgroup/mkt-elec-core'
import type { HttpError } from './errors'

// ==================== Proxy ====================

/** Proxy authentication */
export interface ProxyAuth {
  username: string
  password: string
}

/** Proxy configuration for HTTP/HTTPS/SOCKS */
export interface ProxyConfig {
  host: string
  port: number
  auth?: ProxyAuth
  protocol?: 'http' | 'https' | 'socks4' | 'socks5'
}

// ==================== Progress ====================

/** Progress event data */
export interface ProgressEvent {
  loaded: number
  total?: number
  percentage: number
}

/** Progress callbacks for upload/download tracking */
export interface ProgressCallbacks {
  onUploadProgress?: (event: ProgressEvent) => void
  onDownloadProgress?: (event: ProgressEvent) => void
}

// ==================== Logging ====================

/** Logging configuration */
export interface LoggingConfig {
  logRequests?: boolean
  logResponses?: boolean
  logErrors?: boolean
  logPerformance?: boolean
  logger?: ICoreLogger
}

/** Resolved logging config with all fields required */
export type ResolvedLoggingConfig = Required<LoggingConfig>

// ==================== Fingerprint ====================

/** Supported browser names */
export type BrowserName = 'chrome' | 'firefox' | 'safari' | 'edge'

/** Supported operating systems */
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios'

/** Device type */
export type DeviceType = 'desktop' | 'mobile'

/** Desktop presets */
export type DesktopPreset =
  | 'CHROME_WINDOWS'
  | 'CHROME_MACOS'
  | 'CHROME_LINUX'
  | 'FIREFOX_WINDOWS'
  | 'FIREFOX_MACOS'
  | 'FIREFOX_LINUX'
  | 'SAFARI_MACOS'
  | 'EDGE_WINDOWS'

/** Mobile presets */
export type MobilePreset = 'CHROME_ANDROID' | 'CHROME_IOS' | 'FIREFOX_ANDROID' | 'SAFARI_IOS'

/** All available presets */
export type FingerprintPreset = DesktopPreset | MobilePreset

/** Fingerprint configuration */
export interface FingerprintConfig {
  /** Enable fingerprint generation */
  enabled?: boolean
  /** Use preset configuration (recommended) */
  preset?: FingerprintPreset
  /** Locale preferences (e.g., 'en-US', 'vi-VN') */
  locales?: string[]
  /** Shuffle TLS ciphers */
  shuffleCiphers?: boolean
  /**
   * Seed for consistent fingerprint generation.
   * Same seed = same fingerprint. Useful for maintaining identity per account.
   */
  seed?: string
}

/** Generated browser headers */
export interface BrowserHeaders {
  'user-agent': string
  'accept': string
  'accept-language': string
  'accept-encoding': string
  /** Low entropy Client Hints (sent by default) */
  'sec-ch-ua'?: string
  'sec-ch-ua-mobile'?: string
  'sec-ch-ua-platform'?: string
  /** High entropy Client Hints (only sent when server requests via Accept-CH) */
  'sec-ch-ua-full-version-list'?: string
  'sec-ch-ua-model'?: string
  'sec-ch-ua-platform-version'?: string
  'sec-ch-ua-arch'?: string
  'sec-ch-ua-bitness'?: string
  'sec-ch-ua-wow64'?: string
  /** Sec-Fetch headers */
  'sec-fetch-dest'?: string
  'sec-fetch-mode'?: string
  'sec-fetch-site'?: string
  'sec-fetch-user'?: string
  /** Other common headers */
  'upgrade-insecure-requests'?: string
  'dnt'?: string
  'connection'?: string
  /** Priority header (Chrome/Firefox 124+) - RFC 9218 */
  'priority'?: string
  /** Allow custom headers */
  [key: string]: string | undefined
}

/** Preset configuration data */
export interface PresetData {
  browser: BrowserName
  version: { min: number, max: number }
  os: OperatingSystem
  device: DeviceType
}

// ==================== HTTP Client ====================

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

// ==================== Axios Module Augmentation ====================

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: { startTime: number }
  }
}
