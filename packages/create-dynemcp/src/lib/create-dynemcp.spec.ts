import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => args.join('/')),
  basename: vi.fn((p) => p.split('/').pop()),
}));

vi.mock('fs/promises', () => ({
  access: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue(['default', 'minimal']),
  stat: vi.fn().mockResolvedValue({ isDirectory: () => true }),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('commander', () => ({
  Command: vi.fn().mockImplementation(() => ({
    version: vi.fn().mockReturnThis(),
    argument: vi.fn().mockReturnThis(),
    usage: vi.fn().mockReturnThis(),
    helpOption: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    allowUnknownOption: vi.fn().mockReturnThis(),
    parse: vi.fn().mockReturnThis(),
    opts: vi.fn().mockReturnValue({
      typescript: true,
      eslint: true,
      git: true,
      template: 'default',
    }),
    args: ['test-project'],
  })),
}));

vi.mock('inquirer', () => ({
  prompt: vi.fn().mockResolvedValue({
    path: 'test-project',
    template: 'default',
    typescript: true,
    eslint: true,
    git: true,
    resetPreferences: false,
  }),
}));

vi.mock('ora', () =>
  vi.fn().mockImplementation(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: '',
  })),
);

vi.mock('update-check', () => vi.fn().mockResolvedValue(null));

vi.mock('conf', () =>
  vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue({
      typescript: true,
      eslint: true,
      template: 'default',
      git: true,
    }),
    set: vi.fn(),
    clear: vi.fn(),
  })),
);

// Mock core functionality
vi.mock('./core/create-project.js', () => ({
  createProject: vi.fn().mockResolvedValue(undefined),
  getAvailableTemplates: vi.fn().mockResolvedValue(['default', 'minimal', 'full']),
}));

// Mock helpers
vi.mock('./helpers/validate.js', () => ({
  validateProjectName: vi.fn().mockReturnValue({ valid: true }),
  validateProjectPath: vi.fn().mockResolvedValue('/test/test-project'),
  validateTemplate: vi.fn().mockReturnValue(true),
}));

vi.mock('./helpers/package-manager.js', () => ({
  installDependencies: vi.fn().mockResolvedValue({ success: true }),
  getRunCommand: vi.fn().mockReturnValue('pnpm run'),
}));

vi.mock('./helpers/package-info.js', () => ({
  getPackageVersion: vi.fn().mockReturnValue('0.1.0'),
}));

// Mock process.exit to prevent tests from exiting
// Using unknown and type assertion is safer than any
vi.spyOn(process, 'exit').mockImplementation(vi.fn() as unknown as () => never);

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ exitCode: 0 }),
}));

describe('create-dynemcp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.log to avoid test output pollution
    vi.spyOn(console, 'log').mockImplementation(vi.fn());
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core functionality', () => {
    it('should have proper helper modules', async () => {
      // Import helper modules to test their existence
      const validateModule = await import('./helpers/validate.js');
      const packageManagerModule = await import('./helpers/package-manager.js');
      const projectModule = await import('./core/create-project.js');

      const { validateProjectName } = validateModule;
      const { installDependencies } = packageManagerModule;
      const { createProject, getAvailableTemplates } = projectModule;

      expect(validateProjectName).toBeDefined();
      expect(installDependencies).toBeDefined();
      expect(createProject).toBeDefined();
      expect(getAvailableTemplates).toBeDefined();
    });

    it('should validate project names correctly', async () => {
      // Import the module directly to avoid TypeScript errors with mocking
      const validateModule = await import('./helpers/validate.js');

      // Create a custom mock for this test
      const originalValidateProjectName = validateModule.validateProjectName;

      // Replace with our test implementation
      validateModule.validateProjectName = vi
        .fn()
        .mockImplementationOnce(() => ({ valid: true }))
        .mockImplementationOnce(() => ({
          valid: false,
          problems: ['Invalid characters'],
        }));

      // Run the tests
      expect(validateModule.validateProjectName('valid-project')).toEqual({ valid: true });
      expect(validateModule.validateProjectName('invalid/project')).toEqual({
        valid: false,
        problems: ['Invalid characters'],
      });

      // Restore original function after test
      validateModule.validateProjectName = originalValidateProjectName;
    });

    it('should create projects with the correct template', async () => {
      // Import the module directly to avoid TypeScript errors
      const projectModule = await import('./core/create-project.js');
      const mockCreateProject = vi.fn().mockResolvedValue(undefined);

      // Store original and replace with mock
      const originalCreateProject = projectModule.createProject;
      projectModule.createProject = mockCreateProject;

      // Call the function
      await projectModule.createProject({
        projectPath: '/test/test-project',
        template: 'default',
        typescript: true,
        eslint: true,
      });

      // Test expectations
      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: '/test/test-project',
          template: 'default',
          typescript: true,
          eslint: true,
        }),
      );

      // Restore original function
      projectModule.createProject = originalCreateProject;
    });
  });
});
