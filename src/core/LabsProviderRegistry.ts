import type { ILabsProviderFactory } from '../interfaces'
import type { EnumLabsProvider } from '../utils'

export class LabsProviderRegistry {
  private static factories = new Map<string, ILabsProviderFactory>()

  static register(type: EnumLabsProvider, factory: ILabsProviderFactory): void {
    this.factories.set(type, factory)
  }

  static getFactory(type: EnumLabsProvider): ILabsProviderFactory {
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
