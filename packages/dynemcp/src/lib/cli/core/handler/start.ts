import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileLogger } from '../../../../global/logger'

export async function startHandler() {
  const distPath = path.resolve(process.cwd(), 'dist', 'server.js')
  if (!fs.existsSync(distPath)) {
    console.error('❌ Server not found, please run `dynemcp build` first ')
    process.exit(1)
  }

  fileLogger.info('🚀 Starting DyneMCP production server (dist/server.js)...')
  const child = spawn('node', [distPath], {
    stdio: 'inherit',
    env: process.env,
  })
  child.on('exit', (code) => process.exit(code ?? 0))
}
