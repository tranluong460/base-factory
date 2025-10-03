import type { AxiosProxyConfig } from 'axios'

export interface IPayloadLabsCall {
  cookies: string
  referer?: string
  userAgent?: string
  proxyConfig?: AxiosProxyConfig
}

export interface IPayloadGetLabsCall {
  endPoint: string
  params: any
  referer?: string
}

export interface IPayloadPostLabsCall {
  endPoint: string
  data: any
}
