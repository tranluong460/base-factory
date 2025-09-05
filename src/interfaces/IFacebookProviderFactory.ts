import type { EnumFacebookProvider } from '../utils'
import type { IBusinessProvider, IPayloadProvider, IWWWProvider } from '.'

export interface IFacebookProviderFactory<T extends EnumFacebookProvider = EnumFacebookProvider> {
  create: (payload: IPayloadProvider<T>) => IWWWProvider | IBusinessProvider
}
