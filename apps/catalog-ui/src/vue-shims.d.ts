declare module '*.vue' {
  import type { defineComponent } from 'vue';
  /**
   * This module declaration allows TypeScript to understand
   * imports of `.vue` files and provides type safety
   * when working with Vue components in TypeScript.
   */
  const component: ReturnType<typeof defineComponent>;
  export default component;
}
