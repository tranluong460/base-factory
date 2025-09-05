import type { IFacebookProviderFactory } from '../interfaces'
import type { EnumFacebookProvider } from '../utils'

export class FacebookProviderRegistry {
  private static factories = new Map<string, IFacebookProviderFactory>()

  static register(type: EnumFacebookProvider, factory: IFacebookProviderFactory): void {
    this.factories.set(type, factory)
  }

  static getFactory(type: EnumFacebookProvider): IFacebookProviderFactory {
    const factory = this.factories.get(type)
    if (!factory) {
      throw new Error(`[Provider Registry] No factory registered for '${type}'`)
    }
    return factory
  }

  static listProviders(): string[] {
    return Array.from(this.factories.keys())
  }
}
