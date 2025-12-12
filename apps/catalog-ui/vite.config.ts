import { federation } from '@module-federation/vite';
import vue from '@vitejs/plugin-vue';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  root: resolve(__dirname, './'),
  cacheDir: '../../node_modules/.vite/apps/catalog-ui',
  server: {
    port: 5001,
    strictPort: true,
  },
  preview: {
    port: 5001,
    strictPort: true,
  },
  plugins: [
    vue(),
    federation({
      name: 'catalogUI',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './BaseLayout': resolve(__dirname, 'src/layouts/BaseLayout.vue'),
        './HelloWorld': resolve(__dirname, 'src/components/HelloWorld.vue'),
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '3.5.25',
        },
        quasar: { singleton: true } as Record<string, unknown>,
        axios: {
          singleton: true,
          requiredVersion: '1.13.2',
        },
        '@linagora/linid-im-front-corelib': {
          singleton: true,
          strictVersion: true,
        } as Record<string, unknown>,
      },
    }),
  ],
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../../dist/apps/catalog-ui'),
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
