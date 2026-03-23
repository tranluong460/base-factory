import type { IProxyConfig } from './types'

/** Format IProxyConfig into a URL string for tlsclientwrapper */
export function formatProxyUrl(config: IProxyConfig): string {
  const protocol = config.protocol ?? 'http'
  const auth = config.auth
    ? `${encodeURIComponent(config.auth.username)}:${encodeURIComponent(config.auth.password)}@`
    : ''
  return `${protocol}://${auth}${config.host}:${config.port}`
}
