// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  outDir: '../dist/apps',
  site: 'https://dynemcp.dev',
  integrations: [
    starlight({
      title: 'DyneMCP',
      description: 'Build powerful MCP servers with TypeScript',
      logo: {
        light: './src/assets/Black-Text-Logo-DYNEMCP.svg',
        dark: './src/assets/White-Text-Logo-DYNEMCP.svg',
        replacesTitle: true,
        alt: 'DyneMCP Logo',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/dynemcp/dynemcp',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/dynemcp/dynemcp/edit/main/apps/src/content/docs/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'Getting Started', link: '/getting-started/' },
            { label: 'Framework Overview', link: '/framework/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Architecture', link: '/guides/architecture/' },
            { label: 'Security', link: '/guides/security/' },
            { label: 'Performance', link: '/guides/performance/' },
            { label: 'Testing', link: '/guides/testing/' },
            { label: 'Deployment', link: '/guides/deployment/' },
            { label: 'Contributing', link: '/guides/contributing/' },
            { label: 'FAQ', link: '/guides/faq/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Server API', link: '/api/server/' },
            { label: 'Tool API', link: '/api/tools/' },
            { label: 'Resource API', link: '/api/resources/' },
            { label: 'Transport API', link: '/api/transport/' },
            { label: 'Registry API', link: '/api/registry/' },
            { label: 'Configuration API', link: '/api/config/' },
          ],
        },
        {
          label: 'Core Features',
          items: [
            { label: 'Tools System', link: '/tools/' },
            { label: 'Templates', link: '/templates/' },
            { label: 'CLI Reference', link: '/cli/' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
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
