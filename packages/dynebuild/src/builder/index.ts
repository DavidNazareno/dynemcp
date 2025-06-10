/**
 * Builder module for DyneMCP projects
 */

import { build as esbuild } from "esbuild";
import type { BuildOptions } from "esbuild";

/**
 * Build a DyneMCP project
 */
export async function build(options: BuildOptions): Promise<void> {
  try {
    await esbuild({
      ...options,
      platform: "node",
      format: "esm",
      bundle: true,
      minify: process.env.NODE_ENV === "production",
      sourcemap: process.env.NODE_ENV !== "production",
    });
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

/**
 * Build a DyneMCP project in watch mode
 */
export async function watch(options: BuildOptions): Promise<void> {
  try {
    await esbuild({
      ...options,
      platform: "node",
      format: "esm",
      bundle: true,
      watch: true,
      sourcemap: true,
    });
  } catch (error) {
    console.error("Watch build failed:", error);
    process.exit(1);
  }
}

export default {
  build,
  watch,
};
