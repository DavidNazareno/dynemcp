import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'
import { loadConfig } from '../../../server/config/core/loader'

interface ComponentConfig {
  enabled: boolean
  directory: string
  pattern: string
}

async function generateIndexForType(
  type: 'tools' | 'resources' | 'prompts',
  config: ComponentConfig,
  projectRoot: string
) {
  if (!config.enabled) return
  const dir = path.resolve(projectRoot, config.directory)
  const pattern = path.join(dir, config.pattern)
  const files = glob
    .sync(pattern, { absolute: true })
    .filter((f) => !f.endsWith('index.ts') && !f.endsWith('index.js'))

  if (files.length === 0) return

  const exports = files.map((file) => {
    const rel =
      './' +
      path
        .relative(dir, file)
        .replace(/\\/g, '/')
        .replace(/\.(ts|js)$/, '')
    return `export * from '${rel}'`
  })
  const indexPath = path.join(dir, 'index.ts')
  await fs.writeFile(indexPath, exports.join('\n') + '\n')
}

export async function generateComponentIndexes(
  configPath = 'dynemcp.config.ts'
) {
  const projectRoot = process.cwd()
  const config = await loadConfig(configPath)
  const types: Array<'tools' | 'resources' | 'prompts'> = [
    'tools',
    'resources',
    'prompts',
  ]
  for (const type of types) {
    if (
      config[type] &&
      config[type].enabled &&
      config[type].directory &&
      config[type].pattern
    ) {
      await generateIndexForType(
        type,
        config[type] as ComponentConfig,
        projectRoot
      )
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateComponentIndexes().then(() => {
    console.log('Component indexes generated.')
  })
}
