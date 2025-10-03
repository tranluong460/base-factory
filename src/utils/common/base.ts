import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import { CoreLogger } from '@vitechgroup/mkt-elec-core'

export class Base {
  protected logger: CoreLogger

  constructor() {
    this.logger = CoreLogger.getInstance()
  }
}

export class BaseProvider<T extends { logUpdate: ITypeLogUpdate }> extends Base {
  protected clientMutationId: number = 0
  protected utilActions: T

  constructor(utilActions: T) {
    super()

    this.utilActions = utilActions
  }

  protected async log(isSuccess: boolean, actionName: string, params?: string[]): Promise<void> {
    const statusKey = actionName + (isSuccess ? '_success' : '_failed')

    await this.utilActions.logUpdate({
      action: actionName,
      key: statusKey,
      mess: params && params.length > 0 ? `${statusKey}|${params.join('|')}` : statusKey,
    })
  }
}
