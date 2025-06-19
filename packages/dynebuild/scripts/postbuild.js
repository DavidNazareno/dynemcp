#!/usr/bin/env node

/**
 * Post-build script for dynebuild
 * Copies bin/index.ts to dist/bin/index.js and makes it executable
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const rootDir = path.resolve(__dirname, '..');
const srcBinDir = path.join(rootDir, 'src', 'bin');
const distBinDir = path.join(rootDir, 'dist', 'bin');

// Create bin directory if it doesn't exist
if (!fs.existsSync(distBinDir)) {
  fs.mkdirSync(distBinDir, { recursive: true });
}

// Copy bin/index.ts to dist/bin/cli.js
fs.copyFileSync(
  path.join(srcBinDir, 'index.ts'),
  path.join(distBinDir, 'cli.js')
);

// Make the file executable
try {
  execSync(`chmod +x ${path.join(distBinDir, 'cli.js')}`);
  console.log('Made dist/bin/cli.js executable');
} catch (error) {
  console.error('Failed to make dist/bin/cli.js executable:', error);
}

// Add shebang to the file
const filePath = path.join(distBinDir, 'cli.js');
const fileContent = fs.readFileSync(filePath, 'utf8');
if (!fileContent.startsWith('#!/usr/bin/env node')) {
  fs.writeFileSync(filePath, `#!/usr/bin/env node\n${fileContent}`);
  console.log('Added shebang to dist/bin/cli.js');
}

console.log('Post-build completed successfully');
