import type { AxiosProxyConfig } from 'axios'

export interface IPayloadLabsCall {
  cookies: string
  referer?: string
  userAgent?: string
  proxyConfig?: AxiosProxyConfig
  downloadDir?: string
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

export interface IPayloadPostAisandboxLabsCall extends IPayloadPostLabsCall {
  accessToken: string
}
