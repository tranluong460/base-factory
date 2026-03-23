import type {
  FingerprintPreset,
  IBrandEntry,
  IRequestContext,
  ITlsProfileConfig,
} from '../core/types'
import { generateChromeGreaseBrands, getBrowserBrand } from './presets'

interface IHeaderGeneratorInput {
  preset: FingerprintPreset
  majorVersion: number
  userAgent: string
  config: ITlsProfileConfig
  locales?: string[]
  rng?: () => number
}

interface IHeaderGeneratorOutput {
  headers: Record<string, string>
  headerOrder: string[]
}

function isChromeBased(preset: FingerprintPreset): boolean {
  return preset.startsWith('CHROME_') || preset === 'EDGE_WINDOWS'
}

function isFirefox(preset: FingerprintPreset): boolean {
  return preset.startsWith('FIREFOX_')
}

function isSafari(preset: FingerprintPreset): boolean {
  return preset.startsWith('SAFARI_')
}

function buildSecChUa(brands: IBrandEntry[]): string {
  if (brands.length === 0) {
    return ''
  }
  return brands.map((b) => `"${b.brand}";v="${b.version}"`).join(', ')
}

function buildAcceptLanguage(locales?: string[]): string {
  const langs = locales ?? ['en-US', 'en']
  return langs
    .map((lang, i) => {
      if (i === 0) {
        return lang
      }
      const quality = Math.max(0.1, 1 - i * 0.1)
      return `${lang};q=${quality.toFixed(1)}`
    })
    .join(',')
}

/**
 * Build sec-fetch-* headers based on request context.
 * Real browsers vary these values per request type.
 */
export function buildSecFetchHeaders(context?: IRequestContext): Record<string, string> {
  const ctx = context ?? {
    isNavigation: true,
    isUserInitiated: true,
    targetSite: 'none',
    destination: 'document',
  }

  // sec-fetch-mode per resource type (matches real Chrome behavior)
  const modeMap: Record<string, string> = {
    document: 'navigate',
    style: 'no-cors',
    script: 'no-cors',
    image: 'no-cors',
    font: 'cors',
    empty: 'cors', // XHR/fetch
    iframe: 'navigate',
  }

  const headers: Record<string, string> = {
    'sec-fetch-site': ctx.targetSite,
    'sec-fetch-mode': ctx.isNavigation ? 'navigate' : (modeMap[ctx.destination] ?? 'cors'),
    'sec-fetch-dest': ctx.destination,
  }

  // sec-fetch-user is ONLY set on user-initiated navigations
  if (ctx.isNavigation && ctx.isUserInitiated) {
    headers['sec-fetch-user'] = '?1'
  }

  // Accept header per resource type (browsers send different Accept for each)
  const acceptMap: Record<string, string> = {
    document:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    image: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    style: 'text/css,*/*;q=0.1',
    script: '*/*',
    font: '*/*',
    empty: '*/*',
  }
  const accept = acceptMap[ctx.destination]
  if (accept) {
    headers.accept = accept
  }

  // Dynamic priority per resource type (RFC 9218)
  const priorityMap: Record<string, string> = {
    document: 'u=0, i',
    style: 'u=0',
    script: 'u=1',
    font: 'u=0',
    image: 'u=4, i',
    empty: 'u=1', // XHR/fetch
    iframe: 'u=4, i',
  }
  const priority = priorityMap[ctx.destination]
  if (priority) {
    headers.priority = priority
  }

  return headers
}

/**
 * Generate browser-realistic headers with correct ordering per browser type.
 * Chrome uses dynamic GREASE brands from Chromium's algorithm.
 * Firefox skips Client Hints. Safari 16.4+ sends sec-fetch but not sec-fetch-user.
 */
export function generateBrowserHeaders(input: IHeaderGeneratorInput): IHeaderGeneratorOutput {
  const { preset, majorVersion, userAgent, config, locales, rng } = input
  const headers: Record<string, string> = {}

  if (isChromeBased(preset)) {
    return buildChromeHeaders(headers, preset, majorVersion, userAgent, config, locales)
  }

  if (isFirefox(preset)) {
    return buildFirefoxHeaders(headers, userAgent, locales, rng)
  }

  if (isSafari(preset)) {
    return buildSafariHeaders(headers, preset, majorVersion, userAgent, locales)
  }

  return buildSafariHeaders(headers, preset, majorVersion, userAgent, locales)
}

