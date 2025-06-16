import { execa } from 'execa';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Script para publicar los paquetes del monorepo
 * Basado en GitHub Releases en lugar de Changesets
 */
async function publishPackages() {
  const releaseType = process.env.RELEASE_TYPE || 'stable';
  console.log(`Publishing packages with tag: ${releaseType}`);
  
  // Determinar el tag de npm basado en el tipo de release
  const npmTag = releaseType === 'stable' ? 'latest' : releaseType;
  
  // Obtener todos los paquetes en el workspace
  const { stdout } = await execa('pnpm', ['ls', '--json', '--depth', '-1']);
  const workspaceInfo = JSON.parse(stdout);
  
  // Para cada paquete, verificar si debe ser publicado y publicarlo
  for (const pkg of workspaceInfo) {
    try {
      // Omitir si el paquete es privado
      if (pkg.private === true) {
        console.log(`Skipping private package: ${pkg.name}`);
        continue;
      }

      const packageJsonPath = join(pkg.path, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
      
      // Omitir si está marcado explícitamente como no publicable
      if (packageJson.publishable === false) {
        console.log(`Skipping non-publishable package: ${packageJson.name}`);
        continue;
      }

      console.log(`Publishing ${packageJson.name}@${packageJson.version} with tag ${npmTag}`);
      
      try {
        // Publicar el paquete con el tag adecuado
        await execa('pnpm', ['publish', '--access', 'public', '--tag', npmTag, '--no-git-checks'], {
          cwd: pkg.path,
          stdio: 'inherit',
        });
        console.log(`Successfully published ${packageJson.name}@${packageJson.version}`);
      } catch (publishError) {
        // Si falla la publicación, podría ser porque el paquete ya existe
        console.error(`Error publishing ${packageJson.name}:`, publishError.message);
        
        // Verificar si el error es porque la versión ya existe
        if (publishError.message.includes('already exists')) {
          console.log(`Version ${packageJson.version} of ${packageJson.name} already exists, skipping`);
        } else {
          throw publishError;
        }
      }
    } catch (error) {
      console.error(`Error processing ${pkg.name}:`, error);
    }
  }
  
  // Si estamos en GitHub Actions y es una release estable, crear un tag de Git
  if (process.env.GITHUB_ACTIONS && releaseType === 'stable') {
    try {
      const date = new Date().toISOString().split('T')[0];
      const tagName = `v${date}`;
      
      console.log(`Creating Git tag: ${tagName}`);
      await execa('git', ['tag', tagName]);
      await execa('git', ['push', 'origin', tagName]);
      
      console.log(`Successfully created and pushed tag: ${tagName}`);
    } catch (tagError) {
      console.error('Error creating Git tag:', tagError);
    }
  }
  
  console.log('Publishing complete!');
}

publishPackages();
