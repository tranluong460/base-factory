import type { IProviderFactory } from '../interfaces'
import type { EnumProvider } from '../types'

export class ProviderRegistry {
  private static factories = new Map<string, IProviderFactory>()

  static register(type: EnumProvider, factory: IProviderFactory): void {
    this.factories.set(type, factory)
  }

  static getFactory(type: EnumProvider): IProviderFactory {
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
