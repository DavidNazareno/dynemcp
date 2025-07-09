import { spawn } from 'child_process'

export async function startHandler(argv: any) {
  // Ejecuta el entrypoint TypeScript directamente, sin watch
  const entry = argv.entry || 'src/index.ts'
  console.log(`🚀 Starting DyneMCP production server (${entry})...`)
  const child = spawn('npx', ['tsx', entry], { stdio: 'inherit' })
  child.on('exit', (code) => process.exit(code ?? 0))
}
