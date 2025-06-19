import execa from 'execa';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import fastGlob from 'fast-glob';

async function bumpVersions() {
  // Determine the version bump type and release type
  const releaseType = process.env.RELEASE_TYPE || 'stable';
  const bumpType = process.argv[2] || 'patch'; // default to patch if not specified

  console.log(`Bumping ${bumpType} version for ${releaseType} release`);

  try {
    // Get the root package.json to determine the current version
    const rootPkgPath = join(process.cwd(), 'package.json');
    const rootPkg = JSON.parse(await readFile(rootPkgPath, 'utf8'));

    // Calculate the new version based on the current version
    let newVersion = await calculateNewVersion(rootPkg.version, bumpType, releaseType);

    console.log(`New version will be: ${newVersion}`);

    // Find all package.json files in the monorepo
    const packageJsonPaths = await fastGlob('**/package.json', {
      ignore: ['**/node_modules/**/package.json'],
      absolute: true,
    });

    // Update the version in each package.json
    for (const pkgPath of packageJsonPaths) {
      const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));

      // Skip private packages that don't need versioning
      if (pkg.private === true && !pkg.version) {
        continue;
      }

      // Update the version
      pkg.version = newVersion;

      // Update dependencies within the monorepo to use the new version
      updateDependenciesVersions(pkg, newVersion);

      // Write the updated package.json
      await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`Updated version in ${pkgPath}`);
    }

    // Commit the version changes and create a tag
    if (releaseType === 'stable') {
      await commitAndTag(newVersion);
    } else {
      await commitCanaryVersion(newVersion);
    }

    console.log(`Version bump to ${newVersion} completed successfully`);
  } catch (error) {
    console.error('Error bumping versions:', error);
    process.exit(1);
  }
}

async function calculateNewVersion(
  currentVersion: string,
  bumpType: string,
  releaseType: string,
): Promise<string> {
  // Parse the current version
  const versionParts = currentVersion.split('.');
  const major = parseInt(versionParts[0]) || 0;
  const minor = parseInt(versionParts[1]) || 0;
  const patch = parseInt(versionParts[2]) || 0;

  let newVersion: string;

  // Calculate the new version based on bump type
  switch (bumpType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  // For canary releases, add a timestamp suffix
  if (releaseType === 'canary') {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .slice(0, 14);
    newVersion = `${newVersion}-canary.${timestamp}`;
  } else if (releaseType === 'release-candidate') {
    // For RC releases, add rc suffix
    // Check if there's an existing RC version and increment it
    const rcMatch = currentVersion.match(/-rc\.(\d+)$/);
    const rcNumber = rcMatch ? parseInt(rcMatch[1], 10) + 1 : 1;
    newVersion = `${newVersion}-rc.${rcNumber}`;
  }

  return newVersion;
}

function updateDependenciesVersions(pkg: any, newVersion: string): void {
  // List of dependency types to update
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

  // Update all internal dependencies to use the new version
  for (const depType of depTypes) {
    if (!pkg[depType]) continue;

    for (const [depName, depVersion] of Object.entries(pkg[depType])) {
      // Check if this is an internal dependency (starts with the workspace name)
      if (depName.startsWith('@dynemcp/') || depName === 'dynemcp') {
        pkg[depType][depName] = newVersion;
      }
    }
  }
}

async function commitAndTag(version: string): Promise<void> {
  try {
    // Stage all changes
    await execa('git', ['add', '.']);

    // Commit with version bump message
    await execa('git', ['commit', '-m', `chore: bump version to ${version}`]);

    // Create a tag for the new version
    await execa('git', ['tag', `-a`, `v${version}`, '-m', `Release v${version}`]);

    console.log(`Created commit and tag for version ${version}`);
  } catch (error) {
    console.error('Error creating commit and tag:', error);
    throw error;
  }
}

async function commitCanaryVersion(version: string): Promise<void> {
  try {
    // Stage all changes
    await execa('git', ['add', '.']);

    // Commit with canary version message
    await execa('git', ['commit', '-m', `chore: bump canary version to ${version}`]);

    console.log(`Created commit for canary version ${version}`);
  } catch (error) {
    console.error('Error creating canary commit:', error);
    throw error;
  }
}

// Execute the version bump
bumpVersions();
