import { CoreLogger } from '@vitechgroup/mkt-elec-core'
import type { EnumLabsProvider } from '../utils'

export class LabsPluginLoader {
  static async loadPlugin(providerId: EnumLabsProvider): Promise<void> {
    try {
      const plugin = await import(`../providers/${providerId}/index.ts`)
      if (plugin.register) {
        plugin.register()
      } else {
        throw new Error(`[Plugin Loader] No register in ${providerId}`)
      }
    } catch (err) {
      CoreLogger.getInstance().error(`[Plugin Loader] Failed to load ${providerId}:`, err)
      throw err
    }
  }
}
