import { FacebookLogger } from '../../../../core'

export class BusinessAutomatedActions {
  private readonly logger: FacebookLogger

  constructor() {
    this.logger = FacebookLogger.getInstance()
  }

  async startAutomated(): Promise<void> {
    this.logger.info('BusinessAutomatedActions start')
  }
}
