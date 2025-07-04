import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'build/**',
        '**/index.ts',
        '../src/db.ts',
        '../src/server.ts',
      ]
    }
  }
});
