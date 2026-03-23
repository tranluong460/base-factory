import type { IPayloadProvider, ProviderTypeMap } from '../interfaces'
import type { EnumLabsProvider } from '../utils'
import { LabsPluginLoader } from './LabsPluginLoader'
import { LabsProviderRegistry } from './LabsProviderRegistry'

export class LabsProviderFacade {
  static async getProvider<T extends EnumLabsProvider>(
    payload: IPayloadProvider<T>
  ): Promise<ProviderTypeMap[T]> {
    await LabsPluginLoader.loadPlugin(payload.type)
    return LabsProviderRegistry.getFactory(payload.type).create(payload) as ProviderTypeMap[T]
  }
}
