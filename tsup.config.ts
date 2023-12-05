import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'bin',
  clean: true,
  sourcemap: true,
  splitting: false,
})
