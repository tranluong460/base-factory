import type { EnumFacebookProvider } from '../../utils'
import type {
  IAutomatedProvider,
  IDirectApiProvider,
  IPayloadProvider,
  IScriptedProvider,
} from './types'

export interface IFacebookProviderFactory {
  create: (
    payload: IPayloadProvider<EnumFacebookProvider>
  ) => IScriptedProvider | IAutomatedProvider | IDirectApiProvider
}
