#!/usr/bin/env node

/**
 * Script to build a DyneMCP server using esbuild
 * This creates a unified, minified output for a DyneMCP server
 */
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

console.log('🔨 Iniciando construcción del servidor MCP...')

// Construir con esbuild directamente
buildWithEsbuild()



async function buildWithEsbuild() {
  try {
    console.log('📦 Instalando esbuild localmente...')
    execSync('pnpm add -D esbuild', { 
      cwd: rootDir, 
      stdio: 'inherit' 
    })
    
    const esbuildModule = await import('esbuild')
    const esbuild = esbuildModule.default || esbuildModule
    
    // Determine the entry point
    let entryPoint = join(rootDir, 'src/index.ts')
    if (!existsSync(entryPoint)) {
      entryPoint = join(rootDir, 'src/index.js')
      if (!existsSync(entryPoint)) {
        console.error('❌ Error: No se encontró punto de entrada (src/index.ts o src/index.js)')
        process.exit(1)
      }
    }
    
    // Ensure dist directory exists
    const distDir = join(rootDir, 'dist')
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true })
    }
    
    console.log('🔧 Construyendo el servidor con esbuild...')
    
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      minify: true,
      platform: 'node',
      target: ['node16'],
      format: 'esm',
      outfile: join(distDir, 'server.js'),
      external: ['@modelcontextprotocol/sdk'], // Marcar SDK como externo para evitar problemas
      banner: {
        js: '#!/usr/bin/env node\n'
      }
    })
    
    console.info('✅ Build completado exitosamente!')
    console.info('📁 Salida: dist/server.js')
    console.info('🚀 Ejecutar con: node dist/server.js')
    console.info('🚀 O usar: pnpm start')
  } catch (error) {
    console.error('❌ Build falló:', error)
    process.exit(1)
  }
}
