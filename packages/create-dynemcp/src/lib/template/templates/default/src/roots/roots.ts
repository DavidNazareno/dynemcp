// roots.ts: ejemplo mínimo de archivo de roots
export default [
  {
    path: '/',
    handler: () => ({
      status: 200,
      body: 'Welcome to your DyneMCP server!',
    }),
  },
]
