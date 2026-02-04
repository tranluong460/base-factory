/** Proxy authentication */
export interface ProxyAuth {
  username: string
  password: string
}

/** Proxy configuration for HTTP/HTTPS/SOCKS */
export interface ProxyConfig {
  host: string
  port: number
  auth?: ProxyAuth
  protocol?: 'http' | 'https' | 'socks4' | 'socks5'
}
