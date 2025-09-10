import { CoreLogger } from '@vitechgroup/mkt-elec-core'

export class BusinessScriptedActions {
  private readonly logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }

  async startScripted(): Promise<void> {
    this.logger.info('BusinessScriptedActions start')
  }
}
