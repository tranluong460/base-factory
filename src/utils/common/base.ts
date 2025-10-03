import { CoreLogger } from '@vitechgroup/mkt-elec-core'

export class Base {
  protected logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }
}

export class BaseProvider<T> extends Base {
  protected clientMutationId: number = 0
  protected utilActions: T

  constructor(utilActions: T) {
    super()

    this.utilActions = utilActions
  }
}
