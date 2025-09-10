import { CoreLogger } from '../../../../core'

export class WWWApiActions {
  private readonly logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }

  async startApi(): Promise<void> {
    this.logger.info('WWWApiActions start')
  }
}
