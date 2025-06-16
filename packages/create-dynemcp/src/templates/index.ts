import { install } from '../helpers/install'
import { copy } from '../helpers/copy'

import fastGlob from 'fast-glob'
import os from 'os'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { Sema } from 'async-sema'
// Import package.json for version detection
import pkg from '../../package.json'

import type { GetTemplateFileArgs, InstallTemplateArgs } from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get the file path for a given file in a template, e.g. "dynemcp.config.json".
 */
export const getTemplateFile = ({
  template,
  mode,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(__dirname, '../../templates', template, mode, file)
}

export const SRC_DIR_NAMES = ['src', 'prompt', 'resources', 'tools']

/**
 * Install a DyneMCP internal template to a given `root` directory.
 */
export const installTemplate = async ({
  appName,
  root,
  packageManager,
  isOnline,
  template,
  mode,
  tailwind,
  eslint,
  srcDir,
  importAlias,
  skipInstall,
}: InstallTemplateArgs) => {
  console.log(`Using ${packageManager}.`)

  /**
   * Copy the template files to the target directory.
   */
  console.log('\nInitializing project with template:', template, '\n')
  const templatePath = path.join(__dirname, '../../templates', template)
  const copySource = ['**']
  if (!eslint) copySource.push('!.eslintrc.js', '!.eslintignore')
  if (!tailwind) copySource.push('!tailwind.config.js', '!postcss.config.js')

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case 'gitignore': {
          return `.${name}`
        }
        // Handle README template file
        case 'README-template.md': {
          return 'README.md'
        }
        default: {
          return name
        }
      }
    },
  })

  const tsconfigFile = path.join(
    root,
    mode === 'js' ? 'jsconfig.json' : 'tsconfig.json'
  )

  if (await fs.stat(tsconfigFile).catch(() => false)) {
    await fs.writeFile(
      tsconfigFile,
      (await fs.readFile(tsconfigFile, 'utf8'))
        .replace(
          `"@/*": ["./*"]`,
          srcDir ? `"@/*": ["./src/*"]` : `"@/*": ["./*"]`
        )
        .replace(`"@/*":`, `"${importAlias}":`)
    )
  }

  // update import alias in any files if not using the default
  if (importAlias !== '@/*') {
    const files = await fastGlob('**/*', {
      cwd: root,
      dot: true,
      stats: false,
      // We don't want to modify compiler options in [ts/js]config.json
      // and none of the files in the .git folder
      ignore: [
        'tsconfig.json',
        'jsconfig.json',
        '.git/**/*',
        '**/node_modules/**',
      ],
    })
    const writeSema = new Sema(8, { capacity: files.length })
    await Promise.all(
      files.map(async file => {
        await writeSema.acquire()
        const filePath = path.join(root, file)
        if ((await fs.stat(filePath)).isFile()) {
          await fs.writeFile(
            filePath,
            (await fs.readFile(filePath, 'utf8')).replace(
              `@/`,
              `${importAlias.replace(/\*/g, '')}`
            )
          )
        }
        writeSema.release()
      })
    )
  }

  if (srcDir) {
    await fs.mkdir(path.join(root, 'src'), { recursive: true })
    await Promise.all(
      SRC_DIR_NAMES.map(async dir => {
        const sourcePath = path.join(root, dir)
        const targetPath = path.join(root, 'src', dir)

        // Check if the source directory exists before attempting to move it
        if (await fs.stat(sourcePath).catch(() => false)) {
          await fs.mkdir(path.dirname(targetPath), { recursive: true })
          await fs.rename(sourcePath, targetPath).catch(err => {
            if (err.code !== 'ENOENT') {
              throw err
            }
          })
        }
      })
    )
  }

  /** Copy the version from package.json or override for tests. */
  const version = process.env.DYNEMCP_TEST_VERSION ?? pkg.version

  /** Create a package.json for the new project and write it to disk. */
  const packageJson: any = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'cross-env NODE_ENV=development npx @modelcontextprotocol/inspector serve src/index.ts',
      build: 'dynebuild',
      start: 'node dist/server.js',
      test: 'vitest run',
      'test:watch': 'vitest',
      format: 'prettier --write .',
      lint: eslint ? 'eslint . --ext .js,.jsx,.ts,.tsx' : undefined,
      'eslint:fix': eslint
        ? 'eslint . --ext .js,.jsx,.ts,.tsx --fix'
        : undefined,
    },
    /**
     * Default dependencies.
     */
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.12.1',
      '@repo/dynemcp': version,
      zod: '^3.22.4',
    },
    devDependencies: {},
  }

  // Remove undefined values
  if (!packageJson.scripts.lint) {
    delete packageJson.scripts.lint
  }

  /**
   * TypeScript projects will have type definitions and other devDependencies.
   */
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

  /* Add Tailwind CSS dependencies. */
  if (tailwind) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      tailwindcss: '^3.4.0',
      postcss: '^8.4.31',
      autoprefixer: '^10.4.16',
    }
  }

  /* Default ESLint dependencies. */
  if (eslint) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      eslint: '^9.28.0',
      'eslint-config-prettier': '^9.1.0',
      prettier: '^3.2.5',
    }
  }

  // Add common dev dependencies
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    '@repo/dynebuild': version,
    'cross-env': '^7.0.3',
    esbuild: '^0.20.2',
    vitest: '^1.4.0',
  }

  // Add Node.js engine requirement
  packageJson.engines = {
    node: '>=16.0.0',
  }

  // Add package manager
  packageJson.packageManager = 'pnpm@10.9.0'

  const devDeps = Object.keys(packageJson.devDependencies).length
  if (!devDeps) delete packageJson.devDependencies

  await fs.writeFile(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  )

  // Update dynemcp.config.json with project name if it exists
  const configPath = path.join(root, 'dynemcp.config.json')
  if (await fs.stat(configPath).catch(() => false)) {
    const configContent = await fs.readFile(configPath, 'utf8')
    const config = JSON.parse(configContent)
    config.name = appName
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + os.EOL)
  }

  if (skipInstall) return

  console.log('\nInstalling dependencies:')
  for (const dependency in packageJson.dependencies)
    console.log(`- ${dependency}`)

  if (devDeps) {
    console.log('\nInstalling devDependencies:')
    for (const dependency in packageJson.devDependencies)
      console.log(`- ${dependency}`)
  }

  console.log()

  await install(packageManager, isOnline)
}

export * from './types'
