import type { IDirectApiProvider, IPayloadProvider } from '../../interfaces'
import type { EnumFacebookProvider } from '../../utils'

export class DirectApiProvider implements IDirectApiProvider {
  constructor(private payload: IPayloadProvider<EnumFacebookProvider.DIRECT_API>) {}

  public async start(): Promise<void> {
    console.log(this.payload)
  }
}
