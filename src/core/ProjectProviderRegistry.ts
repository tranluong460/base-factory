import type { IProjectProviderFactory } from '../interfaces'
import type { EnumProjectProvider } from '../utils'

export class ProjectProviderRegistry {
  private static factories = new Map<string, IProjectProviderFactory>()

  static register(type: EnumProjectProvider, factory: IProjectProviderFactory): void {
    this.factories.set(type, factory)
  }

  static getFactory(type: EnumProjectProvider): IProjectProviderFactory {
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
