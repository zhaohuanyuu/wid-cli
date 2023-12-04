import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'bin',
  target: 'es2021',
  clean: true,
  sourcemap: true,
  splitting: false,
})
