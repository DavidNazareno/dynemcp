import type { PackageManager } from '../helpers/package-manager.js';

export interface GetTemplateFileArgs {
  template: string;
  file: string;
}

export interface InstallTemplateArgs {
  appName: string;
  root: string;
  packageManager: PackageManager;
  template: string;
  mode: 'js' | 'ts';
  tailwind: boolean;
  eslint: boolean;
  srcDir: boolean;
  importAlias: string;
  skipInstall: boolean;
}

export interface CommandOptions {
  typescript?: boolean;
  javascript?: boolean;
  template?: string;
  eslint?: boolean;
  git?: boolean;
  skipInstall?: boolean;
  yes?: boolean;
  resetPreferences?: boolean;
}

// Type assertion for updateCheck
export interface PackageInfo {
  name: string;
  version: string;
}

export interface UpdateInfo {
  latest: string;
  fromCache: boolean;
}
