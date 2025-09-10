import type { IFacebookProviderFactory, IPayloadProvider, IWWWProvider } from '../../interfaces'
import { WWWProvider } from './provider'

export class WWWFactory implements IFacebookProviderFactory {
  create(payload: IPayloadProvider): IWWWProvider {
    return new WWWProvider(payload)
  }
}
