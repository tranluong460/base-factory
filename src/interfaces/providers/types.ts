import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import type { EnumFacebookProvider } from '../../utils'

export interface ProviderTypeMap {
  [EnumFacebookProvider.SCRIPTED]: IScriptedProvider
  [EnumFacebookProvider.AUTOMATED]: IAutomatedProvider
  [EnumFacebookProvider.DIRECT_API]: IDirectApiProvider
}

export interface PayloadConfigMap {
  [EnumFacebookProvider.SCRIPTED]: { data: string }
  [EnumFacebookProvider.AUTOMATED]: { data: string }
  [EnumFacebookProvider.DIRECT_API]: { data: string }
}

export type IPayloadProvider<T extends EnumFacebookProvider> = {
  type: T
  logUpdate: ITypeLogUpdate<'mkt_fb'>
} & PayloadConfigMap[T]

export interface IScriptedProvider {
  start: () => Promise<void>
}

export interface IAutomatedProvider {
  start: () => Promise<void>
}

export interface IDirectApiProvider {
  start: () => Promise<void>
}
