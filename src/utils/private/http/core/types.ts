import type { ClientProfile, Cookie, TlsClientOptions } from 'tlsclientwrapper'

// ─── Fingerprint ───────────────────────────────────────────────

export type FingerprintPreset =
  | 'CHROME_WINDOWS'
  | 'CHROME_MACOS'
  | 'CHROME_LINUX'
  | 'FIREFOX_WINDOWS'
  | 'FIREFOX_MACOS'
  | 'FIREFOX_LINUX'
  | 'SAFARI_MACOS'
  | 'SAFARI_IOS'
  | 'EDGE_WINDOWS'
  | 'CHROME_ANDROID'

export interface IFingerprintConfig {
  enabled?: boolean
  preset?: FingerprintPreset
  locales?: string[]
  seed?: string
}

export interface ITlsProfileConfig {
  identifiers: ClientProfile[]
  os: string
  platform: string
  platformVersion: string
  uaTemplate: string
  secChUaPlatform: string
  mobile: boolean
  brands: IBrandEntry[]
}

export interface IBrandEntry {
  brand: string
  version: string
}

export interface IBrowserProfile {
  tlsIdentifier: ClientProfile
  userAgent: string
  headers: Record<string, string>
  headerOrder: string[]
  os: string
  platform: string
  mobile: boolean
}

// ─── Proxy ─────────────────────────────────────────────────────

export interface IProxyConfig {
  host: string
  port: number
  auth?: { username: string, password: string }
  protocol?: 'http' | 'https' | 'socks5'
}

// ─── Session ───────────────────────────────────────────────────

export interface ISessionConfig {
  profile?: IFingerprintConfig
  proxy?: IProxyConfig
  timeout?: number
  retryOnBlock?: boolean
  maxRetries?: number
  /** ISO 3166-1 alpha-2 country code for geo-consistent headers (e.g. 'VN', 'US', 'JP') */
  countryCode?: string
}

// ─── Request / Response ────────────────────────────────────────

/** Context for sec-fetch-* header generation. Matches real browser behavior per request type. */
export interface IRequestContext {
  /** true = page load / navigation, false = API call / resource fetch */
  isNavigation: boolean
  /** true = user-initiated (click/type), false = programmatic */
  isUserInitiated: boolean
  /** Relationship to current page origin */
  targetSite: 'none' | 'same-origin' | 'same-site' | 'cross-site'
  /** Resource type being fetched */
  destination: 'document' | 'empty' | 'image' | 'script' | 'style' | 'font' | 'iframe'
}

export interface IRequestConfig {
  headers?: Record<string, string>
  timeout?: number
  followRedirects?: boolean
  cookies?: Cookie[]
  tlsOptions?: Partial<TlsClientOptions>
  /** Route request through a named session (created via createSession) */
  sessionId?: string
  /** If false, return response instead of throwing on 4xx/5xx (default: true) */
  throwOnError?: boolean
  /** Request context for dynamic sec-fetch-* headers. Defaults to navigation. */
  context?: IRequestContext
}

export interface IHttpResponse<T = string> {
  status: number
  headers: Record<string, string>
  data: T
  cookies: Record<string, Cookie>
  usedProtocol?: string
  retryCount: number
  duration: number
}

// ─── Timing ───────────────────────────────────────────────────

/** Controls automatic human-like delays between requests per session. */
export interface ITimingPolicy {
  /** Enable automatic delays between requests (default: false) */
  enabled: boolean
  /** ms range for navigation requests (default: [2000, 8000]) */
  navigationRange?: [number, number]
  /** ms range for API/sub-resource requests (default: [200, 800]) */
  apiRange?: [number, number]
}

// ─── Client ────────────────────────────────────────────────────

export interface IHttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  proxy?: IProxyConfig
  fingerprint?: IFingerprintConfig
  maxThreads?: number
  /** Max retries when Cloudflare blocks request (rotates fingerprint each retry) */
  blockRetries?: number
  /** Event hooks for request/response logging and debugging */
  hooks?: IRequestHooks
  /** Challenge solver for Cloudflare JS challenges / Turnstile (e.g. CapSolver). No browser binary needed. */
  challengeSolver?: import('../challenge/types').IChallengeSolver
  /** Auto human-like timing between requests. Disabled by default. */
  timing?: ITimingPolicy
}

// ─── Hooks ─────────────────────────────────────────────────────

export interface IRequestHooks {
  /** Called before each request is sent */
  onRequest?: (info: IRequestHookInfo) => void
  /** Called after each response is received */
  onResponse?: (info: IResponseHookInfo) => void
  /** Called when an error occurs */
  onError?: (info: IErrorHookInfo) => void
}

export interface IRequestHookInfo {
  method: string
  url: string
  sessionId: string
  headers: Record<string, string>
}

export interface IResponseHookInfo {
  method: string
  url: string
  sessionId: string
  status: number
  duration: number
  headers: Record<string, string>
}

export interface IErrorHookInfo {
  method: string
  url: string
  sessionId: string
  error: Error
}
