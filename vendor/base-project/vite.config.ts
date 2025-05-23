/// <reference types="vitest" />
import { resolve } from 'node:path'
import camelCase from 'camelcase'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'

const packageName = packageJson.name.split('/').pop() || packageJson.name

export default defineConfig({
  build: {
    target: 'node18',
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.dependencies || {}),
        /^node:/,
        /^@vitechgroup\//,
      ],
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      name: camelCase(packageName, { pascalCase: true }),
      fileName: packageName,
    },
  },
  plugins: [dts({ rollupTypes: true, insertTypesEntry: true })],
  resolve: {
    alias: {
      fs: 'node:fs',
      path: 'node:path',
      util: 'node:util',
    },
  },
  test: {
    hookTimeout: 999999,
    testTimeout: 999999,
    include: ['test/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
  },
})
