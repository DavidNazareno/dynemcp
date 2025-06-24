import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

export function useMDXComponents(components: any) {
  return {
    ...getDocsMDXComponents(),
    ...components,
  }
}
