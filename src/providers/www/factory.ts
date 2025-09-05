import type { IFacebookProviderFactory, IWWWProvider } from '../../interfaces'
import { WWWProvider } from './provider'

export class WWWFactory implements IFacebookProviderFactory {
  create(): IWWWProvider {
    return new WWWProvider()
  }
}
