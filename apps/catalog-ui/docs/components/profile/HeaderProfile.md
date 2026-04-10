# **HeaderProfile**

The **HeaderProfile** component displays the authenticated user's profile information in the application header.
It renders a button showing the user's name and, on click, opens a dropdown menu with the full name and email address retrieved from the LinID user store.

---

## **Purpose**

- Displays the authenticated user's identity in the header
- Provides quick access to profile information (name and email) via a dropdown menu
- Integrates with the LinID user store to reactively reflect the current user state
- Integrates with the LinID design system for consistent styling
- Extensible via `LinidZoneRenderer`: plugins can inject additional menu items into the profile dropdown

---

## **Props**

| Prop          | Type     | Required | Default | Description                            |
| ------------- | -------- | -------- | ------- | -------------------------------------- |
| `uiNamespace` | `string` | Yes      | -       | UI design namespace for custom styling |
| `i18nScope`   | `string` | No       | -       | i18n scope for translations            |

### HeaderProfileProps Interface

```typescript
export interface HeaderProfileProps extends CommonComponentProps {}
```

---

## **Events**

This component emits no events.

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()`. The local namespace is built as `{uiNamespace}.header-profile`. You can customize:

- **Button**: `{uiNamespace}.header-profile` → applies to `q-btn`
- **Avatar section**: `{uiNamespace}.header-profile` → applies to `q-item-section` (icon side)
- **Email label**: `{uiNamespace}.header-profile` → applies to `q-item-label` (caption)

Here is a sample JSON configuration for the design system:

```json
{
  "myModule": {
    "header-profile": {
      "q-btn": {
        "flat": true,
        "round": false,
        "color": "white"
      },
      "q-item-section": {
        "avatar": true
      },
      "q-item-label": {
        "caption": true
      }
    }
  }
}
```

---

## **Advantages**

- **Reactive:** Automatically reflects user state changes via Pinia store
- **Consistent:** Integrates with the LinID design system for uniform header styling
- **Minimal:** No events, no complex state — read-only display component
- **Type-safe:** Full TypeScript support via `CommonComponentProps`
- **Test-friendly:** Includes `data-cy` attributes for E2E testing
- **Federation-ready:** Exposed as a Module Federation remote for consumption by host applications

---

## **Usage Example**

### Direct Import

```vue
<script setup lang="ts">
import HeaderProfile from '@/components/profile/HeaderProfile.vue';
</script>

<template>
  <HeaderProfile ui-namespace="base-layout.header" />
</template>
```

### Via Module Federation

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';

const HeaderProfile = loadAsyncComponent('catalogUI/HeaderProfile');
</script>

<template>
  <HeaderProfile ui-namespace="base-layout.header" />
</template>
```

---

## **Module Federation**

This component is exposed as a Module Federation remote entry:

| Key          | Value                                      |
| ------------ | ------------------------------------------ |
| Remote name  | `catalogUI`                                |
| Exposed path | `./HeaderProfile`                          |
| Source file  | `src/components/profile/HeaderProfile.vue` |

The host application must declare `catalogUI` as a remote in its Module Federation configuration and share the following singletons: `vue`, `quasar`, `pinia`, `@linagora/linid-im-front-corelib`.

---

## **Testing**

The component includes `data-cy` attributes for Cypress testing:

- Profile button: `data-cy="header_profile_button"`
- Dropdown menu: `data-cy="header_profile_menu"`
- Profile info item: `data-cy="header_profile_info"`
- User full name: `data-cy="header_profile_name"`
- User email: `data-cy="header_profile_email"`

Example test:

```typescript
cy.get('[data-cy="header_profile_button"]').click();
cy.get('[data-cy="header_profile_menu"]').should('be.visible');
cy.get('[data-cy="header_profile_name"]').should('contain.text', 'John Doe');
cy.get('[data-cy="header_profile_email"]').should('contain.text', 'john.doe@example.com');
```

---

## **Notes**

- The component reads `fullName` and `email` from the `useLinidUserStore()` Pinia store — these values must be populated before the component is rendered (typically after OIDC authentication)
- The component has no fallback display when the user is not authenticated; the parent layout is responsible for rendering it only when a user session exists
- The template is excluded from v8 coverage (`<!-- v8 ignore start/stop -->`) as it contains only presentation logic
- **UI namespacing:** The local namespace `{uiNamespace}.header-profile` is derived from the prop, allowing each host application to style the component independently

---

## **Architecture**

The component follows a simple reactive read pattern:

1. **Props in:** Receives `uiNamespace` to build its design system namespace
2. **Store read:** Reads `fullName` and `email` from `useLinidUserStore()` as computed properties
3. **UI props:** Resolves Quasar component props via `useUiDesign()` for `q-btn`, `q-item-section`, and `q-item-label`
4. **Render:** Displays a `q-btn` with the user's name; on click, a `q-menu` shows the full profile info
5. **Extension point:** A `LinidZoneRenderer` with zone `{uiNamespace}.header-profile.menu-items` allows plugins to inject additional menu items (e.g. logout, settings)

This architecture ensures:

- **Separation of concerns:** User data management is handled by the store, not the component
- **Reusability:** The component can be dropped into any layout that provides the correct `uiNamespace`
- **Reactivity:** Any update to the user store is automatically reflected without additional wiring
