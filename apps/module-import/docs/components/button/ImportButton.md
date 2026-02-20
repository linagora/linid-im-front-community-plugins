# **ImportButton**

The **ImportButton** component is a reusable action button that navigates to a module’s import page.

It is designed to be integrated into list pages (e.g., entity listing pages) to provide a consistent entry point for bulk import workflows.

---

## **Purpose**

* Provides a standardized button to access the import page of a module
* Automatically resolves the correct route from module configuration
* Fully integrated with LinID design system
* Scoped i18n support
* Minimal logic and highly reusable
* Test-friendly (`data-cy` support)

---

## **Props**

| Prop         | Type     | Required | Description                                                               |
| ------------ | -------- | -------- | ------------------------------------------------------------------------- |
| `instanceId` | `string` | Yes      | Module instance identifier used for routing, UI namespace, and i18n scope |

### ImportButtonProps Interface

```ts
export interface ImportButtonProps {
  instanceId: string;
}
```

---

## **Behavior**

When clicked, the button:

1. Retrieves the module configuration via `getModuleHostConfiguration`
2. Reads the `basePath` property
3. Navigates to the import page using `vue-router`

```ts
router.push(moduleConfig.basePath);
```

The routing target is fully dynamic and depends on the module’s configuration.

---

## **Module Configuration Requirement**

The component relies on `ModuleImportOptions`:

```ts
getModuleHostConfiguration<ModuleImportOptions>(props.instanceId)
```

Expected configuration:

| Property   | Type     | Description                                  |
| ---------- | -------- | -------------------------------------------- |
| `basePath` | `string` | Route path of the module’s import entry page |

Example:

```json
{
  "basePath": "/users/import"
}
```

---

## **UI Customization**

The component integrates with the LinID design system using:

```
${instanceId}.ImportButton
```

Customization applies to the underlying `q-btn`.

### Example UI configuration

```json
{
  "moduleUsers": {
    "ImportButton": {
      "q-btn": {
        "color": "primary",
        "icon": "upload",
        "flat": false
      }
    }
  }
}
```

The `ui()` hook resolves props dynamically:

```ts
ui<LinidQBtnProps>(`${props.instanceId}.ImportButton`, 'q-btn');
```

---

## **Internationalization**

Scoped i18n is used:

```
${instanceId}.ImportButton
```

### Required translation key

```json
{
  "ImportButton": {
    "label": "Import"
  }
}
```

Usage in template:

```vue
:label="t('label')"
```

---

## **Template Structure**

```vue
<q-btn
  v-bind="uiProps"
  :label="t('label')"
  class="import-button"
  data-cy="button_import"
  @click="goToImport"
/>
```

### Notes

* `uiProps` → injected design-system properties
* `data-cy="button_import"` → Cypress testing hook
* No additional slots or complexity

---

## **Advantages**

* **Reusable:** Works for any module with an import page
* **Config-driven:** Route is resolved dynamically
* **Consistent UX:** Unified entry point across modules
* **Design-system compliant**
* **Scoped i18n**
* **Minimal logic footprint**
* **Testable**

---

## **Usage Example**

```vue
<script setup lang="ts">
import ImportButton from '@/components/button/ImportButton.vue';
</script>

<template>
  <ImportButton instance-id="users" />
</template>
```

---

## **Testing**

The component exposes a Cypress selector:

```ts
cy.get('[data-cy="button_import"]').click();
```

Expected behavior:

* Navigates to the configured `basePath`
* No intermediate logic or API call

---

## **Architecture**

The component follows a simple responsibility pattern:

1. **Props in:** Receives `instanceId`
2. **Configuration resolution:** Reads module configuration
3. **UI resolution:** Applies design-system props
4. **User interaction:** Click event
5. **Routing:** Navigates to import page

There is no state management, no watchers, and no side effects beyond routing.

---

## **CSS Class**

* `.import-button` — can be targeted for additional styling beyond the design system

---

## **Summary**

`ImportButton` is a lightweight, configuration-driven navigation component that standardizes access to module import workflows while remaining fully customizable and testable.
