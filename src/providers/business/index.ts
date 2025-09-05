import { FacebookProviderRegistry } from '../../core'
import { EnumFacebookProvider } from '../../utils'
import { BusinessFactory } from './factory'

export function register(): void {
  FacebookProviderRegistry.register(EnumFacebookProvider.BUSINESS, new BusinessFactory())
}
