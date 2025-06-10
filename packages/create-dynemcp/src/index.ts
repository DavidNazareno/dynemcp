#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const projectName = args[0] || "my-mcp-project";

// Create project directory
const projectDir = path.resolve(process.cwd(), projectName);
if (fs.existsSync(projectDir)) {
  console.error(`Error: Directory ${projectName} already exists.`);
  process.exit(1);
}

console.log(`Creating a new DyneMCP project in ${projectDir}...`);
fs.mkdirSync(projectDir, { recursive: true });

// Create the folder structure
const directories = ["tools", "resources", "prompt", "src", "scripts"];

directories.forEach((dir) => {
  fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
});

// Create the base files
const files = [
  {
    path: "scripts/build.js",
    content: `#!/usr/bin/env node

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
    execSync('npm install --no-save esbuild', { 
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
`,
  },
  {
    path: "tools/tools.ts",
    content: `import { tools } from 'dynemcp';

// Define your tools here
// Example:
// const myTool = tools.createTool({
//   name: 'myTool',
//   description: 'A tool that does something',
//   parameters: {
//     type: 'object',
//     properties: {
//       input: { type: 'string' }
//     },
//     required: ['input']
//   },
//   handler: async ({ input }) => {
//     return { result: \`Processed: \${input}\` };
//   }
// });

// Register your tools
// tools.registerTool(myTool);

export default tools;`,
  },
  {
    path: "resources/resource.ts",
    content: `import { resources } from 'dynemcp';

// Define your resources here
// Example:
// const myResource = resources.createDynamicResource({
//   name: 'myResource',
//   description: 'A resource that provides data',
//   generator: async () => {
//     return 'Some resource content';
//   }
// });

// Register your resources
// resources.registerResource(myResource);

export default resources;`,
  },
  {
    path: "prompt/prompt.ts",
    content: `import { prompt } from 'dynemcp';

// Define your prompts here
// Example:
// const myPrompt = prompt.createTemplatePrompt({
//   name: 'myPrompt',
//   content: 'This is a prompt template with {{variable}}'
// });

// Register your prompts
// prompt.registerPrompt(myPrompt);

export default prompt;`,
  },
  {
    path: "dynemcp.config.json",
    content: `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "A Model Context Protocol (MCP) server",
  "tools": {
    "directory": "./tools"
  },
  "resources": {
    "directory": "./resources"
  },
  "prompts": {
    "directory": "./prompt"
  }
}`,
  },
  {
    path: "src/index.ts",
    content: `import { createMCPServer } from 'dynemcp';
import tools from '../tools/tools';
import resources from '../resources/resource';
import prompt from '../prompt/prompt';

// Initialize the MCP server
const server = createMCPServer("${projectName}", "1.0.0");

// Conectar el servidor a la entrada/salida estándar
if (process.env.NODE_ENV === 'development') {
  console.log('Modo desarrollo: El servidor se iniciará a través del inspector MCP');
} else {
  // En producción, conectar directamente
  import('@modelcontextprotocol/sdk').then(({ StdioServerTransport }) => {
    server.connect(new StdioServerTransport())
      .catch(error => {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
      });
  });
}`,
  },
  {
    path: "tsconfig.json",
    content: `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}`,
  },
  {
    path: "package.json",
    content: `{
  "name": "${projectName}",
  "version": "0.1.0",
  "description": "A Model Context Protocol (MCP) server",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "dev": "cross-env NODE_ENV=development npx @modelcontextprotocol/inspector serve src/index.ts",
    "build": "node ./scripts/build.js",
    "start": "node dist/server.js",
    "format": "prettier --write .",
    "eslint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "eslint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "beautify": "pnpm run format && pnpm run eslint:fix"
  },
  "dependencies": {
    "dynemcp": "^1.0.0",
    "@modelcontextprotocol/sdk": "^1.12.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@typescript-eslint/eslint-plugin": "^8.33.1",
    "@typescript-eslint/parser": "^8.33.1",
    "cross-env": "^7.0.3",
    "dynebuild": "^1.0.0",
    "eslint": "^9.28.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.2"
  },
  "packageManager": "pnpm@10.9.0"
}`,
  },
  {
    path: ".gitignore",
    content: `node_modules
dist
.env
.DS_Store`,
  },
  {
    path: "README.md",
    content: `# ${projectName}

A Model Context Protocol (MCP) server built with DyneMCP.

## Project Structure

\`\`\`
${projectName}/
│
├── tools/            → MCP tools (functions executable by AI)
│   └── tools.ts      → Central file registering tools
│
├── scripts/          → Build and utility scripts
│   └── build.js      → Script to build the MCP server using dynebuild
│
├── resources/        → Static or dynamic resources
│   └── resource.ts   → Central file registering resources
│
├── prompt/           → Base or transformable prompts
│   └── prompt.ts     → Central registry of prompts
│
├── src/              → Source code
│   └── index.ts      → Entry point
│
└── dynemcp.config.json → MCP server configuration
\`\`\`

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev
\`\`\`

## Building for Production

This project uses \`dynebuild\` to create a unified, minified bundle for production deployment:

\`\`\`bash
pnpm run build
\`\`\`

This command will:
1. Create a single optimized file at \`dist/server.js\`
2. Include all your code and dependencies in one bundle
3. Minify the output for better performance

After building, you can run your MCP server with:

\`\`\`bash
pnpm start
# or
node dist/server.js
\`\`\`

## Adding Tools, Resources, and Prompts

- Add tools in \`tools/tools.ts\`
- Add resources in \`resources/resource.ts\`
- Add prompts in \`prompt/prompt.ts\`

For more information, refer to the [DyneMCP documentation](https://github.com/yourusername/dynemcp).
`,
  },
];

files.forEach((file) => {
  const filePath = path.join(projectDir, file.path);
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, file.content);
});

// Initialize git repository
try {
  console.log("Initializing git repository...");
  execSync("git init", { cwd: projectDir, stdio: "ignore" });
  execSync("git add .", { cwd: projectDir, stdio: "ignore" });
  execSync('git commit -m "Initial commit"', {
    cwd: projectDir,
    stdio: "ignore",
  });
} catch {
  console.warn("Git initialization failed. You can initialize git manually.");
}

console.log(`
🚀 Successfully created DyneMCP project: ${projectName}

Next steps:
  cd ${projectName}
  pnpm install
  pnpm dev

Happy coding!
`);
