import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Performance tuning:
    // - Inline common testing deps to avoid Vite pre-bundling overhead
    // - Limit worker threads to a fraction of CPU by default (helps on Windows)
    // - Restrict test include pattern to src to avoid scanning unrelated files
    deps: {
      inline: [
        '@testing-library/react',
        '@testing-library/jest-dom',
        'jsdom',
      ],
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
    },
  },
});
