import type { IChallengeSolver } from './types'

/** Detect if an HTML response is a Cloudflare challenge page */
export function isCloudflareChallengePage(html: string): boolean {
  return (
    html.includes('_cf_chl_opt')
    || html.includes('cf-challenge-running')
    || html.includes('challenge-platform')
    || html.includes('cf-turnstile')
  )
}

/** Extract Turnstile sitekey from Cloudflare challenge HTML */
export function extractTurnstileSiteKey(html: string): string | undefined {
  // Pattern: data-sitekey="0x..." or sitekey: '0x...'
  const patterns = [
    /data-sitekey="(0x[\w-]+)"/,
    /sitekey:\s*['"]?(0x[\w-]+)['"]?/,
    /turnstileKey\s*[:=]\s*['"]?(0x[\w-]+)['"]?/,
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(html)
    if (match?.[1]) {
      return match[1]
    }
  }

  return undefined
}

/**
 * Attempt to solve a Cloudflare challenge from a blocked response.
 * Returns true if solved (cookies injected), false if unsolvable.
 */
export async function handleChallenge(
  solver: IChallengeSolver,
  url: string,
  responseBody: string,
  proxyUrl?: string,
): Promise<{ solved: boolean, cfClearance?: string, userAgent?: string }> {
  if (!isCloudflareChallengePage(responseBody)) {
    return { solved: false }
  }

  const siteKey = extractTurnstileSiteKey(responseBody)
  if (!siteKey) {
    return { solved: false }
  }

  try {
    const result = await solver.solve(url, siteKey, proxyUrl)
    return {
      solved: true,
      cfClearance: result.cfClearance,
      userAgent: result.userAgent,
    }
  } catch {
    return { solved: false }
  }
}
