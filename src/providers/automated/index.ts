import { FacebookProviderRegistry } from '../../core'
import { EnumFacebookProvider } from '../../utils'
import { AutomatedFactory } from './factory'

export function register(): void {
  FacebookProviderRegistry.register(EnumFacebookProvider.AUTOMATED, new AutomatedFactory())
}
