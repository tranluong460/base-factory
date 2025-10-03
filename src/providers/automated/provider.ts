import type { IAutomatedProvider, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'

export class AutomatedProvider implements IAutomatedProvider {
  constructor(private payload: IPayloadProvider<EnumLabsProvider.AUTOMATED>) {}

  public async start(): Promise<void> {
    console.log(this.payload)
  }
}
