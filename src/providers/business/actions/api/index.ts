import { CoreLogger } from '@vitechgroup/mkt-elec-core'

export class BusinessApiActions {
  private readonly logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }

  async startApi(): Promise<void> {
    this.logger.info('BusinessApiActions start')
  }
}
