interface ICfClearanceEntry {
  cookie: string
  expiry: number
}

const CF_CLEARANCE_TTL_MS = 30 * 60 * 1000 // 30 minutes
const CF_REFRESH_BUFFER_MS = 5 * 60 * 1000 // refresh 5 min before expiry

/**
 * Tracks cf_clearance cookies per session.
 * cf_clearance has ~30 min TTL from Cloudflare; this tracker monitors validity
 * and signals when a refresh is needed.
 */
export class CfClearanceTracker {
  private entries = new Map<string, ICfClearanceEntry>()

  hasValidClearance(sessionId: string): boolean {
    const entry = this.entries.get(sessionId)
    if (!entry) {
      return false
    }
    return Date.now() < entry.expiry
  }

  setClearance(sessionId: string, cookie: string, expiry?: Date): void {
    this.entries.set(sessionId, {
      cookie,
      expiry: expiry ? expiry.getTime() : Date.now() + CF_CLEARANCE_TTL_MS,
    })
  }

  getClearance(sessionId: string): string | undefined {
    if (!this.hasValidClearance(sessionId)) {
      return undefined
    }
    return this.entries.get(sessionId)?.cookie
  }

  getTTL(sessionId: string): number {
    const entry = this.entries.get(sessionId)
    if (!entry) {
      return 0
    }
    return Math.max(0, entry.expiry - Date.now())
  }

  needsRefresh(sessionId: string): boolean {
    const ttl = this.getTTL(sessionId)
    return ttl > 0 && ttl < CF_REFRESH_BUFFER_MS
  }

  removeClearance(sessionId: string): void {
    this.entries.delete(sessionId)
  }

  clear(): void {
    this.entries.clear()
  }
}
