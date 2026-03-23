import { ModuleClient, SessionClient } from 'tlsclientwrapper'
import type { IFingerprintConfig, IProxyConfig, ISessionConfig } from '../core/types'
import { formatProxyUrl } from '../core/proxy'
import { generateProfile, generateRandomProfile } from '../fingerprint'
import { getGeoLocale } from '../utils/behavior'
import { CfClearanceTracker } from './cf-tracker'

interface IManagedSession {
  client: SessionClient
  config: ISessionConfig
  /** Resolved timezone for this session (from countryCode geo-locale) */
  timezone?: string
}

/**
 * Manages the lifecycle of TLS sessions.
 * Wraps ModuleClient (singleton worker pool) and SessionClient (per-session identity).
 */
export class SessionManager {
  private moduleClient: ModuleClient
  private sessions = new Map<string, IManagedSession>()
  private initialized = false
  readonly cfTracker = new CfClearanceTracker()

  constructor(maxThreads = 4) {
    this.moduleClient = new ModuleClient({ maxThreads })
  }

  /** Initialize the worker pool. Must be called before creating sessions. */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }
    await this.moduleClient.open()
    this.initialized = true
  }

  /** Create a new session with browser profile + proxy binding */
  async createSession(id: string, config: ISessionConfig): Promise<SessionClient> {
    await this.initialize()

    if (this.sessions.has(id)) {
      await this.destroySession(id)
    }

    const preset = config.profile?.preset ?? 'CHROME_WINDOWS'
    // Geo-consistency: auto-resolve locales from countryCode if not explicitly set
    const geoLocale = config.countryCode ? getGeoLocale(config.countryCode) : undefined
    const locales = config.profile?.locales ?? geoLocale?.locales
    const profile = config.profile?.seed
      ? generateProfile(config.profile.seed, preset, locales)
      : generateRandomProfile(preset, locales)

    const proxyUrl = config.proxy ? formatProxyUrl(config.proxy) : undefined

    const client = new SessionClient(this.moduleClient, {
      tlsClientIdentifier: profile.tlsIdentifier,
      proxyUrl,
      timeoutSeconds: config.timeout ? Math.ceil(config.timeout / 1000) : 30,
      defaultHeaders: profile.headers,
      headerOrder: profile.headerOrder,
      followRedirects: true,
      retryIsEnabled: config.retryOnBlock ?? true,
      retryMaxCount: config.maxRetries ?? 3,
      retryStatusCodes: [408, 429, 500, 502, 503, 504, 521, 522, 523, 524],
    })

    this.sessions.set(id, { client, config, timezone: geoLocale?.timezone })
    return client
  }

  /** Get resolved timezone for a session (from countryCode geo-locale) */
  getTimezone(id: string): string | undefined {
    return this.sessions.get(id)?.timezone
  }

  /** Get an existing session's client */
  getSession(id: string): SessionClient | undefined {
    return this.sessions.get(id)?.client
  }

  /** Check if a session exists */
  hasSession(id: string): boolean {
    return this.sessions.has(id)
  }

  /** Destroy a single session and free its resources */
  async destroySession(id: string): Promise<void> {
    const managed = this.sessions.get(id)
    if (!managed) {
      return
    }
    await managed.client.destroySession()
    this.cfTracker.removeClearance(id)
    this.sessions.delete(id)
  }

  /** Destroy all sessions and terminate the worker pool */
  async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(this.sessions.keys()).map((id) => this.destroySession(id))
    await Promise.all(destroyPromises)
    this.cfTracker.clear()

    if (this.initialized) {
      await this.moduleClient.terminate()
      this.initialized = false
    }
  }

  /** Update proxy for an existing session by recreating it */
  async rotateProxy(id: string, proxy: IProxyConfig): Promise<SessionClient> {
    const managed = this.sessions.get(id)
    if (!managed) {
      throw new Error(`[SessionManager] Session '${id}' not found`)
    }

    const updatedConfig: ISessionConfig = { ...managed.config, proxy }
    return this.createSession(id, updatedConfig)
  }

  /** Get the underlying ModuleClient for advanced usage */
  getModuleClient(): ModuleClient {
    return this.moduleClient
  }

  /** Get pool statistics */
  getPoolStats(): {
    utilization: number
    completed: number
    waiting: number
    threads: number
  } | null {
    return this.moduleClient.getPoolStats()
  }

  /** Get all active session IDs */
  getSessionIds(): string[] {
    return Array.from(this.sessions.keys())
  }

  /** Update default headers for an existing session */
  updateHeaders(id: string, headers: Record<string, string>): void {
    const managed = this.sessions.get(id)
    if (!managed) {
      throw new Error(`[SessionManager] Session '${id}' not found`)
    }
    managed.client.setDefaultHeaders(headers)
  }

  /**
   * Warm up a session's proxy by making a lightweight request.
   * Verifies the proxy is reachable and establishes the connection.
   */
  async warmUpProxy(id: string): Promise<boolean> {
    const session = this.getSession(id)
    if (!session) {
      throw new Error(`[SessionManager] Session '${id}' not found`)
    }
    try {
      const response = await session.head('https://www.google.com/generate_204', {
        timeoutSeconds: 10,
      })
      return response.status === 204 || response.status === 200
    } catch {
      return false
    }
  }

  /** Rotate fingerprint while preserving cookies from the old session */
  async rotateFingerprint(id: string, fingerprint?: IFingerprintConfig): Promise<SessionClient> {
    const managed = this.sessions.get(id)
    if (!managed) {
      throw new Error(`[SessionManager] Session '${id}' not found`)
    }

    // Extract cookies before destroying session
    let savedCookies: import('tlsclientwrapper').Cookie[] = []
    try {
      const sessionId = managed.client.getSession()
      const cookieResponse = await managed.client.getCookiesFromSession(sessionId, 'https://')
      savedCookies = cookieResponse.cookies ?? []
    } catch {
      // Cookie extraction failed — proceed without cookies
    }

    const updatedConfig: ISessionConfig = {
      ...managed.config,
      profile: fingerprint ?? managed.config.profile,
    }
    // Force a new seed to get a different profile
    if (updatedConfig.profile && !fingerprint?.seed) {
      updatedConfig.profile = { ...updatedConfig.profile, seed: `${Date.now()}-${Math.random()}` }
    }
    const newClient = await this.createSession(id, updatedConfig)

    // Re-inject saved cookies into new session
    if (savedCookies.length > 0) {
      newClient.setDefaultCookies(savedCookies)
    }

    return newClient
  }
}
