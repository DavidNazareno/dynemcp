/**
 * Configuration utilities for DyneMCP projects
 */

import fs from "fs";
import path from "path";
import { z } from "zod";

// Define the schema for dynemcp.config.json
const DyneMCPConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  tools: z.object({
    directory: z.string().default("./tools"),
  }),
  resources: z.object({
    directory: z.string().default("./resources"),
  }),
  prompts: z.object({
    directory: z.string().default("./prompt"),
  }),
  build: z
    .object({
      entryPoint: z.string().default("./src/index.ts"),
      outDir: z.string().default("./dist"),
      format: z.enum(["esm", "cjs"]).default("esm"),
      minify: z.boolean().default(false),
    })
    .optional(),
});

export type DyneMCPConfig = z.infer<typeof DyneMCPConfigSchema>;

/**
 * Load the DyneMCP configuration file
 */
export function loadConfig(configPath = "dynemcp.config.json"): DyneMCPConfig {
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath);

  try {
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Configuration file not found: ${absolutePath}`);
    }

    const configContent = fs.readFileSync(absolutePath, "utf-8");
    const config = JSON.parse(configContent);

    return DyneMCPConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid configuration:", error.errors);
    } else {
      console.error("Failed to load configuration:", error);
    }
    process.exit(1);
  }
}

/**
 * Create a default DyneMCP configuration
 */
export function createDefaultConfig(
  name: string,
  version = "1.0.0",
): DyneMCPConfig {
  return {
    name,
    version,
    description: `A Model Context Protocol (MCP) server named ${name}`,
    tools: {
      directory: "./tools",
    },
    resources: {
      directory: "./resources",
    },
    prompts: {
      directory: "./prompt",
    },
    build: {
      entryPoint: "./src/index.ts",
      outDir: "./dist",
      format: "esm",
      minify: false,
    },
  };
}

export default {
  loadConfig,
  createDefaultConfig,
};
