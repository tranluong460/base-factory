import { describe, expect, it } from 'vitest'
import { formatProxyUrl } from '../../src/utils/private/http/core/proxy'

describe('formatProxyUrl', () => {
  it('formats basic HTTP proxy', () => {
    const url = formatProxyUrl({ host: '192.168.1.1', port: 8080 })

    expect(url).toBe('http://192.168.1.1:8080')
  })

  it('formats proxy with authentication', () => {
    const url = formatProxyUrl({
      host: 'proxy.example.com',
      port: 3128,
      auth: { username: 'user', password: 'pass' },
    })

    expect(url).toBe('http://user:pass@proxy.example.com:3128')
  })

  it('uRL-encodes special characters in auth', () => {
    const url = formatProxyUrl({
      host: 'proxy.example.com',
      port: 3128,
      auth: { username: 'user@domain', password: 'p@ss:word!' },
    })

    expect(url).toBe('http://user%40domain:p%40ss%3Aword!@proxy.example.com:3128')
  })

  it('formats SOCKS5 proxy', () => {
    const url = formatProxyUrl({
      host: '10.0.0.1',
      port: 1080,
      protocol: 'socks5',
    })

    expect(url).toBe('socks5://10.0.0.1:1080')
  })

  it('formats HTTPS proxy', () => {
    const url = formatProxyUrl({
      host: 'secure-proxy.com',
      port: 443,
      protocol: 'https',
    })

    expect(url).toBe('https://secure-proxy.com:443')
  })

  it('defaults to HTTP protocol', () => {
    const url = formatProxyUrl({ host: 'proxy.com', port: 8080 })

    expect(url.startsWith('http://')).toBe(true)
  })

  it('formats SOCKS5 proxy with authentication', () => {
    const url = formatProxyUrl({
      host: '10.0.0.1',
      port: 1080,
      protocol: 'socks5',
      auth: { username: 'admin', password: 'secret' },
    })

    expect(url).toBe('socks5://admin:secret@10.0.0.1:1080')
  })
})
