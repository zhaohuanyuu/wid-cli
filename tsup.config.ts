import { defineConfig } from 'tsup'

// const lifecycleScript = process.env.npm_lifecycle_script as string;
// const isProd = lifecycleScript.indexOf('production') > -1;

export default defineConfig({
  entry: ['bin/index.ts'],
  target: 'es2021',
  clean: true,
  sourcemap: true,
  splitting: false,
  // publicDir: '/server',
  // legacyOutput: true,
  // format: ['esm', 'cjs'],
})
