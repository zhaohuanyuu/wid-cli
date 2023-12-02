import { defineConfig } from 'tsup'

// const lifecycleScript = process.env.npm_lifecycle_script as string;
// const isProd = lifecycleScript.indexOf('production') > -1;

export default defineConfig({
  entry: ['src/main.ts'],
  target: 'es2020',
  clean: true,
  sourcemap: true,
  splitting: false,
  publicDir: '/server',
  // legacyOutput: true,
  format: ['esm', /*'cjs'*/],
  outExtension({ format }) {
    return {
      js: `.${format !== 'esm' ? format : ''}js`
    }
  }
})
