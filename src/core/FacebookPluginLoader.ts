import { CoreLogger } from '@vitechgroup/mkt-elec-core'
import type { EnumFacebookProvider } from '../utils'

export class FacebookPluginLoader {
  static async loadPlugin(providerId: EnumFacebookProvider): Promise<void> {
    const logger = CoreLogger.getInstance()
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
