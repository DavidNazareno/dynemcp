import type { Metadata } from 'next'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: 'DyneMCP - Modern TypeScript MCP Framework',
    template: '%s | DyneMCP',
  },
  description:
    'A modern TypeScript framework for building Model Context Protocol (MCP) servers with ease.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navbar = (
    <Navbar
      logo={<strong>DyneMCP</strong>}
      projectLink="https://github.com/your-username/dynemcp"
    />
  )

  const footer = (
    <Footer>MIT {new Date().getFullYear()} © DyneMCP Framework.</Footer>
  )

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/your-username/dynemcp/tree/main/dynedocs"
          editLink="Edit this page on GitHub"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
