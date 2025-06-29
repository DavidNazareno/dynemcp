import { installDependencies } from '../../project/core/package-manager.js'
import { copy } from '../../project/core/copy.js'
// import { getTemplatesDir } from '../../project/core/paths' // Archivo no encontrado, comentar o eliminar
import { getPackageVersion } from '../../project/core/package-info.js'

import fastGlob from 'fast-glob'
import os from 'os'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { Sema } from 'async-sema'

import type { GetTemplateFileArgs, InstallTemplateArgs } from './interfaces.js'
import { getTemplatesDir } from './helpers.js'
import { LOGGING, PATHS } from '../../../global/config-all-constants.js'

const templatesDir = getTemplatesDir()
const pkgVersion = getPackageVersion()

export const getTemplateFile = ({
  template,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(templatesDir, template, file)
}

export const SRC_DIR_NAMES = [PATHS.SOURCE_DIR, 'prompts', 'resources', 'tools']

export const installTemplate = async ({
  appName,
  root,
  packageManager,
  template,
  mode,
  tailwind,
  eslint,
  srcDir,
  importAlias,
  skipInstall,
}: InstallTemplateArgs): Promise<void> => {
  console.log(`Using ${packageManager}.`)

  // Copy the template files to the target directory.
  console.log('\nInitializing project with template:', template, '\n')
  const templatePath = path.join(templatesDir, template)
  const copySource = ['**']
  if (!eslint) copySource.push('!.eslintrc.js', '!.eslintignore')
  if (!tailwind) copySource.push('!tailwind.config.js', '!postcss.config.js')

  console.log('[DEBUG] templatePath:', templatePath)
  console.log('[DEBUG] copySource:', copySource)

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name: string) {
      switch (name) {
        case 'gitignore': {
          return `.${name}`
        }
        case 'README-template.md': {
          return 'README.md'
        }
        default: {
          return name
        }
      }
    },
  })
  console.log('[DEBUG] copy completado')

  const tsconfigFile = path.join(
    root,
    mode === 'js' ? 'jsconfig.json' : 'tsconfig.json'
  )

  if (await fs.stat(tsconfigFile).catch(() => false)) {
    await fs.writeFile(
      tsconfigFile,
      (await fs.readFile(tsconfigFile, 'utf8'))
        .replace(
          '"@/*": ["./*"]',
          srcDir ? '"@/*": ["./src/*"]' : '"@/*": ["./*"]'
        )
        .replace('"@/*":', `"${importAlias}":`)
    )
  }

  // update import alias in any files if not using the default
  if (importAlias !== '@/*') {
    const globFn = fastGlob.glob || fastGlob
    const files = await globFn('**/*', {
      cwd: root,
      dot: true,
      stats: false,
      ignore: [
        'tsconfig.json',
        'jsconfig.json',
        '.git/**/*',
        '**/node_modules/**',
      ],
    })
    const writeSema = new Sema(8, { capacity: files.length })
    await Promise.all(
      files.map(async (file) => {
        await writeSema.acquire()
        const filePath = path.join(root, file)
        if ((await fs.stat(filePath)).isFile()) {
          await fs.writeFile(
            filePath,
            (await fs.readFile(filePath, 'utf8')).replace(
              '@/',
              `${importAlias.replace(/\*/g, '')}`
            )
          )
        }
        writeSema.release()
      })
    )
  }

  if (srcDir) {
    await fs.mkdir(path.join(root, PATHS.SOURCE_DIR), { recursive: true })

    // Check if the template already has a src/ directory structure
    const templateHasSrcStructure = await fs
      .stat(path.join(root, PATHS.SOURCE_DIR))
      .catch(() => false)

    if (!templateHasSrcStructure) {
      // Only reorganize directories if template doesn't already have src/ structure
      await Promise.all(
        SRC_DIR_NAMES.map(async (dir) => {
          if (dir === PATHS.SOURCE_DIR) {
            return
          }

          const sourcePath = path.join(root, dir)
          const targetPath = path.join(root, PATHS.SOURCE_DIR, dir)

          if (await fs.stat(sourcePath).catch(() => false)) {
            await fs.mkdir(path.dirname(targetPath), { recursive: true })
            await fs
              .rename(sourcePath, targetPath)
              .catch((err: { code?: string }) => {
                if (err.code !== 'ENOENT') {
                  throw err
                }
              })
          }
        })
      )
    }
  }

  const version = process.env.DYNEMCP_TEST_VERSION ?? pkgVersion

  const generateScripts = () => {
    const baseScripts = {
      build: 'dynemcp build',
      start: 'dynemcp start',
      clean: 'dynemcp clean',
      analyze: 'dynemcp analyze',
      format: 'prettier --write .',
      lint: eslint ? 'eslint . --ext .js,.jsx,.ts,.tsx' : undefined,
      'eslint:fix': eslint
        ? 'eslint . --ext .js,.jsx,.ts,.tsx --fix'
        : undefined,
    }
    return {
      ...baseScripts,
      dev: 'dynemcp dev',
      inspector: 'dynemcp dev inspector',
    }
  }

  interface PackageJson {
    name: string
    version: string
    private: boolean
    scripts: Record<string, string | undefined>
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    engines?: Record<string, string>
    packageManager?: string
  }

  const packageJson: PackageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: generateScripts(),
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.12.1',
      '@dynemcp/dynemcp': `^${version}`,
      zod: '^3.22.4',
    },
    devDependencies: {
      prettier: '^3.2.5',
    },
  }

  if (template === 'http-server' || template === 'secure-agent') {
    packageJson.dependencies['express'] = '^4.19.2'
    packageJson.dependencies['cors'] = '^2.8.5'
    packageJson.devDependencies['@types/express'] = '^4.17.21'
    packageJson.devDependencies['@types/cors'] = '^2.8.17'
  }

  if (!packageJson.scripts.lint) {
    delete packageJson.scripts.lint
  }

  if (mode === 'ts') {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      '@types/node': '^20.11.30',
      '@typescript-eslint/eslint-plugin': '^8.33.1',
      '@typescript-eslint/parser': '^8.33.1',
      typescript: '^5.4.2',
      'ts-node': '^10.9.2',
    }
  }

  if (tailwind) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      tailwindcss: '^3.4.0',
      postcss: '^8.4.31',
      autoprefixer: '^10.4.16',
    }
  }

  if (eslint) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      eslint: '^9.28.0',
      'eslint-config-prettier': '^9.1.0',
      prettier: '^3.2.5',
    }
  }

  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    vitest: '^1.4.0',
  }

  packageJson.engines = {
    node: '>=16.0.0',
  }

  packageJson.packageManager = 'pnpm@10.9.0'

  const devDeps = Object.keys(packageJson.devDependencies).length
  if (!devDeps) {
    const tempJson = packageJson as unknown as {
      devDependencies?: Record<string, string>
    }
    delete tempJson.devDependencies
  }

  await fs.writeFile(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  )

  await updateProjectConfig(root, appName)

  if (skipInstall) return

  console.log('\nInstalling dependencies:')
  Object.keys(packageJson.dependencies).forEach((dependency) => {
    console.log(`- ${dependency}`)
  })

  if (devDeps) {
    console.log('\nInstalling devDependencies:')
    Object.keys(packageJson.devDependencies).forEach((dependency) => {
      console.log(`- ${dependency}`)
    })
  }

  console.log()

  if (!skipInstall) {
    console.log('\nInstalling dependencies. This may take a moment...')
    try {
      await installDependencies(root)
      console.log(
        `${LOGGING.EMOJIS.SUCCESS} Dependencies installed successfully!`
      )
    } catch {
      console.error(
        `${LOGGING.EMOJIS.ERROR} Failed to install dependencies. Please run the command below to install manually:`
      )
    }
  }
}

async function updateProjectConfig(
  projectPath: string,
  projectName: string
): Promise<void> {
  const configPath = path.join(projectPath, 'dynemcp.config.json')
  let config: any = {}
  try {
    if (existsSync(configPath)) {
      config = JSON.parse(await fs.readFile(configPath, 'utf8'))
    }
  } catch {
    // ignore
  }
  config.name = projectName
  config.build = config.build || {}
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + os.EOL)
}

// ... aquí irá la lógica de template-generator ...
