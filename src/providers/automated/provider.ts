import type { IAutomatedProvider, IPayloadProvider } from '../../interfaces'
import type { EnumFacebookProvider } from '../../utils'

export class AutomatedProvider implements IAutomatedProvider {
  constructor(private payload: IPayloadProvider<EnumFacebookProvider.AUTOMATED>) {}

  public async start(): Promise<void> {
    console.log(this.payload)
  }
}
