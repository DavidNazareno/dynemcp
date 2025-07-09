// core/types.ts
// Types for DyneMCP CLI dev command options
// Defines DevMode and DevOptions for CLI argument parsing and handler logic.
type DevMode = 'default' | 'inspector'
export type DevOptions = {
  mode?: DevMode
  internalRun?: boolean
  environment?: 'dev' | 'prod'
  _: string[]
  entry?: string
  outDir?: string
  outFile?: string
  clean?: boolean
  external?: string
  define?: string
  watch?: boolean // Habilita modo watch/hot reload
}
