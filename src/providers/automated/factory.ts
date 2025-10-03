import type { IAutomatedProvider, ILabsProviderFactory, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { AutomatedProvider } from './provider'

export class AutomatedFactory implements ILabsProviderFactory {
  create(payload: IPayloadProvider<EnumLabsProvider>): IAutomatedProvider {
    return new AutomatedProvider(payload as IPayloadProvider<EnumLabsProvider.AUTOMATED>)
  }
}
