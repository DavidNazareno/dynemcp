/**
 * Advanced builder module for DyneMCP projects
 * Based on esbuild with optimizations for MCP servers
 */

import { build, context, type BuildOptions, type BuildContext } from 'esbuild';
import type { BuildConfig } from './config/index.js';
import { loadConfig, getBuildConfig, validateBuildConfig } from './config/index.js';
import { bundle, bundleWatch, bundleCli, cleanBuildDir, type BundleResult, type BundleOptions } from './bundler/index.js';
import { analyzeDependencies, generateDependencyReport } from './bundler/analyzer.js';
import { generateBundleStats } from './bundler/optimizer.js';
import { generateManifest, generateHTMLReport } from './bundler/manifest.js';

export interface BuildOptions extends BundleOptions {
  configPath?: string;
  clean?: boolean;
  analyze?: boolean;
  manifest?: boolean;
  html?: boolean;
  watch?: boolean;
  cli?: boolean;
}

export interface BuildResult extends BundleResult {
  config: BuildConfig;
  analysis?: any;
  stats?: any;
}

/**
 * Build a DyneMCP project with advanced features
 */
export async function build(options: BuildOptions = {}): Promise<BuildResult> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting DyneMCP build process...');

    // Load configuration
    const config = loadConfig(options.configPath);
    const buildConfig = getBuildConfig(config);
    
    // Merge options with config
    const finalOptions: BundleOptions = {
      ...buildConfig,
      ...options,
    };

    // Validate configuration
    validateBuildConfig(finalOptions);

    // Clean build directory if requested
    if (options.clean) {
      await cleanBuildDir(finalOptions.outDir);
    }

    // Create output directory
    const fs = await import('fs-extra');
    await fs.ensureDir(finalOptions.outDir);

    // Build the project
    const bundleResult = await bundle(finalOptions);

    // Generate additional outputs
    const result: BuildResult = {
      ...bundleResult,
      config: buildConfig,
    };

    // Analyze dependencies if requested
    if (options.analyze && bundleResult.success) {
      console.log('📊 Analyzing dependencies...');
      const analysis = await analyzeDependencies(finalOptions.entryPoint);
      result.analysis = analysis;
      
      const report = generateDependencyReport(analysis);
      console.log(report);
      
      // Save analysis report
      const reportPath = `${finalOptions.outDir}/dependency-analysis.txt`;
      await fs.writeFile(reportPath, report);
      console.log(`📋 Dependency analysis saved: ${reportPath}`);
    }

    // Generate bundle stats
    if (bundleResult.success && bundleResult.outputFiles?.[0]) {
      const stats = generateBundleStats(bundleResult.outputFiles[0]);
      result.stats = stats;
      
      console.log(`📈 Bundle stats: ${stats.sizeKB}KB, ${stats.lines} lines`);
    }

    // Generate HTML report if requested
    if (options.html && bundleResult.metafile) {
      await generateHTMLReport(bundleResult.metafile, finalOptions.outDir);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (bundleResult.success) {
      console.log(`✅ Build completed successfully in ${duration}ms`);
      console.log(`📁 Output directory: ${finalOptions.outDir}`);
      
      if (bundleResult.outputFiles) {
        bundleResult.outputFiles.forEach(file => {
          console.log(`📄 Generated: ${file}`);
        });
      }
    } else {
      console.error(`❌ Build failed after ${duration}ms`);
    }

    return result;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`❌ Build failed after ${duration}ms:`, error);
    
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
      stats: {
        startTime,
        endTime,
        duration,
        entryPoints: [],
        outputSize: 0,
        dependencies: 0,
      },
      config: {} as BuildConfig,
    };
  }
}

/**
 * Build a DyneMCP project in watch mode
 */
export async function watch(options: BuildOptions = {}): Promise<BuildContext> {
  try {
    console.log('👀 Starting DyneMCP build in watch mode...');

    // Load configuration
    const config = loadConfig(options.configPath);
    const buildConfig = getBuildConfig(config);
    
    // Merge options with config
    const finalOptions: BundleOptions = {
      ...buildConfig,
      ...options,
      watch: true,
      sourcemap: true, // Always enable sourcemap in watch mode
    };

    // Validate configuration
    validateBuildConfig(finalOptions);

    // Create output directory
    const fs = await import('fs-extra');
    await fs.ensureDir(finalOptions.outDir);

    // Start watch mode
    const ctx = await bundleWatch(finalOptions);
    
    console.log('👀 Watching for changes...');
    console.log(`📁 Output: ${finalOptions.outDir}/${finalOptions.outFile}`);
    
    return ctx;
  } catch (error) {
    console.error('❌ Watch build failed:', error);
    throw error;
  }
}

/**
 * Build a DyneMCP CLI tool
 */
export async function buildCli(options: BuildOptions = {}): Promise<BuildResult> {
  try {
    console.log('🔧 Building DyneMCP CLI tool...');

    // Load configuration
    const config = loadConfig(options.configPath);
    const buildConfig = getBuildConfig(config);
    
    // Merge options with config
    const finalOptions: BundleOptions = {
      ...buildConfig,
      ...options,
      cli: true,
    };

    // Validate configuration
    validateBuildConfig(finalOptions);

    // Clean build directory if requested
    if (options.clean) {
      await cleanBuildDir(finalOptions.outDir);
    }

    // Create output directory
    const fs = await import('fs-extra');
    await fs.ensureDir(finalOptions.outDir);

    // Build CLI
    const bundleResult = await bundleCli(finalOptions);

    const result: BuildResult = {
      ...bundleResult,
      config: buildConfig,
    };

    if (bundleResult.success) {
      console.log('✅ CLI build completed successfully');
      console.log(`🔧 CLI executable: ${finalOptions.outDir}/${finalOptions.outFile.replace('.js', '-cli.js')}`);
    } else {
      console.error('❌ CLI build failed');
    }

    return result;
  } catch (error) {
    console.error('❌ CLI build failed:', error);
    
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
      stats: {
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        entryPoints: [],
        outputSize: 0,
        dependencies: 0,
      },
      config: {} as BuildConfig,
    };
  }
}

/**
 * Clean build directory
 */
export async function clean(options: { outDir?: string; configPath?: string } = {}): Promise<void> {
  try {
    let outDir = options.outDir || './dist';
    
    if (!options.outDir && options.configPath) {
      const config = loadConfig(options.configPath);
      const buildConfig = getBuildConfig(config);
      outDir = buildConfig.outDir;
    }

    await cleanBuildDir(outDir);
  } catch (error) {
    console.error('❌ Clean failed:', error);
    throw error;
  }
}

/**
 * Analyze project dependencies
 */
export async function analyze(options: { entryPoint?: string; configPath?: string } = {}): Promise<any> {
  try {
    let entryPoint = options.entryPoint || './src/index.ts';
    
    if (!options.entryPoint && options.configPath) {
      const config = loadConfig(options.configPath);
      const buildConfig = getBuildConfig(config);
      entryPoint = buildConfig.entryPoint;
    }

    console.log('📊 Analyzing project dependencies...');
    const analysis = await analyzeDependencies(entryPoint);
    const report = generateDependencyReport(analysis);
    
    console.log(report);
    return analysis;
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

export default {
  build,
  watch,
  buildCli,
  clean,
  analyze,
};
