import { execa } from 'execa';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function publishPackages() {
  // Determine the npm tag based on the release type
  const releaseType = process.env.RELEASE_TYPE;
  let npmTag = 'latest';
  
  switch (releaseType) {
    case 'canary':
      npmTag = 'canary';
      break;
    case 'release-candidate':
      npmTag = 'rc';
      break;
    case 'stable':
      npmTag = 'latest';
      break;
    default:
      throw new Error(`Invalid release type: ${releaseType}`);
  }

  console.log(`Publishing packages with tag: ${npmTag}`);

  // Check if we're in a GitHub Actions environment
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  
  // Get all packages in the workspace
  const { stdout } = await execa('pnpm', ['ls', '--json', '--depth', '-1']);
  const workspaceInfo = JSON.parse(stdout);
  
  // For each package, check if it should be published and publish it
  for (const pkg of workspaceInfo) {
    try {
      // Skip if the package is private or marked as not publishable
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
      
      // Skip if explicitly marked as not publishable
      if (packageJson.publishable === false) {
        console.log(`Skipping non-publishable package: ${pkg.name}`);
        continue;
      }

      console.log(`Publishing ${pkg.name}@${packageJson.version}`);
      
      // Use --no-git-checks in GitHub Actions to avoid issues with detached HEAD
      const publishArgs = ['publish', '--tag', npmTag, '--access', 'public'];
      if (isGitHubActions) {
        publishArgs.push('--no-git-checks');
      }
      
      await execa('pnpm', publishArgs, {
        cwd: pkg.path,
        stdio: 'inherit',
      });
      
      console.log(`Successfully published ${pkg.name}@${packageJson.version}`);
    } catch (error) {
      console.error(`Failed to publish ${pkg.name}:`, error);
      // Don't exit on error, try to publish remaining packages
    }
  }
}

publishPackages();
