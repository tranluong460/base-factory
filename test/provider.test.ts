import { describe, it } from 'vitest'
import { EnumFacebookProvider, FacebookProviderFacade } from '../src'

describe('provider', () => {
  it('aUTOMATED', async () => {
    await FacebookProviderFacade.getProvider({
      type: EnumFacebookProvider.AUTOMATED,
      logUpdate: async () => true,
      data: 'data',
    })
  })

  it('sCRIPTED', async () => {
    await FacebookProviderFacade.getProvider({
      type: EnumFacebookProvider.SCRIPTED,
      logUpdate: async () => true,
      data: 'data',
    })
  })

  it('dIRECT_API', async () => {
    await FacebookProviderFacade.getProvider({
      type: EnumFacebookProvider.DIRECT_API,
      logUpdate: async () => true,
      data: 'data',
    })
  })
})
