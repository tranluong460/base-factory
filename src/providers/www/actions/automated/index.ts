import { FacebookLogger } from '../../../../core'

export class WWWAutomatedActions {
  private readonly logger: FacebookLogger

  constructor() {
    this.logger = FacebookLogger.getInstance()
  }

  async startAutomated(): Promise<void> {
    this.logger.info('WWWAutomatedActions start')
  }
}
