import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios'
import axios from 'axios'
import type {
  IPayloadGetLabsCall,
  IPayloadLabsCall,
  IPayloadPostAisandboxLabsCall,
  IPayloadPostLabsCall,
} from '../../interfaces'
import { Base, DEFAULT_LABS_URL, LABS_URLS } from '../common'
import { createProxyAgent, handleError, parseResponse } from './private'

class HttpClient extends Base {
  private static readonly DEFAULT_TIMEOUT = 300000
  private static readonly DEFAULT_USER_AGENT
    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

  public readonly instance: AxiosInstance

  constructor(payload: IPayloadLabsCall) {
    super()
    this.instance = this.createInstance(payload)
    this.setupInterceptors()
  }

  private createInstance(payload: IPayloadLabsCall): AxiosInstance {
    const config: CreateAxiosDefaults = {
      timeout: HttpClient.DEFAULT_TIMEOUT,
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

  private buildHeaders(payload: IPayloadLabsCall): AxiosRequestConfig['headers'] {
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
      'user-agent': payload.userAgent || HttpClient.DEFAULT_USER_AGENT,
    }
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error),
    )

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error),
    )
  }

  private parseResponseData<T>(data: unknown): T {
    const responseString = typeof data === 'string' ? data : JSON.stringify(data)
    return parseResponse(responseString)
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.instance.get(url, config)
      return this.parseResponseData<T>(response.data)
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  async post<T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse = await this.instance.post(url, data, config)
      return this.parseResponseData<T>(response.data)
    } catch (error) {
      handleError(error)
      throw error
    }
  }
}

class UrlBuilder {
  private readonly baseUrl: string
  private readonly aiSandboxUrl: string

  constructor() {
    this.baseUrl = LABS_URLS.API_URL()
    this.aiSandboxUrl = LABS_URLS.AI_SANDBOX_API_URL()
  }

  buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`
  }

  buildTrpcUrl(endpoint: string): string {
    return `${this.baseUrl}/trpc/${endpoint}`
  }

  buildTrpcGetUrl(endpoint: string, params: unknown): string {
    const encodedInput = encodeURIComponent(JSON.stringify(params))
    return `${this.buildTrpcUrl(endpoint)}?input=${encodedInput}`
  }

  buildAisandboxUrl(endpoint: string): string {
    return `${this.aiSandboxUrl}/${endpoint}`
  }
}

export class LabsCallClient {
  private readonly httpClient: HttpClient
  private readonly urlBuilder: UrlBuilder
  private readonly defaultReferer: string

  constructor(payload: IPayloadLabsCall) {
    this.httpClient = new HttpClient(payload)
    this.urlBuilder = new UrlBuilder()
    this.defaultReferer = LABS_URLS.BASE_URL()
  }

  async get<T>(payload: Omit<IPayloadGetLabsCall, 'params'>): Promise<T> {
    const url = this.urlBuilder.buildUrl(payload.endPoint)
    return this.httpClient.get<T>(url, {
      headers: {
        Referer: payload.referer || this.defaultReferer,
      },
    })
  }

  async getTrpc<T>(payload: IPayloadGetLabsCall): Promise<T> {
    const url = this.urlBuilder.buildTrpcGetUrl(payload.endPoint, payload.params)
    return this.httpClient.get<T>(url, {
      headers: {
        Referer: payload.referer || this.defaultReferer,
      },
    })
  }

  async postTrpc<T>(payload: IPayloadPostLabsCall): Promise<T> {
    const url = this.urlBuilder.buildTrpcUrl(payload.endPoint)
    return this.httpClient.post<T>(url, payload.data, {
      headers: {
        Referer: this.defaultReferer,
      },
    })
  }

  async postAisandbox<T>(payload: IPayloadPostAisandboxLabsCall): Promise<T> {
    const url = this.urlBuilder.buildAisandboxUrl(payload.endPoint)
    return this.httpClient.post<T>(url, payload.data, {
      headers: {
        Referer: DEFAULT_LABS_URL,
        Authorization: `Bearer ${payload.accessToken}`,
      },
    })
  }
}
