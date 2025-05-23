import { afterAll, beforeAll } from 'vitest'

beforeAll(async () => {
  console.log('beforeAll')
})

afterAll(async () => {
  console.log('afterAll')
})
