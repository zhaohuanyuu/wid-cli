// import fs from "node:fs"
// import path from "node:path"
import type { Format } from "tsup"
import { defineConfig } from 'tsup'

// fs.writeFile(path.resolve('./env.json'), JSON.stringify(process.env, null, 2), err => {
//   if (err) console.error(err)
// })

const lifecycleScript = process.env.npm_lifecycle_script as string;
const isProd = lifecycleScript.indexOf('production') > -1;
const formats = ['cjs', 'esm', 'iife'].filter(item => !isProd || (isProd && item === 'iife')) as Format[];

export default defineConfig({
  entry: ['src/main.ts'],
  target: 'es2020',
  clean: true,
  sourcemap: true,
  splitting: false,
  // legacyOutput: true,
  publicDir: '/server',
  format: formats,
  // format: ['esm', 'cjs', 'iife'],
  outExtension({format}) {
    const extension = (format: string): string => format === 'iife' ? 'umd' : format
    return {
      js: `.${extension(format)}.js`,
    }
  },
})
