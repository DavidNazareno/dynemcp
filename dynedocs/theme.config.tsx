import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>DyneMCP</span>,
  project: {
    link: 'https://github.com/dynemcp/dynemcp',
  },
  chat: {
    link: 'https://discord.gg/dynemcp',
  },
  docsRepositoryBase: 'https://github.com/dynemcp/dynemcp/tree/main/dynedocs',
  footer: {
    text: 'DyneMCP Documentation © 2025',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – DyneMCP',
    }
  },
}

export default config
