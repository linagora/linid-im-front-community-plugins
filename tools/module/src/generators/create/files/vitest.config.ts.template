import vue from '@vitejs/plugin-vue';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/unit/**/*.{test,spec}.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        '**/*.spec.js',
        '**/*.test.js',
        '**/tests/**',
        'src/index.ts',
        'src/vue-shims.d.ts',
      ],
    },
  },
  plugins: [vue(), tsconfigPaths()],
});
