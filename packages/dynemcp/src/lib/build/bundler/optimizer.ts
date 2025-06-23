/**
 * Bundle optimizer for DyneMCP projects
 */

import * as fs from 'fs'

/**
 * Optimize the bundled file for production
 */
export async function optimizeBundle(filePath: string): Promise<void> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8')
    let optimizedContent = content

    // Remove console.log statements in production
    if (process.env.NODE_ENV === 'production') {
      optimizedContent = optimizedContent.replace(
        /console\.(log|debug|info|warn|error)\s*\([^)]*\);?\s*/g,
        ''
      )
    }

    // Remove source map comments if not needed
    if (!process.env.GENERATE_SOURCEMAP) {
      optimizedContent = optimizedContent.replace(
        /\/\/# sourceMappingURL=.*$/gm,
        ''
      )
    }

    // Optimize imports for MCP server
    optimizedContent = optimizeMCPImports(optimizedContent)

    // Write optimized content back
    await fs.promises.writeFile(filePath, optimizedContent)

    const originalSize = Buffer.byteLength(content, 'utf-8')
    const optimizedSize = Buffer.byteLength(optimizedContent, 'utf-8')
    const savings = originalSize - optimizedSize
    const savingsPercent = ((savings / originalSize) * 100).toFixed(2)

    if (shouldLog())
      console.log(
        `⚡ Bundle optimized: ${(originalSize / 1024).toFixed(2)}KB → ${(
          optimizedSize / 1024
        ).toFixed(2)}KB (${savingsPercent}% reduction)`
      )
  } catch (error) {
    if (shouldLog()) console.warn('⚠️  Could not optimize bundle:', error)
  }
}

/**
 * Optimize imports specifically for MCP server environment
 */
function optimizeMCPImports(content: string): string {
  // Remove unused MCP imports in production
  if (process.env.NODE_ENV === 'production') {
    // Remove debug imports
    content = content.replace(
      /import\s+.*debug.*from\s+['"][^'"]*['"];?\s*/g,
      ''
    )

    // Remove development-only imports
    content = content.replace(/import\s+.*dev.*from\s+['"][^'"]*['"];?\s*/g, '')
  }

  // Optimize MCP SDK imports
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+['"]@modelcontextprotocol\/sdk[^'"]*['"];?\s*/g,
    (match) => {
      // Only keep essential MCP imports
      const essentialImports = [
        'McpServer',
        'McpError',
        'Tool',
        'Resource',
        'Prompt',
        'CallToolRequestSchema',
        'ListToolsRequestSchema',
        'ReadResourceRequestSchema',
        'ListResourcesRequestSchema',
        'GetPromptRequestSchema',
        'ListPromptsRequestSchema',
      ]

      const imports = match.match(/\{([^}]*)\}/)?.[1] || ''
      const importList = imports.split(',').map((i) => i.trim())
      const filteredImports = importList.filter((imp) =>
        essentialImports.some((essential) => imp.includes(essential))
      )

      if (filteredImports.length === 0) {
        return ''
      }

      return `import { ${filteredImports.join(', ')} } from '@modelcontextprotocol/sdk';`
    }
  )

  return content
}

/**
 * Generate bundle statistics
 */
export function generateBundleStats(filePath: string): {
  size: number
  sizeKB: string
  sizeMB: string
  lines: number
  characters: number
} {
  try {
    const stats = fs.statSync(filePath)
    const content = fs.readFileSync(filePath, 'utf-8')

    return {
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      lines: content.split('\n').length,
      characters: content.length,
    }
  } catch (error) {
    if (shouldLog()) console.warn('⚠️  Could not generate bundle stats:', error)
    return {
      size: 0,
      sizeKB: '0',
      sizeMB: '0',
      lines: 0,
      characters: 0,
    }
  }
}

function shouldLog() {
  return !process.env.DYNE_MCP_STDIO_LOG_SILENT
}

export default {
  optimizeBundle,
  optimizeMCPImports,
  generateBundleStats,
}
