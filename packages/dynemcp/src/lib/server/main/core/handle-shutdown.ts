import type { DyneMCP } from './server'

export function handleGracefulShutdown(server: DyneMCP, silent = false) {
  const cleanup = async () => {
    if (!silent) {
      console.warn('\nApagando DyneMCP...')
    }
    await server.stop()
    process.exit(0)
  }
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}
