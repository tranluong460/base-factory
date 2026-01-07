import { BaseClass } from '@vitechgroup/mkt-elec-core'
import type { IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'

export class LabsBaseClass extends BaseClass {
  private payload: IPayloadProvider<EnumLabsProvider>
  private actionKey: string

  constructor(payload: IPayloadProvider<EnumLabsProvider>, actionKey: string) {
    super()

    this.payload = payload
    this.actionKey = actionKey
  }

  protected async logUpdate(
    key: string,
    params: (string | number)[] = [],
    success?: boolean,
  ): Promise<void> {
    const fullParams = [this.payload.keyTarget, ...params].filter((p) => p !== '')

    const paramString = fullParams.length > 0 ? `|${fullParams.join('|')}` : ''

    await this.payload.logUpdate({
      action: this.actionKey,
      key,
      mess: `${this.actionKey}.${key}${paramString}`, // Format: action.key|param1|param2|...
      success,
      uidTarget: this.payload.keyTarget,
    })
  }
}
