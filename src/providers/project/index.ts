import { ProjectProviderRegistry } from '../../core'
import { EnumProjectProvider } from '../../utils'
import { ProjectFactory } from './factory'

export function register(): void {
  ProjectProviderRegistry.register(EnumProjectProvider.NAME, new ProjectFactory())
}
