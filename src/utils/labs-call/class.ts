import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios'
import axios from 'axios'
import type { IPayloadGetLabsCall, IPayloadLabsCall, IPayloadPostLabsCall } from '../../interfaces'
import { Base, LABS_URLS } from '../common'
import { createProxyAgent, handleError, parseResponse } from './private'

class HttpClient extends Base {
  public readonly instance: AxiosInstance

  constructor(payload: IPayloadLabsCall) {
    super()

    this.instance = this.createInstance(payload)
    this.setupInterceptors()
  }

  private createInstance(payload: IPayloadLabsCall): AxiosInstance {
    const config: CreateAxiosDefaults = {
      timeout: 300000,
      withCredentials: true,
      headers: this.buildHeaders(payload),
    }

    if (payload.proxyConfig) {
      const proxyAgents = createProxyAgent(payload.proxyConfig)
      if (proxyAgents) {
        Object.assign(config, proxyAgents)
      }
    }

    return axios.create(config)
  }

  private buildHeaders(payload: IPayloadLabsCall): Record<string, string> {
    return {
      'accept': '*/*',
      'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
      'content-type': 'application/json',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'cookie': payload.cookies,
      'user-agent':
        payload.userAgent
        || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    }
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        // this.logger.debug(`[LabsCall] Request: ${config.url}`)
        // this.logger.debug(`[LabsCall] Data:`, config.data)
        return config
      },
      (error) => {
        // this.logger.error('[LabsCall] Request error:', error)
        return Promise.reject(error)
      },
    )

    this.instance.interceptors.response.use(
      (response) => {
        // this.logger.debug(`[LabsCall] Response: ${response.status}`)
        return response
      },
      (error) => {
        // logResponseError(error)
        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.instance.get(url, config)
      const responseString
        = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      return parseResponse(responseString)
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.instance.post(url, data, config)
      const responseString
        = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      return parseResponse(responseString)
    } catch (error) {
      handleError(error)
      throw error
    }
  }
}

class UrlBuilder {
  constructor() {}

  buildTrpcUrl(endpoint: string): string {
    return `${LABS_URLS.API_URL()}/` + `trpc` + `/${endpoint}`
  }

  buildTrpcGetUrl(endpoint: string, params: any): string {
    const encodedInput = encodeURIComponent(JSON.stringify(params))
    return `${this.buildTrpcUrl(endpoint)}?input=${encodedInput}`
  }
}

export class LabsCallClient {
  private readonly httpClient: HttpClient
  private readonly urlBuilder: UrlBuilder

  constructor(payload: IPayloadLabsCall) {
    this.httpClient = new HttpClient(payload)
    this.urlBuilder = new UrlBuilder()
  }

  async get<T>(payload: IPayloadGetLabsCall): Promise<T> {
    const url = this.urlBuilder.buildTrpcGetUrl(payload.endPoint, payload.params)
    return this.httpClient.get(url, {
      headers: {
        Referer: payload.referer || LABS_URLS.BASE_URL(),
      },
    })
  }

  async post<T>(payload: IPayloadPostLabsCall): Promise<T> {
    const url = this.urlBuilder.buildTrpcUrl(payload.endPoint)
    return this.httpClient.post(url, payload.data, {
      headers: {
        Referer: LABS_URLS.BASE_URL(),
      },
    })
  }
}
