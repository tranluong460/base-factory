import type { EnumFacebookProvider } from '../utils'
import type { IBusinessProvider, IPayloadProvider, IWWWProvider } from '.'

export interface IFacebookProviderFactory<T = EnumFacebookProvider> {
  create: (payload: IPayloadProvider<T>) => IWWWProvider | IBusinessProvider
}
