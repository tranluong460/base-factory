import type { IDirectApiProvider, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'

export class DirectApiProvider implements IDirectApiProvider {
  constructor(private payload: IPayloadProvider<EnumLabsProvider.DIRECT_API>) {}

  public async start(): Promise<void> {
    console.log(this.payload)
  }
}
