import { installDependencies, copy, getTemplatesDir } from '../../shared'

import fastGlob from 'fast-glob'
import os from 'os'
import fs from 'fs/promises'
import path from 'path'
import { Sema } from 'async-sema'

declare const __VERSION__: string

import type { GetTemplateFileArgs, InstallTemplateArgs } from './interfaces'
import {
  INSPECTOR_VERSION,
  LOGGING,
  PATHS,
  SDK_VERSION,
} from '../../../global/config-all-constants'

const templatesDir = getTemplatesDir()
const pkgVersion = __VERSION__

export const getTemplateFile = ({
  template,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(templatesDir, template, file)
}

export const SRC_DIR_NAMES = [PATHS.SOURCE_DIR, 'prompts', 'resources', 'tools']

export const installTemplate = async (
  args: InstallTemplateArgs
): Promise<void> => {
  try {
    console.log(`Using ${args.packageManager}.`)

    if (templatesDir === undefined) {
      throw new Error('Templates directory not found')
    }

    console.log('\nInitializing project with template:', args.template, '\n')
    const templatePath = path.join(getTemplatesDir(), args.template)
    const copySource = ['**/*', '**/.*']
    if (!args.eslint) copySource.push('!.eslintrc.js', '!.eslintignore')
    if (!args.tailwind)
      copySource.push('!tailwind.config.js', '!postcss.config.js')

    await copy(copySource, args.root, {
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

    const tsconfigFile = path.join(
      args.root,
      args.mode === 'js' ? 'jsconfig.json' : 'tsconfig.json'
    )

    if (await fs.stat(tsconfigFile).catch(() => false)) {
      await fs.writeFile(
        tsconfigFile,
        (await fs.readFile(tsconfigFile, 'utf8'))
          .replace(
            '"@/*": ["./*"]',
            args.srcDir ? '"@/*": ["./src/*"]' : '"@/*": ["./*"]'
          )
          .replace('"@/*":', `"${args.importAlias}":`)
      )
    }

    if (args.importAlias !== '@/*') {
      const globFn = fastGlob.glob || fastGlob
      const files = await globFn('**/*', {
        cwd: args.root,
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
          const filePath = path.join(args.root, file)
          if ((await fs.stat(filePath)).isFile()) {
            await fs.writeFile(
              filePath,
              (await fs.readFile(filePath, 'utf8')).replace(
                '@/',
                `${args.importAlias.replace(/\*/g, '')}`
              )
            )
          }
          writeSema.release()
        })
      )
    }

    if (args.srcDir) {
      await fs.mkdir(path.join(args.root, PATHS.SOURCE_DIR), {
        recursive: true,
      })

      const templateHasSrcStructure = await fs
        .stat(path.join(args.root, PATHS.SOURCE_DIR))
        .catch(() => false)

      if (!templateHasSrcStructure) {
        await Promise.all(
          SRC_DIR_NAMES.map(async (dir) => {
            if (dir === PATHS.SOURCE_DIR) {
              return
            }

            const sourcePath = path.join(args.root, dir)
            const targetPath = path.join(args.root, PATHS.SOURCE_DIR, dir)

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
      return {
        dev: 'dynemcp dev',
        inspector: 'dynemcp dev inspector',
        start: 'dynemcp start',
        format: 'prettier --write .',
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
      type?: string
    }

    const packageJson: PackageJson = {
      name: args.appName,
      version: '0.1.0',
      private: true,
      scripts: generateScripts(),
      type: 'module',
      dependencies: {
        '@dynemcp/dynemcp': `^${version}`,
        '@modelcontextprotocol/sdk': `^${SDK_VERSION}`,
        zod: '^3.25.71',
      },
      devDependencies: {
        prettier: '^3.2.5',
      },
    }

    if (args.mode === 'ts') {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        typescript: '^5.4.2',
        tsx: '^4.0.0',
        '@modelcontextprotocol/inspector': `^${INSPECTOR_VERSION}`,
      }
    }

    packageJson.engines = {
      node: '>=20.0.0',
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
      path.join(args.root, 'package.json'),
      JSON.stringify(packageJson, null, 2) + os.EOL
    )

    if (args.skipInstall) return

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

    if (!args.skipInstall) {
      console.log('\nInstalling dependencies. This may take a moment...')
      try {
        await installDependencies(args.root)
        console.log(
          `${LOGGING.EMOJIS.SUCCESS} Dependencies installed successfully!`
        )
      } catch {
        console.error(
          `${LOGGING.EMOJIS.ERROR} Failed to install dependencies. Please run the command below to install manually:`
        )
      }
    }
  } catch (error) {
    console.error('[installTemplate] Error:', error)
    throw error
  }
}
