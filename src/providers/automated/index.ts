import { LabsProviderRegistry } from '../../core'
import { EnumLabsProvider } from '../../utils'
import { AutomatedFactory } from './factory'

export function register(): void {
  LabsProviderRegistry.register(EnumLabsProvider.AUTOMATED, new AutomatedFactory())
}
