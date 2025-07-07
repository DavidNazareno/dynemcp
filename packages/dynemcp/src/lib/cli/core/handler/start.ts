import chalk from 'chalk'
import { loadConfig } from '../../../server/config'
import { createMCPServer } from '../../../server'

export async function startHandler(argv: any) {
  console.log(chalk.green('🚀 Starting DyneMCP production server...'))
  const config = await loadConfig(argv.config)
  const server = await createMCPServer(config)
  await server.start()
}
