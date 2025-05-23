import type { IProvider } from '../interfaces'
import type { EnumProvider } from '../types'
import { PluginLoader } from './PluginLoader'
import { ProviderRegistry } from './ProviderRegistry'

export class ProviderFacade {
  static async getProvider(type: EnumProvider): Promise<IProvider> {
    await PluginLoader.loadPlugin(type)
    return ProviderRegistry.getFactory(type).create()
  }
}
