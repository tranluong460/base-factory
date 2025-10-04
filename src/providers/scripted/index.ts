import { FacebookProviderRegistry } from '../../core'
import { EnumFacebookProvider } from '../../utils'
import { ScriptedFactory } from './factory'

export function register(): void {
  FacebookProviderRegistry.register(EnumFacebookProvider.SCRIPTED, new ScriptedFactory())
}
