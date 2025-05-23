import type { IProvider, IProviderFactory } from '../../interfaces'
import { NameProvider } from './provider'

export class NameFactory implements IProviderFactory {
  create(): IProvider {
    return new NameProvider()
  }
}
