import type { Cookie } from 'tlsclientwrapper'
import type { CfClearanceTracker } from '../session/cf-tracker'

/** Auto-extract cf_clearance cookie from response and store in tracker */
export function extractCfClearance(
  sessionId: string,
  cookies: Record<string, Cookie>,
  cfTracker: CfClearanceTracker,
): void {
  const cfCookie = cookies.cf_clearance
  if (cfCookie) {
    const expiry = cfCookie.expires ? new Date(cfCookie.expires * 1000) : undefined
    cfTracker.setClearance(sessionId, cfCookie.value, expiry)
  }
}
