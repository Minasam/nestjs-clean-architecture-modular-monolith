import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// ADR 0005: Vitest + SWC. SWC (configured from tsconfig.json) emits the decorator
// metadata NestJS dependency injection needs; Vite's default transform does not.
export default defineConfig({
  plugins: [swc.vite()],
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts'],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
