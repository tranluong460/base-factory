import type { IPayloadProvider, ProviderTypeMap } from '../interfaces'
import type { EnumFacebookProvider } from '../utils'
import { FacebookPluginLoader, FacebookProviderRegistry } from '.'

export class FacebookProviderFacade {
  static async getProvider<T extends EnumFacebookProvider>(
    payload: IPayloadProvider<T>,
  ): Promise<ProviderTypeMap[T]> {
    await FacebookPluginLoader.loadPlugin(payload.type)
    return FacebookProviderRegistry.getFactory(payload.type).create(payload) as ProviderTypeMap[T]
  }
}
