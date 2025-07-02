// core/types.ts
// Types for DyneMCP CLI dev command options
// Defines DevMode and DevOptions for CLI argument parsing and handler logic.
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
