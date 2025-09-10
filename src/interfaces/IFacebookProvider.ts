import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import type {
  BusinessApiActions,
  BusinessAutomatedActions,
  BusinessScriptedActions,
} from '../providers/business/actions'
import type {
  WWWApiActions,
  WWWAutomatedActions,
  WWWScriptedActions,
} from '../providers/www/actions'
import type { EnumFacebookProvider } from '../utils'

export interface ProviderTypeMap {
  [EnumFacebookProvider.WWW]: IWWWProvider
  [EnumFacebookProvider.BUSINESS]: IBusinessProvider
}

export interface IPayloadProvider<T = EnumFacebookProvider> {
  type: T
  logUpdate: ITypeLogUpdate
}

export interface IWWWProvider {
  readonly useApi: WWWApiActions
  readonly useAutomated: WWWAutomatedActions
  readonly useScripted: WWWScriptedActions
}

export interface IBusinessProvider {
  readonly useApi: BusinessApiActions
  readonly useAutomated: BusinessAutomatedActions
  readonly useScripted: BusinessScriptedActions
}
