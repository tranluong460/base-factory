import type { IPayloadProvider, IScriptedProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { ActionExample } from './services'

export class ScriptedProvider implements IScriptedProvider {
  private actionExample: ActionExample

  constructor(private payload: IPayloadProvider<EnumLabsProvider.SCRIPTED>) {
    this.actionExample = new ActionExample(this.payload)
  }

  public async start(): Promise<void> {
    await this.actionExample.start()
  }
}
