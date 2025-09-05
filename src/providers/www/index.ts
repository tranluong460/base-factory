import { FacebookProviderRegistry } from '../../core'
import { EnumFacebookProvider } from '../../utils'
import { WWWFactory } from './factory'

export function register(): void {
  FacebookProviderRegistry.register(EnumFacebookProvider.WWW, new WWWFactory())
}
