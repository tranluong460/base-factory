import type { ILabsProviderFactory, IPayloadProvider, IScriptedProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { ScriptedProvider } from './provider'

export class ScriptedFactory implements ILabsProviderFactory {
  create(payload: IPayloadProvider<EnumLabsProvider>): IScriptedProvider {
    return new ScriptedProvider(payload as IPayloadProvider<EnumLabsProvider.SCRIPTED>)
  }
}
