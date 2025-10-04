import type {
  IFacebookProviderFactory,
  IPayloadProvider,
  IScriptedProvider,
} from '../../interfaces'
import type { EnumFacebookProvider } from '../../utils'
import { ScriptedProvider } from './provider'

export class ScriptedFactory implements IFacebookProviderFactory {
  create(payload: IPayloadProvider<EnumFacebookProvider>): IScriptedProvider {
    return new ScriptedProvider(payload as IPayloadProvider<EnumFacebookProvider.SCRIPTED>)
  }
}
