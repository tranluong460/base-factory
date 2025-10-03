import { LabsProviderRegistry } from '../../core'
import { EnumLabsProvider } from '../../utils'
import { DirectApiFactory } from './factory'

export function register(): void {
  LabsProviderRegistry.register(EnumLabsProvider.DIRECT_API, new DirectApiFactory())
}
