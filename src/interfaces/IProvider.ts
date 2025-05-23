export interface IProvider {
  start: () => Promise<boolean>
}
