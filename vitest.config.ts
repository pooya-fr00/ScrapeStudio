import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
    },
    projects: [
      {
        test: {
          environment: 'jsdom',
          include: ['apps/**/*.test.{ts,tsx}', 'packages/**/*.test.ts'],
          name: 'unit',
          setupFiles: ['./apps/web/src/test/setup.ts'],
        },
      },
      {
        test: {
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          name: 'integration',
        },
      },
    ],
  },
});
