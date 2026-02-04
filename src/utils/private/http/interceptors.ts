import type { AxiosError, AxiosInstance } from 'axios'
import { classifyError } from './errors'
import type { HttpClientConfig, ResolvedLoggingConfig } from './types'

/** Setup request and response interceptors */
export function setupInterceptors(
  client: AxiosInstance,
  config: HttpClientConfig,
  loggingConfig: ResolvedLoggingConfig,
): void {
  // Request interceptor
  client.interceptors.request.use(
    async (reqConfig) => {
      reqConfig.metadata = { startTime: Date.now() }

      if (loggingConfig.logRequests) {
        loggingConfig.logger.info('[HttpClient] Request', {
          method: reqConfig.method?.toUpperCase(),
          url: reqConfig.url,
          baseURL: reqConfig.baseURL,
        })
      }

      if (config.transformRequest && reqConfig.data) {
        reqConfig.data = config.transformRequest(
          reqConfig.data,
          reqConfig.headers as Record<string, string>,
        )
      }

      return config.onRequest ? await config.onRequest(reqConfig) : reqConfig
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor
  client.interceptors.response.use(
    async (response) => {
      const duration = Date.now() - (response.config.metadata?.startTime || 0)

      if (loggingConfig.logPerformance) {
        loggingConfig.logger.debug('[HttpClient] Performance', {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          duration: `${duration}ms`,
        })
      }

      if (loggingConfig.logResponses) {
        loggingConfig.logger.debug('[HttpClient] Response', {
          status: response.status,
          data: response.data,
        })
      }

      if (config.transformResponse) {
        response.data = config.transformResponse(response.data)
      }

      return config.onResponse ? await config.onResponse(response) : response
    },
    async (error: AxiosError) => {
      const httpError = classifyError(error)

      if (loggingConfig.logErrors) {
        loggingConfig.logger.error('[HttpClient] Error', {
          message: httpError.message,
          status: httpError.statusCode,
          url: error.config?.url,
        })
      }

      if (config.onError) {
        return await config.onError(httpError)
      }

      throw httpError
    },
  )
}
