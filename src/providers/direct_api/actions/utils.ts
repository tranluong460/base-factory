import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import type { IPayloadLabsCall } from '../../../interfaces'
import { Base, LabsCallClient } from '../../../utils'

export class UtilDirectApiActions extends Base {
  public uidTarget: string | undefined
  public labsClient: LabsCallClient

  public logUpdate: ITypeLogUpdate

  constructor(labsConfig: IPayloadLabsCall, logUpdate: ITypeLogUpdate<'mkt_labs'>) {
    super()

    this.labsClient = new LabsCallClient(labsConfig)
    this.logUpdate = async (options) =>
      await logUpdate({ ...options, uidTarget: this.uidTarget, module: 'mkt_labs' })
  }

  public setUidTargetLog(uid: string) {
    this.uidTarget = uid
  }
}
