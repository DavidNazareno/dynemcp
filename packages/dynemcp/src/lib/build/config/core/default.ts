// default.ts
// Default build configuration for DyneMCP projects (zero-config, production-ready)
// ------------------------------------------------------------------------------

/**
 * DyneMCP build system configuration.
 *
 * ⚠️ NO MODIFICAR: Este archivo es parte del framework y no debe ser editado por el usuario final.
 * El build está 100% preconfigurado para funcionar de forma óptima y segura.
 * Si necesitas personalización avanzada, contacta a los mantenedores del framework.
 */
export const DEFAULT_BUILD_CONFIG = {
  entryPoint: './src/index.ts',
  outDir: './dist',
  outFile: 'server.js',
  format: 'cjs', // 'esm' o 'cjs' según el runtime soportado
  minify: false, // true para producción, false para debug
  sourcemap: true, // true para debug, false para producción
  bundle: true,
  external: [
    // Paquetes core y de infraestructura que siempre deben ser externos para optimizar el bundle
    '@modelcontextprotocol/sdk',
    'express',
    'cors',
    'jsonwebtoken',
    'zod',
    'zod-to-json-schema',
    'chalk',
    'esbuild',
    'express-rate-limit',
    'tslib',
    'yargs',
  ],
  define: {},
  platform: 'node',
  target: 'node18',
  treeShaking: true,
  splitting: false,
  metafile: false,
  watch: false,
}
