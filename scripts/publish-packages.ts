import execa from 'execa';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Package {
  name: string;
  path: string;
  private?: boolean;
  version?: string;
}

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  publishable?: boolean;
}

async function publishPackages(): Promise<void> {
  try {
    // Determine the npm tag based on the release type
    const releaseType = process.env.RELEASE_TYPE || 'canary';
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
        throw new Error(`Invalid release type: ${releaseType || 'undefined'}`);
    }

    console.log(`Publishing packages with tag: ${npmTag}`);

    // Check if we're in a GitHub Actions environment
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    const dryRun = process.env.DRY_RUN === 'true';
    
    // Check if --no-git-checks was passed as an argument
    const noGitChecks = process.argv.includes('--no-git-checks');

    // Get all packages in the workspace
    const { stdout } = await execa('pnpm', ['ls', '--json', '--depth', '-1', '--filter', './packages/*']);
    const workspaceInfo = JSON.parse(stdout) as Package[];

    console.log(`Found ${workspaceInfo.length} packages in the workspace`);

    // Track success and failures
    const results = {
      success: [] as string[],
      skipped: [] as string[],
      failed: [] as string[],
    };

    // For each package, check if it should be published and publish it
    for (const pkg of workspaceInfo) {
      try {
        // Skip if the package is private
        if (pkg.private === true) {
          console.log(`Skipping private package: ${pkg.name}`);
          results.skipped.push(`${pkg.name} (private)`);
          continue;
        }

        const packageJsonPath = join(pkg.path, 'package.json');
        if (!existsSync(packageJsonPath)) {
          console.log(`No package.json found for ${pkg.name}, skipping`);
          results.skipped.push(`${pkg.name} (no package.json)`);
          continue;
        }

        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as PackageJson;

        // Skip if explicitly marked as not publishable
        if (packageJson.publishable === false) {
          console.log(`Skipping non-publishable package: ${pkg.name}`);
          results.skipped.push(`${pkg.name} (not publishable)`);
          continue;
        }

        // Skip if the package is private in package.json
        if (packageJson.private === true) {
          console.log(`Skipping private package from package.json: ${pkg.name}`);
          results.skipped.push(`${pkg.name} (private in package.json)`);
          continue;
        }

        console.log(`Publishing ${pkg.name}@${packageJson.version}`);

        if (dryRun) {
          console.log(
            `[DRY RUN] Would publish ${pkg.name}@${packageJson.version} with tag ${npmTag}`,
          );
          results.success.push(`${pkg.name}@${packageJson.version} (dry run)`);
          continue;
        }

        // Use --no-git-checks in GitHub Actions or if explicitly requested
        const publishArgs = ['publish', '--tag', npmTag, '--access', 'public'];
        if (isGitHubActions || noGitChecks) {
          publishArgs.push('--no-git-checks');
        }

        await execa('pnpm', publishArgs, {
          cwd: pkg.path,
          stdio: 'inherit',
        });

        console.log(`Successfully published ${pkg.name}@${packageJson.version}`);
        results.success.push(`${pkg.name}@${packageJson.version}`);
      } catch (error) {
        console.error(`Failed to publish ${pkg.name}:`, error);
        results.failed.push(pkg.name);
        // Don't exit on error, try to publish remaining packages
      }
    }

    // Print summary
    console.log('\n=== Publication Summary ===');
    console.log(`Successfully published: ${results.success.length}`);
    results.success.forEach((pkg) => console.log(`  - ${pkg}`));

    console.log(`\nSkipped: ${results.skipped.length}`);
    results.skipped.forEach((pkg) => console.log(`  - ${pkg}`));

    console.log(`\nFailed: ${results.failed.length}`);
    results.failed.forEach((pkg) => console.log(`  - ${pkg}`));

    if (results.failed.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error in publish process:', error);
    process.exit(1);
  }
}

publishPackages();
