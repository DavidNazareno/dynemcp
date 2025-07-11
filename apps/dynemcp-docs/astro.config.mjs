// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// Import the logo images
import lightLogo from './src/assets/Black-Text-Logo-DYNEMCP.svg'
import darkLogo from './src/assets/White-Text-Logo-DYNEMCP.svg'

// https://astro.build/config
export default defineConfig({
  outDir: './dist',
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
          label: 'Guides',
          items: [
            { label: 'Installation', link: '/guides/install' },
            { label: 'Getting Started', link: '/guides/getting-started' },
            { label: 'Project Templates', link: '/guides/templates' },
            { label: 'Security', link: '/guides/security' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Configuration', link: '/api/config' },
            { label: 'Tool API', link: '/api/tool' },
            { label: 'Resource API', link: '/api/resource' },
            { label: 'Prompt API', link: '/api/prompt' },
            { label: 'Root API', link: '/api/root' },
          ],
        },
        // Advanced section can be added here in the future
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
