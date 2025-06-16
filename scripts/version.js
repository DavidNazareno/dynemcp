import { execa } from 'execa';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Script para versionar los paquetes del monorepo
 * Basado en GitHub Releases en lugar de Changesets
 */
async function versionPackages() {
  const releaseType = process.env.RELEASE_TYPE || 'stable';
  console.log(`Versioning packages for release type: ${releaseType}`);
  
  // Obtener todos los paquetes en el workspace
  const { stdout } = await execa('pnpm', ['ls', '--json', '--depth', '-1']);
  const workspaceInfo = JSON.parse(stdout);
  
  // Para cada paquete, verificar si debe ser versionado y actualizarlo
  for (const pkg of workspaceInfo) {
    try {
      // Omitir si el paquete es privado
      if (pkg.private === true) {
        console.log(`Skipping private package: ${pkg.name}`);
        continue;
      }

      const packageJsonPath = join(pkg.path, 'package.json');
      if (!existsSync(packageJsonPath)) {
        console.log(`No package.json found for ${pkg.name}, skipping`);
        continue;
      }

      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
      
      // Omitir si está marcado explícitamente como no versionable
      if (packageJson.versionable === false) {
        console.log(`Skipping non-versionable package: ${pkg.name}`);
        continue;
      }

      // Determinar la nueva versión basada en el tipo de release
      let newVersion = packageJson.version || '0.1.0';
      
      if (releaseType === 'canary') {
        // Para canary, usamos un formato como 1.0.0-canary.20250616
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const baseVersion = newVersion.split('-')[0]; // Quitar cualquier sufijo existente
        newVersion = `${baseVersion}-canary.${date}`;
      } else {
        // Para stable, incrementamos el patch version
        const versionParts = newVersion.split('.');
        if (versionParts.length >= 3) {
          // Incrementar la versión de patch
          versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();
          newVersion = versionParts.join('.');
        }
      }

      console.log(`Updating ${pkg.name} from ${packageJson.version} to ${newVersion}`);
      
      // Actualizar la versión en package.json
      packageJson.version = newVersion;
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      
      // También actualizar las dependencias internas si este paquete depende de otros del monorepo
      for (const workspacePkg of workspaceInfo) {
        const pkgName = workspacePkg.name;
        
        // Actualizar dependencias
        if (packageJson.dependencies && packageJson.dependencies[pkgName]) {
          const workspacePackageJson = JSON.parse(
            await readFile(join(workspacePkg.path, 'package.json'), 'utf8')
          );
          packageJson.dependencies[pkgName] = workspacePackageJson.version;
        }
        
        // Actualizar devDependencies
        if (packageJson.devDependencies && packageJson.devDependencies[pkgName]) {
          const workspacePackageJson = JSON.parse(
            await readFile(join(workspacePkg.path, 'package.json'), 'utf8')
          );
          packageJson.devDependencies[pkgName] = workspacePackageJson.version;
        }
        
        // Actualizar peerDependencies
        if (packageJson.peerDependencies && packageJson.peerDependencies[pkgName]) {
          const workspacePackageJson = JSON.parse(
            await readFile(join(workspacePkg.path, 'package.json'), 'utf8')
          );
          packageJson.peerDependencies[pkgName] = workspacePackageJson.version;
        }
      }
      
      // Guardar el package.json actualizado
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    } catch (error) {
      console.error(`Error versioning ${pkg.name}:`, error);
    }
  }
  
  // Actualizar el pnpm-lock.yaml ya que los paquetes dependen entre sí
  await execa('pnpm', ['install', '--no-frozen-lockfile'], {
    stdio: 'inherit',
  });
  
  console.log('Versioning complete!');
}

versionPackages();
