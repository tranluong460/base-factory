import { FacebookProviderRegistry } from '../../core'
import { EnumFacebookProvider } from '../../utils'
import { DirectApiFactory } from './factory'

export function register(): void {
  FacebookProviderRegistry.register(EnumFacebookProvider.DIRECT_API, new DirectApiFactory())
}
