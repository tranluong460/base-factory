import type { AxiosProxyConfig } from 'axios'

export interface IPayloadLabsCall {
  cookies: string
  referer?: string
  userAgent?: string
  proxyConfig?: AxiosProxyConfig
}
