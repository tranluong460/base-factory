export interface IProjectProvider {
  start: () => Promise<boolean>
}
