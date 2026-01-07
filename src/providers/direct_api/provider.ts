import type { IDirectApiProvider, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { ActionExample } from './services'

export class DirectApiProvider implements IDirectApiProvider {
  private actionExample: ActionExample

  constructor(private payload: IPayloadProvider<EnumLabsProvider.DIRECT_API>) {
    this.actionExample = new ActionExample(this.payload)
  }

  public async start(): Promise<void> {
    await this.actionExample.start()
  }
}
