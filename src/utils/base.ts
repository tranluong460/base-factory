import { CoreLogger } from '@vitechgroup/mkt-elec-core'

export class Base {
  protected logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }
}
