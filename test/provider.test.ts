import { describe, it } from 'vitest'
import { EnumLabsProvider, LabsProviderFacade } from '../src'

async function logUpdate(payload) {
  console.warn('logUpdate', payload)
  return true
}

describe('provider', () => {
  it('aUTOMATED', async () => {
    const provider = await LabsProviderFacade.getProvider({
      keyTarget: '0367370371',
      type: EnumLabsProvider.AUTOMATED,
      logUpdate,
      example: { example1: 'AUTOMATED example1', example2: 1 },
    })

    await provider.start()
  })

  it('sCRIPTED', async () => {
    const provider = await LabsProviderFacade.getProvider({
      keyTarget: '0367370371',
      type: EnumLabsProvider.SCRIPTED,
      logUpdate,
      example: { example1: 'SCRIPTED example1', example2: 1 },
    })

    await provider.start()
  })

  it('dIRECT_API', async () => {
    const provider = await LabsProviderFacade.getProvider({
      keyTarget: '0367370371',
      type: EnumLabsProvider.DIRECT_API,
      logUpdate,
      example: { example1: 'DIRECT_API example1', example2: 1 },
    })

    await provider.start()
  })
})
