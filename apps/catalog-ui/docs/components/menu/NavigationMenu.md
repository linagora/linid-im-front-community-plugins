# **NavigationMenu 🧭**

The **NavigationMenu** component provides a tab-based navigation system for module pages in LinID.
It leverages Quasar's `QTabs` and `QRouteTab` to enable seamless navigation between different views.

---

## **🎯 Purpose**

- Offers a consistent tab navigation interface across modules
- Allows users to switch between different sections or pages
- Integrates with Vue Router for dynamic routing
- Provides customizable UI styling through the design system
- Automatically synchronizes with route changes

---

## **⚙️ Props**

| Prop          | Type                   | Required | Default | Description                                |
| ------------- | ---------------------- | -------- | ------- | ------------------------------------------ |
| `items`       | `NavigationMenuItem[]` | Yes      | -       | List of navigation items (id, label, path) |
| `uiNamespace` | `string`               | Yes      | -       | UI design namespace for custom styling     |

### NavigationMenuItem Interface

```typescript
export interface NavigationMenuItem {
  /** Unique identifier of the navigation item. */
  id: string;
  /** Label of the navigation item. */
  label: string;
  /** Path/route of the navigation item. */
  path: string;
}
```

---

## **📤 Events**

| Event               | Payload              | Description                                                      |
| ------------------- | -------------------- | ---------------------------------------------------------------- |
| `update:activeItem` | `NavigationMenuItem` | Emitted when the route changes to match a navigation item's path |

**Important:** This event is triggered by route changes, not user clicks. It emits the full item object when the current route matches one of the navigation items.

---

## **🎨 UI Customization**

The component uses the LinID design system through `useUiDesign()`. You can customize:

- **Tabs container**: `{uiNamespace}.navigation-menu` → applies to `q-tabs`
- **Individual routes**: `{uiNamespace}.navigation-menu.route-{itemId}` → applies to each `q-route-tab`

Example:

```typescript
// For uiNamespace = 'header'
// Tabs: ui('header.navigation-menu', 'q-tabs')
// Route 1: ui('header.navigation-menu.route-1', 'q-route-tab')
// Route 2: ui('header.navigation-menu.route-2', 'q-route-tab')
```

---

## **✅ Advantages**

- **Consistency:** Uniform navigation experience across modules
- **Type-safe:** Full TypeScript support with defined interfaces
- **Reactive:** Automatically responds to route changes
- **Route-driven:** Active tab is determined by the current route, following Quasar best practices
- **Framework-friendly:** Built for Vue 3 and Quasar, integrates seamlessly with Vue Router
- **Customizable:** Supports UI design system for consistent styling
- **Test-friendly:** Includes `data-cy` attributes for E2E testing

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import NavigationMenu from '@/components/menu/NavigationMenu.vue';
import type { NavigationMenuItem } from '@linagora/linid-im-front-corelib';

const navigationItems: NavigationMenuItem[] = [
  { id: '1', label: 'Home', path: '/home' },
  { id: '2', label: 'Users', path: '/users' },
  { id: '3', label: 'Settings', path: '/settings' },
];

const handleItemChange = (item: NavigationMenuItem) => {
  console.log('Selected item:', item);
  // item contains: { id, label, path }
};
</script>

<template>
  <NavigationMenu
    :items="navigationItems"
    ui-namespace="header"
    @update:active-item="handleItemChange"
  />
</template>
```

---

## **📌 Notes**

- **No v-model needed:** The component does not use `v-model` as the active state is managed by Vue Router
- **Best practice:** Follows Quasar's recommendation to not use `v-model` with `QRouteTab` components
- **Route synchronization:** The active tab automatically updates when the route changes
- **Event emission:** `update:activeItem` is emitted when the route path matches a navigation item, with the full `NavigationMenuItem` object
- **No emission for unmatched routes:** If the route doesn't match any item in the list, no event is emitted
- **Event timing:** The event is emitted immediately on mount (with `immediate: true`) and on every route change
- **Exact matching:** All route tabs use `:exact="true"` for precise route matching
- **Template coverage:** The template section is ignored from code coverage (`v8 ignore`) as it contains only presentation logic
- **Selection context:** Ideal for module-level navigation; combine with layout components for full page structure

---

## **🧪 Testing**

The component includes `data-cy` attributes for Cypress testing:

- Main container: `data-cy="navigationMenu"`
- Individual tabs: `data-cy="item_{itemId}"`

---

## **🏗️ Architecture**

The component uses Vue Router's `useRoute()` composable and watches `route.path` to:

1. Detect route changes automatically
2. Find the matching navigation item
3. Emit the `update:activeItem` event with the full item object
4. Let Quasar's `QRouteTab` handle the active styling based on the route

This architecture ensures the navigation menu stays in sync with the application's routing state.
