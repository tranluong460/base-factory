import type { IProvider } from '../../interfaces'

export class NameProvider implements IProvider {
  constructor() {
    //
  }

  async start(): Promise<boolean> {
    console.log('NameProvider start')

    return true
  }
}
