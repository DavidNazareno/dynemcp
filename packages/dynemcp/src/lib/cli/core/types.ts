// core/types.ts
type DevMode = 'default' | 'inspector'
export type DevOptions = {
  mode?: DevMode
  internalRun?: boolean
  clean?: boolean
  config?: string
  transport?: string
  port?: number
  host?: string
  _: string[]
}
