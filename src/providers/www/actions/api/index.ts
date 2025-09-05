import { FacebookLogger } from '../../../../core'

export class WWWApiActions {
  private readonly logger: FacebookLogger

  constructor() {
    this.logger = FacebookLogger.getInstance()
  }

  async startApi(): Promise<void> {
    this.logger.info('WWWApiActions start')
  }
}
