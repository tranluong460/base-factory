import type { IBrowserProvider } from '@vitechgroup/mkt-browser'
import type { ITypeLogUpdate } from '@vitechgroup/mkt-elec-core'
import { LabsProviderFacade } from './core'
import type {
  IAutomatedProvider,
  IDirectApiProvider,
  IPayloadLabsCall,
  IScriptedProvider,
} from './interfaces'
import { EnumLabsProvider } from './utils'

export class LabsManager {
  private scriptedProvider: IScriptedProvider | undefined
  private automatedProvider: IAutomatedProvider | undefined
  private directApiProvider: IDirectApiProvider | undefined

  public async initBrowser(browserProvider: IBrowserProvider, logUpdate: ITypeLogUpdate<'mkt_fb'>) {
    const payload = {
      logUpdate,
      browserProvider,
    }

    this.scriptedProvider = await LabsProviderFacade.getProvider<EnumLabsProvider.SCRIPTED>({
      ...payload,
      type: EnumLabsProvider.SCRIPTED,
    })

    this.automatedProvider = await LabsProviderFacade.getProvider<EnumLabsProvider.AUTOMATED>({
      ...payload,
      type: EnumLabsProvider.AUTOMATED,
    })

    return this
  }

  public async initDirectApi(labsConfig: IPayloadLabsCall, logUpdate: ITypeLogUpdate<'mkt_labs'>) {
    this.directApiProvider = await LabsProviderFacade.getProvider<EnumLabsProvider.DIRECT_API>({
      type: EnumLabsProvider.DIRECT_API,
      logUpdate,
      labsConfig,
    })

    return this
  }

  public get scripted(): IScriptedProvider {
    if (!this.scriptedProvider) {
      throw new Error('Scripted provider not initialized. Call initBrowser() or initAll() first.')
    }
    return this.scriptedProvider
  }

  public get automated(): IAutomatedProvider {
    if (!this.automatedProvider) {
      throw new Error('Automated provider not initialized. Call initBrowser() or initAll() first.')
    }
    return this.automatedProvider
  }

  public get directApi(): IDirectApiProvider {
    if (!this.directApiProvider) {
      throw new Error(
        'Direct API provider not initialized. Call initDirectApi() or initAll() first.',
      )
    }
    return this.directApiProvider
  }
}
