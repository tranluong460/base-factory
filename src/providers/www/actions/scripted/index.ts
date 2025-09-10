import { CoreLogger } from '../../../../core'

export class WWWScriptedActions {
  private readonly logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }

  async startScripted(): Promise<void> {
    this.logger.info('WWWScriptedActions start')
  }
}