function buildChromeHeaders(
  headers: Record<string, string>,
  preset: FingerprintPreset,
  majorVersion: number,
  userAgent: string,
  config: ITlsProfileConfig,
  locales?: string[],
): IHeaderGeneratorOutput {
  // Dynamic GREASE brands from real Chromium algorithm
  const browserBrand = getBrowserBrand(preset)
  const brands = generateChromeGreaseBrands(majorVersion, browserBrand)
  const secChUa = buildSecChUa(brands)

  headers['sec-ch-ua'] = secChUa
  headers['sec-ch-ua-mobile'] = config.mobile ? '?1' : '?0'
  headers['sec-ch-ua-platform'] = config.secChUaPlatform
  headers['upgrade-insecure-requests'] = '1'
  headers['user-agent'] = userAgent
  headers.accept
    = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  // Base sec-fetch-* defaults (sec-fetch-user applied dynamically per-request via buildSecFetchHeaders)
  headers['sec-fetch-site'] = 'none'
  headers['sec-fetch-mode'] = 'navigate'
  headers['sec-fetch-dest'] = 'document'
  headers['accept-encoding'] = 'gzip, deflate, br, zstd'
  headers['accept-language'] = buildAcceptLanguage(locales)

  if (majorVersion >= 124) {
    headers.priority = 'u=0, i'
  }

  const headerOrder = [
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform',
    'upgrade-insecure-requests',
    'user-agent',
    'accept',
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-user',
    'sec-fetch-dest',
    'accept-encoding',
    'accept-language',
    ...(majorVersion >= 124 ? ['priority'] : []),
  ]

  return { headers, headerOrder }
}

function buildFirefoxHeaders(
  headers: Record<string, string>,
  userAgent: string,
  locales?: string[],
  rng?: () => number,
): IHeaderGeneratorOutput {
  headers['user-agent'] = userAgent
  headers.accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  headers['accept-language'] = buildAcceptLanguage(locales)
  headers['accept-encoding'] = 'gzip, deflate, br, zstd'
  headers['upgrade-insecure-requests'] = '1'
  headers['sec-fetch-dest'] = 'document'
  headers['sec-fetch-mode'] = 'navigate'
  headers['sec-fetch-site'] = 'none'
  // sec-fetch-user applied dynamically per-request via buildSecFetchHeaders
  // Only ~8% of real Firefox users enable DNT
  const dntChance = rng ? rng() : Math.random()
  if (dntChance < 0.08) {
    headers.dnt = '1'
  }
  headers.te = 'trailers'

  const headerOrder = [
    'user-agent',
    'accept',
    'accept-language',
    'accept-encoding',
    'upgrade-insecure-requests',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'sec-fetch-user',
    ...(headers.dnt ? ['dnt'] : []),
    'te',
  ]

  return { headers, headerOrder }
}

function buildSafariHeaders(
  headers: Record<string, string>,
  preset: FingerprintPreset,
  majorVersion: number,
  userAgent: string,
  locales?: string[],
): IHeaderGeneratorOutput {
  headers['user-agent'] = userAgent
  headers.accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  headers['accept-language'] = buildAcceptLanguage(locales)
  headers['accept-encoding'] = 'gzip, deflate, br'

  // Safari 16.4+ sends sec-fetch-site/mode/dest but NEVER sec-fetch-user
  const safariSendsSecFetch
    = (preset === 'SAFARI_MACOS' && majorVersion >= 16)
      || (preset === 'SAFARI_IOS' && majorVersion >= 17)

  if (safariSendsSecFetch) {
    headers['sec-fetch-site'] = 'none'
    headers['sec-fetch-mode'] = 'navigate'
    headers['sec-fetch-dest'] = 'document'
  }

  const headerOrder = [
    'user-agent',
    'accept',
    'accept-language',
    'accept-encoding',
    ...(safariSendsSecFetch ? ['sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest'] : []),
  ]

  return { headers, headerOrder }
}
