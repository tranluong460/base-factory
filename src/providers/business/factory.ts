import type { IBusinessProvider, IFacebookProviderFactory } from '../../interfaces'
import { BusinessProvider } from './provider'

export class BusinessFactory implements IFacebookProviderFactory {
  create(): IBusinessProvider {
    return new BusinessProvider()
  }
}
