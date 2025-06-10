#!/usr/bin/env node

/**
 * Script to build a DyneMCP server using the dynebuild package
 * This creates a unified, minified output for a DyneMCP server
 */
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

console.log('🔨 Iniciando construcción del servidor MCP...')

// Asegurarse de que dynebuild esté instalado
try {
  // Intentar importar dynebuild
  const dynebuild = await import('dynebuild')
  buildWithDynebuild(dynebuild)
} catch (error) {
  console.warn('⚠️ No se pudo importar dynebuild, intentando usar esbuild directamente...')
  buildWithEsbuild()
}

async function buildWithDynebuild(dynebuild) {
  try {
    // Read the DyneMCP configuration
    const configPath = join(rootDir, 'dynemcp.config.json')
    let config = {}
    
    if (existsSync(configPath)) {
      config = JSON.parse(readFileSync(configPath, 'utf-8'))
    } else {
      console.warn('⚠️ Archivo dynemcp.config.json no encontrado, usando configuración por defecto')
    }

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

    // Build the server
    await dynebuild.bundle({
      entryPoint,
      outFile: join(distDir, 'server.js'),
      minify: true,
      config
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

async function buildWithEsbuild() {
  try {
    console.log('📦 Instalando esbuild localmente...')
    execSync('pnpm install --no-save esbuild', { 
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
