import { describe, it } from 'vitest'
import { EnumLabsProvider, LabsProviderFacade } from '../src'

async function logUpdate(payload) {
  console.warn('logUpdate', payload)
  return true
}

describe.skip('provider', () => {
  it(EnumLabsProvider.AUTOMATED, async () => {
    const provider = await LabsProviderFacade.getProvider({
      keyTarget: '0367370371',
      type: EnumLabsProvider.AUTOMATED,
      logUpdate,
      example: { example1: `${EnumLabsProvider.AUTOMATED} example1`, example2: 1 },
    })

    await provider.start()
  })

  it(EnumLabsProvider.SCRIPTED, async () => {
    const provider = await LabsProviderFacade.getProvider({
      keyTarget: '0367370371',
      type: EnumLabsProvider.SCRIPTED,
      logUpdate,
      example: { example1: `${EnumLabsProvider.SCRIPTED} example1`, example2: 1 },
    })

    await provider.start()
  })

  it(EnumLabsProvider.DIRECT_API, async () => {
    const provider = await LabsProviderFacade.getProvider({
      keyTarget: '0367370371',
      type: EnumLabsProvider.DIRECT_API,
      logUpdate,
      example: { example1: `${EnumLabsProvider.DIRECT_API} example1`, example2: 1 },
    })

    await provider.start()
  })
})
