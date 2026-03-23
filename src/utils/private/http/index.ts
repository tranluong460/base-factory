// Client
export { HttpClient, createHttpClient, quickFetch } from './client'

// Core (types, errors, proxy)
export type {
  FingerprintPreset,
  IBrowserProfile,
  IErrorHookInfo,
  IFingerprintConfig,
  IHttpClientConfig,
  IHttpResponse,
  IProxyConfig,
  IRequestConfig,
  IRequestContext,
  IRequestHookInfo,
  IRequestHooks,
  IResponseHookInfo,
  ISessionConfig,
  ITimingPolicy,
} from './core'
export {
  AuthenticationError,
  BlockedError,
  HttpError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
  classifyError,
  formatProxyUrl,
  isAuthenticationError,
  isBlockedError,
  isCloudflareBlock,
  isHttpError,
  isNetworkError,
  isNotFoundError,
  isRateLimitError,
  isServerError,
  isTimeoutError,
  isValidationError,
} from './core'

// Session
export { CfClearanceTracker, SessionManager } from './session'

// Challenge (CapSolver — no browser binary)
export type { ICapSolverConfig, IChallengeResult, IChallengeSolver } from './challenge'
export { CapSolver, handleChallenge, isCloudflareChallengePage } from './challenge'

// Fingerprint
export { buildSecFetchHeaders, generateProfile, generateRandomProfile } from './fingerprint'

// Utils (behavior, verify)
export type { IGeoLocaleConfig } from './utils'
export {
  getGeoLocale,
  getSupportedCountryCodes,
  navigateFlow,
  navigationDelay,
  randomDelay,
  readingDelay,
  thinkingDelay,
  verifyAll,
  verifyFingerprint,
  verifyHeaders,
  verifyProxy,
} from './utils'
