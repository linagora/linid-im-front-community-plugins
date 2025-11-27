import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';
import headers from 'eslint-plugin-headers';
import jsdoc from 'eslint-plugin-jsdoc';
import vue from 'eslint-plugin-vue';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfigWithVueTs(
  {
    ignores: [
      '**/dist/',
      '**/coverage/',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/out-tsc/',
      '**/*.template',
      '**/.__mf__temp',
    ],
  },
  nx.configs['flat/base'],
  nx.configs['flat/typescript'],
  nx.configs['flat/javascript'],
  js.configs.recommended,
  vueTsConfigs.recommended,
  vue.configs['flat/recommended'],
  jsdoc.configs['flat/recommended-typescript'],
  prettierSkipFormatting,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    rules: {
      // Nx rules
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],

      // Vue rules
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'error',
      'vue/require-prop-types': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/max-attributes-per-line': 'error',

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',

      // JSDoc rules
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSEnumDeclaration',
            'TSPropertySignature',
            'TSModuleDeclaration VariableDeclaration',
            'VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
          ],
        },
      ],
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/require-description': 'warn',
      'jsdoc/require-description-complete-sentence': 'error',

      // General rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      curly: 'error',
    },
  },
  {
    files: ['**/*.vue'],
    plugins: {
      headers,
    },
    rules: {
      'headers/header-format': [
        'error',
        {
          source: 'file',
          path: join(__dirname, 'COPYRIGHT'),
          trailingNewlines: 2,
          enableVueSupport: true,
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,js}'],
    plugins: {
      headers,
    },
    rules: {
      'headers/header-format': [
        'error',
        {
          source: 'file',
          path: join(__dirname, 'COPYRIGHT'),
          blockPrefix: '\n',
          trailingNewlines: 2,
        },
      ],
    },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**',
      '**/*.config.*',
      '**/*.config.*',
    ],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'headers/header-format': 'off',
    },
  }
);
