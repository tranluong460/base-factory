import { CoreLogger } from '../../../../core'

export class BusinessAutomatedActions {
  private readonly logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }

  async startAutomated(): Promise<void> {
    this.logger.info('BusinessAutomatedActions start')
  }
}
