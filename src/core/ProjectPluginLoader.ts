import type { EnumProjectProvider } from '../utils'
import { ProjectLogger } from './ProjectLogger'

export class ProjectPluginLoader {
  static async loadPlugin(providerId: EnumProjectProvider): Promise<void> {
    const logger = ProjectLogger.getInstance()
    try {
      const plugin = await import(`../providers/${providerId}/index.ts`)
      if (plugin.register) {
        plugin.register()
      } else {
        throw new Error(`[Plugin Loader] No register in ${providerId}`)
      }
    } catch (err) {
      logger.error(`[Plugin Loader] Failed to load ${providerId}:`, err)
      throw err
    }
  }
}
