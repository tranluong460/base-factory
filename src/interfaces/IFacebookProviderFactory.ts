import type { IBusinessProvider, IPayloadProvider, IWWWProvider } from '.'

export interface IFacebookProviderFactory {
  create: (payload: IPayloadProvider) => IWWWProvider | IBusinessProvider
}
