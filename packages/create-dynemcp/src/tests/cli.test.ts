/**
 * Tests for the create-dynemcp CLI
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Mock the fs, path, and child_process modules
vi.mock("fs");
vi.mock("path");
vi.mock("child_process");

describe("create-dynemcp CLI", () => {
  const mockProjectName = "test-project";
  const mockProjectDir = "/mock/path/test-project";

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Mock process.argv
    const originalArgv = process.argv;
    vi.spyOn(process, "argv", "get").mockReturnValue([
      ...originalArgv.slice(0, 2),
      mockProjectName,
    ]);

    // Mock path.resolve
    vi.mocked(path.resolve).mockReturnValue(mockProjectDir);

    // Mock fs.existsSync
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // Mock fs.mkdirSync
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);

    // Mock fs.writeFileSync
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    // Mock execSync
    vi.mocked(execSync).mockImplementation(() => Buffer.from(""));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create project directory", async () => {
    // Import the CLI module (this will execute the script)
    await import("../index.js");

    // Verify that mkdirSync was called with the project directory
    expect(fs.mkdirSync).toHaveBeenCalledWith(mockProjectDir, {
      recursive: true,
    });
  });

  it("should create the required directories", async () => {
    // Import the CLI module
    await import("../index.js");

    // Verify that directories were created
    const expectedDirectories = ["tools", "resources", "prompt", "src"];

    expectedDirectories.forEach((dir) => {
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining(dir), {
        recursive: true,
      });
    });
  });

  it("should write the required files", async () => {
    // Import the CLI module
    await import("../index.js");

    // Verify that writeFileSync was called for each file
    const expectedFiles = [
      "tools/tools.ts",
      "resources/resource.ts",
      "prompt/prompt.ts",
      "dynemcp.config.json",
      "src/index.ts",
      "tsconfig.json",
      "package.json",
      ".gitignore",
      "README.md",
    ];

    expectedFiles.forEach((file) => {
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(file),
        expect.any(String),
      );
    });
  });

  it("should initialize git repository", async () => {
    // Import the CLI module
    await import("../index.js");

    // Verify that git commands were executed
    expect(execSync).toHaveBeenCalledWith("git init", expect.any(Object));
    expect(execSync).toHaveBeenCalledWith("git add .", expect.any(Object));
    expect(execSync).toHaveBeenCalledWith(
      'git commit -m "Initial commit"',
      expect.any(Object),
    );
  });

  it("should handle existing directory error", async () => {
    // Mock fs.existsSync to return true (directory exists)
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock process.exit
    const mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process exit with code ${code}`);
    });

    // Mock console.error
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Import the CLI module and expect it to exit
    await expect(import("../index.js")).rejects.toThrow(
      "Process exit with code 1",
    );

    // Verify that console.error was called with the expected message
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("already exists"),
    );

    // Restore mocks
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });
});
