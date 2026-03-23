export interface ICapSolverConfig {
  apiKey: string
  /** Timeout for challenge solving in ms (default: 120000) */
  timeout?: number
}

export interface IChallengeSolver {
  /** Solve a Cloudflare challenge and return cookies/token */
  solve: (siteUrl: string, siteKey: string, proxy?: string) => Promise<IChallengeResult>
}

export interface IChallengeResult {
  /** Solved token (Turnstile token or cf_clearance value) */
  token: string
  /** cf_clearance cookie value if available */
  cfClearance?: string
  /** User-Agent that was used during solving (must match subsequent requests) */
  userAgent?: string
  /** Time taken to solve in ms */
  duration: number
}
