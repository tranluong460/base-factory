import type { HttpClient } from '../client'
import type { IRequestConfig } from '../core/types'

/**
 * Verification utilities for debugging TLS fingerprint, proxy IP, and headers.
 * Use these to confirm your session is correctly impersonating a browser.
 */

interface IVerifyProxyResult {
  ip: string
  success: boolean
}

/** Verify proxy is working by checking external IP */
export async function verifyProxy(
  client: HttpClient,
  config?: IRequestConfig,
): Promise<IVerifyProxyResult> {
  const response = await client.get<string>('https://api.ipify.org', {
    ...config,
    throwOnError: false,
  })
  return {
    ip: response.status === 200 ? response.data.trim() : '',
    success: response.status === 200,
  }
}

interface ITlsFingerprintResult {
  ja3: string
  ja3Hash: string
  ja4: string
  h2Fingerprint: string
  userAgent: string
  akamai: string
  raw: Record<string, unknown>
}

/** Verify TLS fingerprint by hitting tls.peet.ws */
export async function verifyFingerprint(
  client: HttpClient,
  config?: IRequestConfig,
): Promise<ITlsFingerprintResult> {
  const response = await client.get<Record<string, unknown>>('https://tls.peet.ws/api/all', {
    ...config,
    throwOnError: false,
  })

  if (response.status !== 200) {
    return {
      ja3: '',
      ja3Hash: '',
      ja4: '',
      h2Fingerprint: '',
      userAgent: '',
      akamai: '',
      raw: {},
    }
  }

  const data = response.data
  const tls = (data.tls as Record<string, unknown>) ?? {}
  const http2 = (data.http2 as Record<string, unknown>) ?? {}

  return {
    ja3: String(tls.ja3 ?? ''),
    ja3Hash: String(tls.ja3_hash ?? ''),
    ja4: String(tls.ja4 ?? ''),
    h2Fingerprint: String(http2.akamai_fingerprint ?? ''),
    userAgent: String((data.http_version as string) ?? ''),
    akamai: String(http2.akamai_fingerprint_hash ?? ''),
    raw: data,
  }
}

interface IVerifyHeadersResult {
  headers: Record<string, string>
  origin: string
  url: string
}

/** Verify outgoing headers by hitting httpbin.org */
export async function verifyHeaders(
  client: HttpClient,
  config?: IRequestConfig,
): Promise<IVerifyHeadersResult> {
  const response = await client.get<Record<string, unknown>>('https://httpbin.org/headers', {
    ...config,
    throwOnError: false,
  })

  if (response.status !== 200) {
    return { headers: {}, origin: '', url: '' }
  }

  const data = response.data
  const headers = (data.headers as Record<string, string>) ?? {}

  return {
    headers,
    origin: String(data.origin ?? ''),
    url: String(data.url ?? ''),
  }
}

/** Run all verifications and return a summary */
export async function verifyAll(
  client: HttpClient,
  config?: IRequestConfig,
): Promise<{
    proxy: IVerifyProxyResult
    fingerprint: ITlsFingerprintResult
    headers: IVerifyHeadersResult
  }> {
  const [proxy, fingerprint, headers] = await Promise.all([
    verifyProxy(client, config),
    verifyFingerprint(client, config),
    verifyHeaders(client, config),
  ])

  return { proxy, fingerprint, headers }
}
