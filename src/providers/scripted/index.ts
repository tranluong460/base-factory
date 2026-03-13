import { LabsProviderRegistry } from '../../core/LabsProviderRegistry'
import { EnumLabsProvider } from '../../utils'
import { ScriptedFactory } from './factory'

export function register(): void {
  LabsProviderRegistry.register(EnumLabsProvider.SCRIPTED, new ScriptedFactory())
}
