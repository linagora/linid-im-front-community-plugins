import { federation } from '@module-federation/vite';
import { quasar } from '@quasar/vite-plugin';
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
    quasar(),
    federation({
      name: 'catalogUI',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './BaseLayout': resolve(__dirname, 'src/layouts/BaseLayout.vue'),
        './GenericEntityTable': resolve(
          __dirname,
          'src/components/table/GenericEntityTable.vue'
        ),
        './NavigationMenu': resolve(
          __dirname,
          'src/components/menu/NavigationMenu.vue'
        ),
        './BlurLoader': resolve(
          __dirname,
          'src/components/loader/BlurLoader.vue'
        ),
        './InformationCard': resolve(
          __dirname,
          'src/components/card/InformationCard.vue'
        ),
        './EntityDetailsCard': resolve(
          __dirname,
          'src/components/card/EntityDetailsCard.vue'
        ),
        './ButtonsCard': resolve(
          __dirname,
          'src/components/card/ButtonsCard.vue'
        ),
        './EntityAttributeField': resolve(
          __dirname,
          'src/components/field/EntityAttributeField.vue'
        ),
        './EntityAttributeBooleanField': resolve(
          __dirname,
          'src/components/field/EntityAttributeBooleanField.vue'
        ),
        './EntityAttributeNumberField': resolve(
          __dirname,
          'src/components/field/EntityAttributeNumberField.vue'
        ),
        './EntityAttributeTextField': resolve(
          __dirname,
          'src/components/field/EntityAttributeTextField.vue'
        ),
        './EntityAttributeDateField': resolve(
          __dirname,
          'src/components/field/EntityAttributeDateField.vue'
        ),
        './AdvancedSearchCard': resolve(
          __dirname,
          'src/components/card/AdvancedSearchCard.vue'
        ),
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
        axios: {
          singleton: true,
          requiredVersion: '1.13.2',
        },
        '@linagora/linid-im-front-corelib': {
          singleton: true,
          strictVersion: true,
        },
        'vue-router': {
          singleton: true,
          requiredVersion: '4.6.4',
        },
        pinia: {
          singleton: true,
          requiredVersion: '3.0.4',
        },
        '@vueuse/core': {
          singleton: true,
          requiredVersion: '14.1.0',
        },
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
