import { encodeBase64Mkt } from '@vitechgroup/mkt-key-client'
import { describe, it } from 'vitest'
import { GOOGLE_LABS_FLOW } from '../src/utils/labs-call/private'

describe('base64', () => {
  it.skip('encode', async () => {
    console.log(encodeBase64Mkt(GOOGLE_LABS_FLOW))
  })

  it.skip('decode', async () => {
    //
  })
})
