import { FacebookLogger } from '../../../../core'

export class WWWScriptedActions {
  private readonly logger: FacebookLogger

  constructor() {
    this.logger = FacebookLogger.getInstance()
  }

  async startScripted(): Promise<void> {
    this.logger.info('WWWScriptedActions start')
  }
}
