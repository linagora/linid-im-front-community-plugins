import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/apps/catalog-ui',
  server: { port: 4200, host: 'localhost' },
  preview: { port: 5001, host: 'localhost' },
  resolve: {
    alias: {
      '@linagora/linid-im-front-corelib': path.resolve(
        __dirname,
        '../../../linid-im-front-corelib/dist/core-lib.es.js'
      ),
    },
  },
  plugins: [
    vue(),
    federation({
      name: 'catalog-ui',
      filename: 'remoteEntry.js',
      exposes: {
        './BaseLayout': path.resolve(__dirname, 'src/layouts/BaseLayout.vue'),
        './HelloWorld': path.resolve(
          __dirname,
          'src/components/HelloWorld.vue'
        ),
      },
      shared: {
        vue: { singleton: true } as Record<string, any>,
        quasar: { singleton: true } as Record<string, any>,
        '@linagora/linid-im-front-corelib': {
          singleton: true,
          strictVersion: true,
        } as Record<string, any>,
      },
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, '../../dist/apps/catalog-ui'),
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
