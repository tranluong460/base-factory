import { describe, it } from 'vitest'
import { EnumLabsProvider, LabsProviderFacade } from '../src'

describe('provider', () => {
  it.skip('aUTOMATED', async () => {
    await LabsProviderFacade.getProvider({
      type: EnumLabsProvider.AUTOMATED,
      logUpdate: async () => true,
      data: 'data',
    })
  })

  it.skip('sCRIPTED', async () => {
    await LabsProviderFacade.getProvider({
      type: EnumLabsProvider.SCRIPTED,
      logUpdate: async () => true,
      data: 'data',
    })
  })

  it.skip('dIRECT_API', async () => {
    await LabsProviderFacade.getProvider({
      type: EnumLabsProvider.DIRECT_API,
      logUpdate: async () => true,
      labsConfig: {
        cookies: 'data',
      },
    })
  })
})
