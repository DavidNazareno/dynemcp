import fs from 'fs-extra'
import { installTemplate } from '../../template'
import { PACKAGE_MANAGER } from '../../../global/config-all-constants'

/**
 * Creates a new project using the specified template and options
 */
export async function createProject(
  projectPath: string,
  projectName: string,
  template: string
): Promise<void> {
  await fs.mkdir(projectPath, { recursive: true })

  await installTemplate({
    appName: projectName,
    root: projectPath,
    packageManager: PACKAGE_MANAGER.PREFERRED,
    template,
    mode: 'ts',
    tailwind: false,
    eslint: true,
    srcDir: true,
    importAlias: '@/*',
    skipInstall: false,
  })
}
