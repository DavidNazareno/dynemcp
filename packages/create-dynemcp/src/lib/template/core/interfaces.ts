export interface GetTemplateFileArgs {
  template: string
  file: string
}

export interface InstallTemplateArgs {
  appName: string
  root: string
  packageManager: any // Use the correct type if available
  template: string
  mode: 'js' | 'ts'
  tailwind: boolean
  eslint: boolean
  srcDir: boolean
  importAlias: string
  skipInstall: boolean
}
