import { ProviderRegistry } from '../../core'
import { EnumProvider } from '../../types'
import { NameFactory } from './factory'

export function register(): void {
  ProviderRegistry.register(EnumProvider.NAME, new NameFactory())
}
