import type {
  IDirectApiProvider,
  IFacebookProviderFactory,
  IPayloadProvider,
} from '../../interfaces'
import type { EnumFacebookProvider } from '../../utils'
import { DirectApiProvider } from './provider'

export class DirectApiFactory implements IFacebookProviderFactory {
  create(payload: IPayloadProvider<EnumFacebookProvider>): IDirectApiProvider {
    return new DirectApiProvider(payload as IPayloadProvider<EnumFacebookProvider.DIRECT_API>)
  }
}
