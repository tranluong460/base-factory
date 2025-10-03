import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import type {
  DirectApiProjectsActions,
  UtilDirectApiActions,
} from '../../providers/direct_api/actions'
import type { EnumLabsProvider } from '../../utils'
import type { IPayloadLabsCall } from '../api'

export interface ProviderTypeMap {
  [EnumLabsProvider.SCRIPTED]: IScriptedProvider
  [EnumLabsProvider.AUTOMATED]: IAutomatedProvider
  [EnumLabsProvider.DIRECT_API]: IDirectApiProvider
}

export interface PayloadConfigMap {
  [EnumLabsProvider.SCRIPTED]: any
  [EnumLabsProvider.AUTOMATED]: any
  [EnumLabsProvider.DIRECT_API]: { labsConfig: IPayloadLabsCall }
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
  useUtils: UtilDirectApiActions
  useProjects: DirectApiProjectsActions
}
