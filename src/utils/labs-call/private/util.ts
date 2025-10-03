import { CoreLogger } from '@vitechgroup/mkt-elec-core'
import type { AxiosProxyConfig } from 'axios'
import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import type { ICustomResponseLabs } from '../../../interfaces'

export function createProxyAgent(proxyConfig: AxiosProxyConfig) {
  const { host, port, auth, protocol } = proxyConfig

  // Tạo URL cho proxy với authentication
  let proxyUrl = `${protocol}://`
  if (auth) {
    proxyUrl += `${encodeURIComponent(auth.username)}:${encodeURIComponent(auth.password)}@`
  }
  proxyUrl += `${host}:${port}`

  CoreLogger.getInstance().debug(
    `[GraphQL] Using proxy: ${protocol}://${host}:${port}${auth ? ` (Authentication: ${auth.username}:${auth.password})` : ''}`,
  )

  // Chọn agent phù hợp theo protocol
  switch (protocol) {
    case 'http':
      return {
        httpAgent: new HttpProxyAgent(proxyUrl),
        httpsAgent: new HttpProxyAgent(proxyUrl),
      }

    case 'https':
      return {
        httpAgent: new HttpsProxyAgent(proxyUrl),
        httpsAgent: new HttpsProxyAgent(proxyUrl),
      }

    case 'socks':
    case 'socks4':
    case 'socks4a':
    case 'socks5':
      return {
        httpAgent: new SocksProxyAgent(proxyUrl),
        httpsAgent: new SocksProxyAgent(proxyUrl),
      }

    default:
      throw new Error(`Unsupported proxy protocol: ${protocol}`)
  }
}

export function logResponseError(error: any): void {
  if (error.response) {
    CoreLogger.getInstance().error(
      `[logResponseError] API Error: ${error.response.status} - ${error.response.statusText}`,
    )
    CoreLogger.getInstance().error('[logResponseError] Response data:', error.response.data)
  } else if (error.request) {
    CoreLogger.getInstance().error('[logResponseError] Network Error: No response received')
  } else {
    CoreLogger.getInstance().error(`[logResponseError] Request Error: ${error.message}`)
  }
}

export function handleError(error: any): void {
  if (error.response) {
    const { status, statusText, data } = error.response
    const errorMessages = {
      401: 'Authentication failed. Please check your cookies and session data.',
      403: 'Access forbidden. Your account may not have permission for this action.',
      429: 'Rate limit exceeded. Please wait before making more requests.',
    }

    let errorMessage = `Labs API Error: ${status} - ${statusText}`

    if (errorMessages[status as keyof typeof errorMessages]) {
      errorMessage += `\n${errorMessages[status as keyof typeof errorMessages]}`
    } else if (status >= 500) {
      errorMessage += '\nServer error. Labs API is experiencing issues.'
    }

    if (data) {
      errorMessage += `\nResponse: ${JSON.stringify(data, null, 2)}`
    }

    CoreLogger.getInstance().error(errorMessage)
  }

  if (error.request) {
    CoreLogger.getInstance().error(
      'Network Error: No response received from Labs API. Check your internet connection.',
    )
  }

  CoreLogger.getInstance().error(`[handleError] Request Error: ${error.message}`)
}

export function parseResponse(responseData: string): any {
  try {
    const parsed = JSON.parse(responseData) as ICustomResponseLabs<any>
    return parsed
  } catch (error) {
    if (error instanceof SyntaxError) {
      CoreLogger.getInstance().error(
        'Failed to parse JSON response:',
        responseData.substring(0, 500),
      )
      throw new Error(`Invalid JSON response: ${error.message}`)
    }

    throw error
  }
}
