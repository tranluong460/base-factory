import type { IPayloadProvider } from '../../../../interfaces'
import type { EnumLabsProvider } from '../../../../utils'
import { LabsBaseClass } from '../../../shared'

export class ActionExample extends LabsBaseClass {
  constructor(payload: IPayloadProvider<EnumLabsProvider.DIRECT_API>) {
    super(payload, 'direct_api.action_example')
  }

  public async start(): Promise<void> {
    await this.logUpdate('start', [123])

    await this.logUpdate('end', [456])
  }
}
