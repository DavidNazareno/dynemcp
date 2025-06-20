import { build, watch, buildCli, clean, analyze } from './build-dynemcp.js';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as esbuild from 'esbuild';
import * as config from './config/index.js';
import * as bundler from './bundler/index.js';

// Mock dependencies
vi.mock('esbuild', () => ({
  build: vi.fn().mockResolvedValue({
    errors: [],
    warnings: [],
    outputFiles: [{ path: '/test/dist/server.js' }],
    metafile: { inputs: {}, outputs: {} },
  }),
  context: vi.fn().mockResolvedValue({
    watch: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('./config/index.js', () => ({
  loadConfig: vi.fn().mockReturnValue({
    server: { name: 'test-server', version: '1.0.0' },
    build: {
      entryPoint: './src/index.ts',
      outDir: './dist',
      outFile: 'server.js',
      format: 'esm',
      minify: true,
      sourcemap: false,
      bundle: true,
      external: [],
      define: {},
      platform: 'node',
      target: 'node16',
      treeShaking: true,
      splitting: false,
      metafile: false,
      watch: false,
    },
  }),
  getBuildConfig: vi.fn().mockReturnValue({
    entryPoint: './src/index.ts',
    outDir: './dist',
    outFile: 'server.js',
    format: 'esm',
    minify: true,
    sourcemap: false,
    bundle: true,
    external: [],
    define: {},
    platform: 'node',
    target: 'node16',
    treeShaking: true,
    splitting: false,
    metafile: false,
    watch: false,
  }),
  validateBuildConfig: vi.fn().mockReturnValue(undefined),
}));

vi.mock('./bundler/index.js', () => ({
  bundle: vi.fn().mockResolvedValue({
    success: true,
    outputFiles: ['/test/dist/server.js'],
    stats: {
      startTime: 1000,
      endTime: 2000,
      duration: 1000,
      entryPoints: ['./src/index.ts'],
      outputSize: 1024,
      dependencies: 5,
    },
  }),
  bundleWatch: vi.fn().mockResolvedValue({
    watch: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn().mockResolvedValue(undefined),
  }),
  bundleCli: vi.fn().mockResolvedValue({
    success: true,
    outputFiles: ['/test/dist/server-cli.js'],
    stats: {
      startTime: 1000,
      endTime: 2000,
      duration: 1000,
      entryPoints: ['./src/index.ts'],
      outputSize: 1024,
      dependencies: 5,
    },
  }),
  cleanBuildDir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('build-dynemcp', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(vi.fn());
  const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(vi.fn());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('build function', () => {
    it('should build a project successfully', async () => {
      const result = await build();

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(bundler.bundle).toHaveBeenCalled();
    });

    it('should build with custom options', async () => {
      const options = {
        configPath: './custom.config.json',
        clean: true,
        analyze: true,
        manifest: true,
        html: true,
      };

      const result = await build(options);

      expect(result.success).toBe(true);
      expect(config.loadConfig).toHaveBeenCalledWith('./custom.config.json');
      expect(bundler.bundle).toHaveBeenCalled();
    });

    it('should handle build failures', async () => {
      vi.mocked(bundler.bundle).mockResolvedValueOnce({
        success: false,
        errors: ['Build failed'],
        stats: {
          startTime: 1000,
          endTime: 2000,
          duration: 1000,
          entryPoints: [],
          outputSize: 0,
          dependencies: 0,
        },
      });

      const result = await build();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Build failed');
    });

    it('should handle exceptions', async () => {
      vi.mocked(config.loadConfig).mockImplementationOnce(() => {
        throw new Error('Config error');
      });

      const result = await build();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Config error');
    });
  });

  describe('watch function', () => {
    it('should start watch mode successfully', async () => {
      const ctx = await watch();

      expect(ctx).toBeDefined();
      expect(bundler.bundleWatch).toHaveBeenCalled();
    });

    it('should handle watch mode failures', async () => {
      vi.mocked(bundler.bundleWatch).mockRejectedValueOnce(new Error('Watch failed'));

      await expect(watch()).rejects.toThrow('Watch failed');
    });
  });

  describe('buildCli function', () => {
    it('should build CLI successfully', async () => {
      const result = await buildCli();

      expect(result.success).toBe(true);
      expect(bundler.bundleCli).toHaveBeenCalled();
    });

    it('should handle CLI build failures', async () => {
      vi.mocked(bundler.bundleCli).mockResolvedValueOnce({
        success: false,
        errors: ['CLI build failed'],
        stats: {
          startTime: 1000,
          endTime: 2000,
          duration: 1000,
          entryPoints: [],
          outputSize: 0,
          dependencies: 0,
        },
      });

      const result = await buildCli();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('CLI build failed');
    });
  });

  describe('clean function', () => {
    it('should clean build directory successfully', async () => {
      await clean({ outDir: './dist' });

      expect(bundler.cleanBuildDir).toHaveBeenCalledWith('./dist');
    });

    it('should clean using config path', async () => {
      await clean({ configPath: './dynemcp.config.json' });

      expect(config.loadConfig).toHaveBeenCalledWith('./dynemcp.config.json');
      expect(bundler.cleanBuildDir).toHaveBeenCalled();
    });

    it('should handle clean failures', async () => {
      vi.mocked(bundler.cleanBuildDir).mockRejectedValueOnce(new Error('Clean failed'));

      await expect(clean()).rejects.toThrow('Clean failed');
    });
  });

  describe('analyze function', () => {
    it('should analyze dependencies successfully', async () => {
      const analysis = await analyze();

      expect(analysis).toBeDefined();
    });

    it('should analyze with custom entry point', async () => {
      const analysis = await analyze({ entryPoint: './custom/index.ts' });

      expect(analysis).toBeDefined();
    });

    it('should handle analysis failures', async () => {
      vi.mocked(config.loadConfig).mockImplementationOnce(() => {
        throw new Error('Analysis failed');
      });

      await expect(analyze()).rejects.toThrow('Analysis failed');
    });
  });
});

