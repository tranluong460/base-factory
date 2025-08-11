import type { IProjectProvider } from '../interfaces'
import type { EnumProjectProvider } from '../utils'
import { ProjectPluginLoader, ProjectProviderRegistry } from '.'

export class ProjectProviderFacade {
  static async getProvider(type: EnumProjectProvider): Promise<IProjectProvider> {
    await ProjectPluginLoader.loadPlugin(type)
    return ProjectProviderRegistry.getFactory(type).create()
  }
}
