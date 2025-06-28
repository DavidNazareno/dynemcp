// default.ts
// Default build configuration for DyneMCP projects (zero-config, production-ready)
// ------------------------------------------------------------------------------

/**
 * This configuration is used by the DyneMCP build system for all projects.
 * Users cannot override these options. The build is always fast, minified, and scalable.
 */
export const DEFAULT_BUILD_CONFIG = {
  entryPoint: './src/index.ts',
  outDir: './dist',
  outFile: 'server.js',
  format: 'cjs', // Use 'esm' if your runtime supports it
  minify: true,
  sourcemap: false, // Set to true if you want to allow debugging
  bundle: true,
  external: [], // Only bundle what is needed
  define: {},
  platform: 'node',
  target: 'node16',
  treeShaking: true,
  splitting: false,
  metafile: false,
  watch: false,
}
