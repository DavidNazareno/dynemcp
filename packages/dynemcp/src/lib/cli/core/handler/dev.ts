import { run } from '../run'

export async function dev(argv: any): Promise<void> {
  // Siempre activa watch
  argv.watch = true
  if (argv.mode !== 'inspector') argv.mode = 'default'
  await run(argv)
}
