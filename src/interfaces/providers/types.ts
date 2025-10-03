import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import type { EnumLabsProvider } from '../../utils'

export interface ProviderTypeMap {
  [EnumLabsProvider.SCRIPTED]: IScriptedProvider
  [EnumLabsProvider.AUTOMATED]: IAutomatedProvider
  [EnumLabsProvider.DIRECT_API]: IDirectApiProvider
}

export interface PayloadConfigMap {
  [EnumLabsProvider.SCRIPTED]: { data: string }
  [EnumLabsProvider.AUTOMATED]: { data: string }
  [EnumLabsProvider.DIRECT_API]: { data: string }
}

export type IPayloadProvider<T extends EnumLabsProvider> = {
  type: T
  logUpdate: ITypeLogUpdate<'mkt_labs'>
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
