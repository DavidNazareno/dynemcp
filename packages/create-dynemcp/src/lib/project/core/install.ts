// ... aquí irá la lógica de install ...

/**
 * Installs dependencies using pnpm
 */
export async function installDependencies(projectPath: string): Promise<void> {
  const { default: execa } = await import('execa')
  const args = ['install']
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
