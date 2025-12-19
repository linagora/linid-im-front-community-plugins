import { federation } from '@module-federation/vite';
import vue from '@vitejs/plugin-vue';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';
import { quasar } from '@quasar/vite-plugin';

export default defineConfig({
  root: resolve(__dirname, './'),
  base: '',
  cacheDir: '../../node_modules/.vite/apps/module-users',
  plugins: [
    vue(),
    quasar(),
    federation({
      name: 'moduleUsers',
      publicPath: 'http://localhost:5002/',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './routes': resolve(__dirname, 'src/routes.ts'),
        './lifecycle': resolve(__dirname, 'src/module-lifecycle.ts'),
        './HomePage': resolve(__dirname, 'src/pages/HomePage.vue'),
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '3.5.25',
        },
        quasar: {
          singleton: true,
          requiredVersion: '2.18.6',
        },
        '@linagora/linid-im-front-corelib': {
          singleton: true,
          strictVersion: true,
        },
      },
    }),
  ],
  server: {
    port: 5002,
    strictPort: true,
  },
  preview: {
    port: 5002,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../../dist/apps/module-users'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/index.ts'),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    commonjsOptions: { transformMixedEsModules: true },
  },
});
