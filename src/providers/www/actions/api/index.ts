import { CoreLogger } from '@vitechgroup/mkt-elec-core'
import type { IPayloadProvider } from '../../../../interfaces'

export class WWWApiActions {
  private readonly logger: CoreLogger

  private payload: IPayloadProvider

  constructor(payload: IPayloadProvider) {
    this.logger = CoreLogger.getInstance()

    this.payload = payload
  }

  async startApi(): Promise<void> {
    this.logger.info('payload', this.payload)
    this.logger.info('WWWApiActions start')
  }
}
