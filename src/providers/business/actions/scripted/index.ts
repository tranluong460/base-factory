import { FacebookLogger } from '../../../../core'

export class BusinessScriptedActions {
  private readonly logger: FacebookLogger

  constructor() {
    this.logger = FacebookLogger.getInstance()
  }

  async startScripted(): Promise<void> {
    this.logger.info('BusinessScriptedActions start')
  }
}
