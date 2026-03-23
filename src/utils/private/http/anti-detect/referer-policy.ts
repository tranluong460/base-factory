/**
 * Manages Referer header chain per session.
 * Implements Chrome's default Referrer-Policy: strict-origin-when-cross-origin
 * - Same-origin: send full URL
 * - Cross-origin: send origin only
 * - HTTPS → HTTP downgrade: send nothing
 */
export class RefererPolicy {
  private lastUrlPerSession = new Map<string, string>()

  /** Get the appropriate Referer header value for a request */
  getReferer(sessionId: string, currentUrl: string): string | undefined {
    const lastUrl = this.lastUrlPerSession.get(sessionId)
    if (!lastUrl) {
      return undefined
    }

    try {
      const lastOrigin = new URL(lastUrl).origin
      const currentOrigin = new URL(currentUrl).origin
      const isDowngrade = lastUrl.startsWith('https:') && currentUrl.startsWith('http:')
      if (isDowngrade) {
        return undefined
      }
      return lastOrigin === currentOrigin ? lastUrl : `${lastOrigin}/`
    } catch {
      return undefined
    }
  }

  /** Track URL after successful response for Referer chain */
  trackUrl(sessionId: string, url: string): void {
    this.lastUrlPerSession.set(sessionId, url)
  }

  /** Clear tracking for a session */
  clearSession(sessionId: string): void {
    this.lastUrlPerSession.delete(sessionId)
  }

  /** Clear all tracking */
  clear(): void {
    this.lastUrlPerSession.clear()
  }
}
