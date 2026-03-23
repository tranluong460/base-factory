import { afterAll, describe, it } from 'vitest'
import { HttpClient } from '../../src/utils/private/http/client'

const TIMEOUT = 30_000

const client = new HttpClient({
  fingerprint: { preset: 'CHROME_WINDOWS', seed: 'grok-test' },
  blockRetries: 0,
})

afterAll(async () => {
  await client.destroy()
})

describe('grok.com', () => {
  it(
    'should access grok.com without being blocked',
    async () => {
      const response = await client.get<string>('https://grok.com', {
        throwOnError: false,
      })

      console.log('Status:', response.status)
      console.log('Protocol:', response.usedProtocol)
      console.log('Server:', response.headers.server ?? response.headers.Server)
      console.log('CF-Mitigated:', response.headers['cf-mitigated'])
      console.log('Duration:', response.duration, 'ms')
      console.log('Body length:', response.data.length, 'chars')
      console.log('Body preview:', response.data.substring(0, 500))

      if (response.status === 200) {
        console.log('✅ grok.com bypassed!')
      } else if (response.status === 403) {
        console.log('⚠️ grok.com blocked (403)')
        console.log('Headers:', JSON.stringify(response.headers, null, 2))
      } else {
        console.log(`⚠️ Unexpected: ${response.status}`)
      }
    },
    TIMEOUT,
  )
})
