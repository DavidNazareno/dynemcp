// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// Import the logo images
import lightLogo from './src/assets/Black-Text-Logo-DYNEMCP.svg'
import darkLogo from './src/assets/White-Text-Logo-DYNEMCP.svg'

// https://astro.build/config
export default defineConfig({
  outDir: '../dist/apps',
  site: 'https://github.com/DavidNazareno/dynemcp',
  integrations: [
    starlight({
      title: 'DyneMCP',
      description: 'Build powerful MCP servers with TypeScript',
      logo: {
        light: lightLogo,
        dark: darkLogo,
        replacesTitle: true,
        alt: 'DyneMCP Logo',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/DavidNazareno/dynemcp',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/DavidNazareno/dynemcp/edit/main/apps/src/content/docs/',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Getting Started', link: '/guides/getting-started' },
            { label: 'Project Templates', link: '/guides/templates' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Security Best Practices', link: '/guides/security' },
            { label: 'Production Deployment', link: '/guides/deployment' },
            { label: 'Performance Optimization', link: '/guides/performance' },
            { label: 'Monitoring', link: '/guides/monitoring' },
            { label: 'Compliance', link: '/guides/compliance' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Server Architecture', link: '/reference/server' },
            { label: 'Build System', link: '/reference/build-system' },
            { label: 'Configuration', link: '/reference/configuration' },
            { label: 'API Reference', link: '/reference/api' },
            { label: 'Transport Options', link: '/reference/transport' },
            { label: 'CLI Reference', link: '/reference/cli' },
          ],
        },
        {
          label: 'API Documentation',
          items: [
            { label: 'Tools API', link: '/api/tools' },
            { label: 'Resources API', link: '/api/resources' },
            { label: 'Registry API', link: '/api/registry' },
            { label: 'Communication API', link: '/api/communication' },
          ],
        },
      ],
      /*   customCss: ['./src/styles/custom.css'], */
      head: [
        // Add ICO favicon fallback for Safari.
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/x-icon',
            href: '/favicon.ico',
          },
        },
      ],
      favicon: '/favicon.svg',
    }),
  ],
})
