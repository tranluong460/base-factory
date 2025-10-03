export interface IPayloadRequestLabsCall {
  method: 'GET' | 'POST'
  endpoint: string
  data: object
}

export interface ICustomResponseLabs<T> {
  result: {
    data: {
      json: {
        result: T
        status: number
        statusText: string
      }
    }
  }
}
