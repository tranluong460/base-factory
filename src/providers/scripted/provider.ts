import type { IPayloadProvider, IScriptedProvider } from '../../interfaces'
import type { EnumFacebookProvider } from '../../utils'

export class ScriptedProvider implements IScriptedProvider {
  constructor(private payload: IPayloadProvider<EnumFacebookProvider.SCRIPTED>) {}

  public async start(): Promise<void> {
    console.log(this.payload)
  }
}
