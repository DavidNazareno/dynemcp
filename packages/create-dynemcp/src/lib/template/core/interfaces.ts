export interface GetTemplateFileArgs {
  template: string
  file: string
}

export interface InstallTemplateArgs {
  appName: string
  root: string
  packageManager: any // Usa el tipo correcto si está disponible
  template: string
  mode: 'js' | 'ts'
  tailwind: boolean
  eslint: boolean
  srcDir: boolean
  importAlias: string
  skipInstall: boolean
}
