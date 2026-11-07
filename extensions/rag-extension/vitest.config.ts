import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    maxWorkers: 4,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
