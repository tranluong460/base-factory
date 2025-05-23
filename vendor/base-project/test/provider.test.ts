import { describe, it } from 'vitest'
import { EnumProvider, ProviderFacade } from '../src'

describe('provider', () => {
  it('start', async () => {
    const provider = await ProviderFacade.getProvider(EnumProvider.NAME)
    await provider.start()
  })
})
