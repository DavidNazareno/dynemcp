import type { PackageManager } from '../helpers/package-manager'

export interface GetTemplateFileArgs {
  template: string
  mode: 'js' | 'ts'
  file: string
}

export interface InstallTemplateArgs {
  appName: string
  root: string
  packageManager: PackageManager
  isOnline: boolean
  template: string
  mode: 'js' | 'ts'
  tailwind: boolean
  eslint: boolean
  srcDir: boolean
  importAlias: string
  skipInstall: boolean
}
