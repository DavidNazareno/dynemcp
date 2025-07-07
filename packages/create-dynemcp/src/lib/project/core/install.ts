import fs from 'fs-extra'

/**
 * Installs dependencies using pnpm
 */
export async function installDependencies(projectPath: string): Promise<void> {
  const { default: execa } = await import('execa')
  const args = ['install']
  // Only install if package.json exists
  if (!fs.existsSync(`${projectPath}/package.json`)) {
    return
  }
  try {
    await execa('pnpm', args, {
      cwd: projectPath,
      stdio: 'inherit',
    })
  } catch (error) {
    console.error(`Failed to install dependencies with pnpm.`)
    throw error
  }
}
