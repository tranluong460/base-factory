import type { EnumLabsProvider } from '../../utils'
import type {
  IAutomatedProvider,
  IDirectApiProvider,
  IPayloadProvider,
  IScriptedProvider,
} from './types'

export interface ILabsProviderFactory {
  create: (
    payload: IPayloadProvider<EnumLabsProvider>
  ) => IScriptedProvider | IAutomatedProvider | IDirectApiProvider
}
