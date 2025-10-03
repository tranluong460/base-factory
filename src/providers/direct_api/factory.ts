import type { IDirectApiProvider, ILabsProviderFactory, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { DirectApiProvider } from './provider'

export class DirectApiFactory implements ILabsProviderFactory {
  create(payload: IPayloadProvider<EnumLabsProvider>): IDirectApiProvider {
    return new DirectApiProvider(payload as IPayloadProvider<EnumLabsProvider.DIRECT_API>)
  }
}
