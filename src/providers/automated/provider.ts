import type { IAutomatedProvider, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { ActionExample } from './services'

export class AutomatedProvider implements IAutomatedProvider {
  private actionExample: ActionExample

  constructor(private payload: IPayloadProvider<EnumLabsProvider.AUTOMATED>) {
    this.actionExample = new ActionExample(this.payload)
  }

  public async start(): Promise<void> {
    await this.actionExample.start()
  }
}
