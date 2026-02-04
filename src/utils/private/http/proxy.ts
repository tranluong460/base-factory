import type { Agent } from 'node:http'
import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import type { ProxyConfig } from './types'

/** Proxy agents for HTTP and HTTPS */
export interface ProxyAgents {
  httpAgent: Agent
  httpsAgent: Agent
}

/**
 * Create proxy agents from config.
 * Supports HTTP, HTTPS, SOCKS4, SOCKS5 protocols.
 */
export function createProxyAgents(proxy: ProxyConfig): ProxyAgents {
  const { host, port, auth, protocol = 'http' } = proxy
  const authStr = auth ? `${auth.username}:${auth.password}@` : ''

  // SOCKS proxy
  if (protocol === 'socks4' || protocol === 'socks5') {
    const socksAgent = new SocksProxyAgent(`${protocol}://${authStr}${host}:${port}`)
    return { httpAgent: socksAgent, httpsAgent: socksAgent }
  }

  // HTTP/HTTPS proxy
  const proxyUrl = `${protocol}://${authStr}${host}:${port}`
  return {
    httpAgent: new HttpProxyAgent(proxyUrl),
    httpsAgent: new HttpsProxyAgent(proxyUrl),
  }
}
