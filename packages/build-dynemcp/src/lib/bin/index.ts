#!/usr/bin/env node

/**
 * DyneBuild CLI
 * Command line interface for building DyneMCP projects
 */
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { build } from '../build-dynemcp.js';

// Default entry point
const defaultEntryPoint = 'src/index.ts';
// Default output directory
const defaultOutdir = 'dist';

async function run(): Promise<void> {
  try {
    // Get the current working directory
    const cwd = process.cwd();

    // Try to find package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    let entryPoint = defaultEntryPoint;
    let outdir = defaultOutdir;

    // Check if package.json exists
    if (fs.existsSync(packageJsonPath)) {
      try {
        const fileContent = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson: { dynebuild?: { entryPoint?: string; outdir?: string } } = JSON.parse(
          fileContent,
        ) as { dynebuild?: { entryPoint?: string; outdir?: string } };

        // Check if there's a custom entry point defined
        if (packageJson.dynebuild?.entryPoint) {
          entryPoint = packageJson.dynebuild.entryPoint;
        }

        // Check if there's a custom output directory defined
        if (packageJson.dynebuild?.outdir) {
          outdir = packageJson.dynebuild.outdir;
        }
      } catch (_err) {
        console.warn('Failed to parse package.json, using default configuration');
      }
    }

    // Resolve the entry point path
    const entryPointPath = path.join(cwd, entryPoint);

    console.log(`Building ${entryPoint} to ${outdir}...`);

    // Run the build
    await build({
      entryPoints: [entryPointPath],
      outdir: path.join(cwd, outdir),
    });

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
run().catch((error) => {
  console.error(
    chalk.red(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`),
  );
  process.exit(1);
});
