import type {
  IAutomatedProvider,
  IFacebookProviderFactory,
  IPayloadProvider,
} from '../../interfaces'
import type { EnumFacebookProvider } from '../../utils'
import { AutomatedProvider } from './provider'

export class AutomatedFactory implements IFacebookProviderFactory {
  create(payload: IPayloadProvider<EnumFacebookProvider>): IAutomatedProvider {
    return new AutomatedProvider(payload as IPayloadProvider<EnumFacebookProvider.AUTOMATED>)
  }
}
