import { CoreLogger } from '@vitechgroup/mkt-elec-core'

export async function logUpdate(o: any) {
  CoreLogger.getInstance().info('logUpdate', o)
  return true
}
