import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import type { EnumLabsProvider } from '../../utils'

export interface ProviderTypeMap {
  [EnumLabsProvider.SCRIPTED]: IScriptedProvider
  [EnumLabsProvider.AUTOMATED]: IAutomatedProvider
  [EnumLabsProvider.DIRECT_API]: IDirectApiProvider
}

export interface PayloadConfigMap {
  [EnumLabsProvider.SCRIPTED]: { example: { example1: string, example2: number } }
  [EnumLabsProvider.AUTOMATED]: { example: { example1: string, example2: number } }
  [EnumLabsProvider.DIRECT_API]: { example: { example1: string, example2: number } }
}

export type IPayloadProvider<T extends EnumLabsProvider> = {
  type: T
  keyTarget: string
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
