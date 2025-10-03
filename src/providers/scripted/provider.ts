import type { IPayloadProvider, IScriptedProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'

export class ScriptedProvider implements IScriptedProvider {
  constructor(private payload: IPayloadProvider<EnumLabsProvider.SCRIPTED>) {}

  public async start(): Promise<void> {
    console.log(this.payload)
  }
}
