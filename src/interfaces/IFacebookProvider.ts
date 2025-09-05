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

export type ITypeLogUpdate = (options: IPayloadLogUpdate) => Promise<boolean>

export interface IPayloadProvider<T extends EnumFacebookProvider> {
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

// --------------------------------------------------//

interface IPayloadLogUpdate {
  action: string
  key: string
  mess: string
  success?: boolean
  module?: 'mkt_fb' | undefined
  uidTarget?: string | undefined
}
