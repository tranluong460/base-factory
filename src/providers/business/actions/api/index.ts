import { FacebookLogger } from '../../../../core'

export class BusinessApiActions {
  private readonly logger: FacebookLogger

  constructor() {
    this.logger = FacebookLogger.getInstance()
  }

  async startApi(): Promise<void> {
    this.logger.info('BusinessApiActions start')
  }
}
