import type { EnumProvider } from '../types'

export class PluginLoader {
  static async loadPlugin(providerId: EnumProvider): Promise<void> {
    try {
      const plugin = await import(`../providers/${providerId}/index.ts`)
      if (plugin.register) {
        console.log('[Plugin Loader] Register plugin:', providerId)
        plugin.register()
      } else {
        throw new Error(`[Plugin Loader] No register in ${providerId}`)
      }
    } catch (err) {
      console.error(`[Plugin Loader] Failed to load ${providerId}:`, err)
      throw err
    }
  }
}
