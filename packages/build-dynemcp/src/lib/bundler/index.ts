/**
 * Bundler module for DyneMCP projects
 */

import { build } from 'esbuild';
import type { BuildOptions } from 'esbuild';

/**
 * Bundle a DyneMCP project for production
 */
export async function bundle(options: BuildOptions): Promise<void> {
  try {
    await build({
      ...options,
      platform: 'node',
      format: 'esm',
      bundle: true,
      minify: true,
      sourcemap: false,
      outExtension: { '.js': '.js' },
    });
  } catch (error) {
    console.error('Bundle failed:', error);
    process.exit(1);
  }
}

/**
 * Bundle a DyneMCP CLI tool
 */
export async function bundleCli(options: BuildOptions): Promise<void> {
  try {
    await build({
      ...options,
      platform: 'node',
      format: 'esm',
      bundle: true,
      minify: true,
      sourcemap: false,
      outExtension: { '.js': '.js' },
      banner: {
        js: '#!/usr/bin/env node\n',
      },
    });
  } catch (error) {
    console.error('CLI bundle failed:', error);
    process.exit(1);
  }
}

export default {
  bundle,
  bundleCli,
};
