import { build, watch } from './build-dynemcp.js';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as esbuild from 'esbuild';

// Mock esbuild
vi.mock('esbuild', () => ({
  build: vi.fn().mockResolvedValue({}),
}));

describe('build-dynemcp', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(vi.fn());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('build function', () => {
    it('should call esbuild with correct options in development mode', async () => {
      process.env.NODE_ENV = 'development';

      const options = {
        entryPoints: ['src/index.ts'],
        outfile: 'dist/index.js',
      };

      await build(options);

      expect(esbuild.build).toHaveBeenCalledWith({
        ...options,
        platform: 'node',
        format: 'esm',
        bundle: true,
        minify: false,
        sourcemap: true,
      });
    });

    it('should call esbuild with correct options in production mode', async () => {
      process.env.NODE_ENV = 'production';

      const options = {
        entryPoints: ['src/index.ts'],
        outfile: 'dist/index.js',
      };

      await build(options);

      expect(esbuild.build).toHaveBeenCalledWith({
        ...options,
        platform: 'node',
        format: 'esm',
        bundle: true,
        minify: true,
        sourcemap: false,
      });
    });

    it('should handle build errors properly', async () => {
      const mockError = new Error('Build failed');
      vi.mocked(esbuild.build).mockRejectedValueOnce(mockError);

      await build({ entryPoints: ['src/index.ts'] });

      expect(mockConsoleError).toHaveBeenCalledWith('Build failed:', mockError);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('watch function', () => {
    it('should call esbuild with correct watch options', async () => {
      const options = {
        entryPoints: ['src/index.ts'],
        outfile: 'dist/index.js',
      };

      await watch(options);

      expect(esbuild.build).toHaveBeenCalledWith({
        ...options,
        platform: 'node',
        format: 'esm',
        bundle: true,
        sourcemap: true,
      });
    });

    it('should handle watch errors properly', async () => {
      const mockError = new Error('Watch build failed');
      vi.mocked(esbuild.build).mockRejectedValueOnce(mockError);

      await watch({ entryPoints: ['src/index.ts'] });

      expect(mockConsoleError).toHaveBeenCalledWith('Watch build failed:', mockError);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
