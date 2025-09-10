import { CoreLogger } from '../../../../core'

export class WWWAutomatedActions {
  private readonly logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }

  async startAutomated(): Promise<void> {
    this.logger.info('WWWAutomatedActions start')
  }
}
