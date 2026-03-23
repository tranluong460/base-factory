/**
 * Behavior simulation utilities for making HTTP requests look like real user activity.
 * Prevents detection by anti-bot systems that analyze request timing patterns.
 */

/**
 * Generate a log-normal distributed random number.
 * Matches real human timing patterns better than uniform random.
 * Uses Box-Muller transform to convert uniform → normal → log-normal.
 */
function logNormalRandom(median: number, sigma = 0.4): number {
  const u1 = Math.random()
  const u2 = Math.random()
  // Box-Muller transform: uniform → standard normal
  const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  // Log-normal with specified median and spread
  return median * Math.exp(sigma * normal)
}

/** Sleep for a human-like duration centered around median, clamped to [min, max] */
export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const median = (minMs + maxMs) / 2
  const delay = Math.max(minMs, Math.min(maxMs * 1.5, logNormalRandom(median)))
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/** Human-like delay between page navigations (centered ~2s, range 1-4s) */
export function navigationDelay(): Promise<void> {
  return randomDelay(1000, 4000)
}

/** Short delay simulating reading/processing (centered ~500ms, range 200-1200ms) */
export function readingDelay(): Promise<void> {
  return randomDelay(200, 1200)
}

/** Longer delay simulating form filling or decision making (centered ~4s, range 2-8s) */
export function thinkingDelay(): Promise<void> {
  return randomDelay(2000, 8000)
}

/**
 * Geo-locale configuration for proxy consistency.
 * Maps country code → matching locales and timezone for header consistency.
 */
export interface IGeoLocaleConfig {
  locales: string[]
  timezone: string
  acceptLanguage: string
}

const GEO_LOCALE_MAP: Record<string, IGeoLocaleConfig> = {
  US: {
    locales: ['en-US', 'en'],
    timezone: 'America/New_York',
    acceptLanguage: 'en-US,en;q=0.9',
  },
  GB: {
    locales: ['en-GB', 'en'],
    timezone: 'Europe/London',
    acceptLanguage: 'en-GB,en;q=0.9',
  },
  DE: {
    locales: ['de-DE', 'de', 'en'],
    timezone: 'Europe/Berlin',
    acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8',
  },
  FR: {
    locales: ['fr-FR', 'fr', 'en'],
    timezone: 'Europe/Paris',
    acceptLanguage: 'fr-FR,fr;q=0.9,en;q=0.8',
  },
  JP: {
    locales: ['ja-JP', 'ja', 'en'],
    timezone: 'Asia/Tokyo',
    acceptLanguage: 'ja-JP,ja;q=0.9,en;q=0.8',
  },
  KR: {
    locales: ['ko-KR', 'ko', 'en'],
    timezone: 'Asia/Seoul',
    acceptLanguage: 'ko-KR,ko;q=0.9,en;q=0.8',
  },
  VN: {
    locales: ['vi-VN', 'vi', 'en'],
    timezone: 'Asia/Ho_Chi_Minh',
    acceptLanguage: 'vi-VN,vi;q=0.9,en;q=0.8',
  },
  BR: {
    locales: ['pt-BR', 'pt', 'en'],
    timezone: 'America/Sao_Paulo',
    acceptLanguage: 'pt-BR,pt;q=0.9,en;q=0.8',
  },
  IN: {
    locales: ['hi-IN', 'en-IN', 'en'],
    timezone: 'Asia/Kolkata',
    acceptLanguage: 'hi-IN,hi;q=0.9,en-IN;q=0.8,en;q=0.7',
  },
  CN: {
    locales: ['zh-CN', 'zh', 'en'],
    timezone: 'Asia/Shanghai',
    acceptLanguage: 'zh-CN,zh;q=0.9,en;q=0.8',
  },
  TW: {
    locales: ['zh-TW', 'zh', 'en'],
    timezone: 'Asia/Taipei',
    acceptLanguage: 'zh-TW,zh;q=0.9,en;q=0.8',
  },
  RU: {
    locales: ['ru-RU', 'ru', 'en'],
    timezone: 'Europe/Moscow',
    acceptLanguage: 'ru-RU,ru;q=0.9,en;q=0.8',
  },
  AU: {
    locales: ['en-AU', 'en'],
    timezone: 'Australia/Sydney',
    acceptLanguage: 'en-AU,en;q=0.9',
  },
  CA: {
    locales: ['en-CA', 'en'],
    timezone: 'America/Toronto',
    acceptLanguage: 'en-CA,en;q=0.9',
  },
  SG: {
    locales: ['en-SG', 'en'],
    timezone: 'Asia/Singapore',
    acceptLanguage: 'en-SG,en;q=0.9',
  },
  TH: {
    locales: ['th-TH', 'th', 'en'],
    timezone: 'Asia/Bangkok',
    acceptLanguage: 'th-TH,th;q=0.9,en;q=0.8',
  },
  ID: {
    locales: ['id-ID', 'id', 'en'],
    timezone: 'Asia/Jakarta',
    acceptLanguage: 'id-ID,id;q=0.9,en;q=0.8',
  },
  PH: {
    locales: ['fil-PH', 'en-PH', 'en'],
    timezone: 'Asia/Manila',
    acceptLanguage: 'fil-PH,fil;q=0.9,en-PH;q=0.8,en;q=0.7',
  },
}

/** Get geo-locale config by ISO 3166-1 alpha-2 country code. Falls back to US. */
export function getGeoLocale(countryCode: string): IGeoLocaleConfig {
  return GEO_LOCALE_MAP[countryCode.toUpperCase()] ?? GEO_LOCALE_MAP.US!
}

/** Get all supported country codes */
export function getSupportedCountryCodes(): string[] {
  return Object.keys(GEO_LOCALE_MAP)
}

// ─── Navigation Flow ──────────────────────────────────────────

interface INavigationStep<T> {
  url: string
  method?: string
  data?: unknown
  /** Delay before this step. Defaults to navigationDelay (1-3s). */
  delayMs?: { min: number, max: number }
  /** Called after request completes. Return value is collected in results. */
  onResponse?: (response: T) => unknown
}

/**
 * Execute a sequence of requests simulating real user navigation.
 * Automatically adds delays between requests and builds Referer chain.
 *
 * @example
 * ```ts
 * const results = await navigateFlow(client, [
 *   { url: 'https://example.com' },              // Visit homepage
 *   { url: 'https://example.com/products' },      // Browse products
 *   { url: 'https://example.com/products/123' },  // View product detail
 * ])
 * ```
 */
export async function navigateFlow<T>(
  client: {
    get: (url: string, config?: { sessionId?: string }) => Promise<T>
    post: (url: string, data?: unknown, config?: { sessionId?: string }) => Promise<T>
  },
  steps: INavigationStep<T>[],
  sessionId?: string,
): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!

    // Delay before each step (skip first visit — no delay for initial page load)
    if (i > 0) {
      const delay = step.delayMs ?? { min: 1000, max: 3000 }
      await randomDelay(delay.min, delay.max)
    }

    const config = sessionId ? { sessionId } : undefined

    const response
      = step.method?.toUpperCase() === 'POST'
        ? await client.post(step.url, step.data, config)
        : await client.get(step.url, config)

    results.push(response)

    if (step.onResponse) {
      step.onResponse(response)
    }
  }

  return results
}
