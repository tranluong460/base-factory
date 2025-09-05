import { describe, it } from 'vitest'
import { EnumFacebookProvider, FacebookProviderFacade } from '../src'

describe('provider', () => {
  it('www', async () => {
    const www = await FacebookProviderFacade.getProvider({
      type: EnumFacebookProvider.WWW,
      logUpdate: async () => true,
    })
    await www.useApi.startApi()
  })

  it('business', async () => {
    const business = await FacebookProviderFacade.getProvider({
      type: EnumFacebookProvider.BUSINESS,
      logUpdate: async () => true,
    })
    await business.useApi.startApi()
  })
})
