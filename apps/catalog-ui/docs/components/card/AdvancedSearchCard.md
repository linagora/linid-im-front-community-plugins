# **AdvancedSearchCard**

The **AdvancedSearchCard** component provides a reusable filter interface with two sections: default filters (always visible) and advanced filters (expandable).
It dynamically renders filter fields based on `LinidAttributeConfiguration` definitions and supports two-way binding with the parent component.

---

## **Purpose**

- Offers a consistent filtering interface for entity lists and tables
- Separates commonly used filters from advanced filters for better UX
- Dynamically renders appropriate input fields based on attribute configuration
- Provides two-way binding for filter values through v-model pattern
- Integrates with the LinID design system for consistent styling
- Supports smooth expand/collapse animations for the advanced section

---

## **Props**

| Prop                  | Type                            | Required | Default | Description                                       |
| --------------------- | ------------------------------- | -------- | ------- | ------------------------------------------------- |
| `uiNamespace`         | `string`                        | Yes      | -       | UI design namespace for custom styling            |
| `i18nScope`           | `string`                        | No       | -       | i18n scope for translations                       |
| `instanceId`          | `string`                        | Yes      | -       | Instance identifier for scoped translations       |
| `fields`              | `LinidAttributeConfiguration[]` | Yes      | -       | List of field definitions available for filtering |
| `defaultFieldsNames`  | `string[]`                      | Yes      | -       | Field names to display in the default section     |
| `advancedFieldsNames` | `string[]`                      | Yes      | -       | Field names to display in the advanced section    |
| `filters`             | `Record<string, unknown>`       | Yes      | -       | Current filter values                             |

### AdvancedSearchCardProps Interface

```typescript
export interface AdvancedSearchCardProps extends CommonComponentProps {
  instanceId: string;
  fields: LinidAttributeConfiguration[];
  defaultFieldsNames: string[];
  advancedFieldsNames: string[];
  filters: Record<string, unknown>;
}
```

---

## **Events**

| Event            | Payload                   | Description                           |
| ---------------- | ------------------------- | ------------------------------------- |
| `update:filters` | `Record<string, unknown>` | Emitted when any filter value changes |

**Important:** The component emits the entire filters object whenever any field changes. The parent component should handle merging or replacing filters as needed.

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()`. You can customize:

- **Card container**: `{uiNamespace}.advanced-search-card` → applies to `q-card`
- **Card icon**: `{uiNamespace}.advanced-search-card` → applies to `q-icon`
- **Toggle button**: `{uiNamespace}.advanced-search-card.toggle-button` → applies to `q-btn`
- **Default filters fields**: `{uiNamespace}.advanced-search-card.default-filters.fields.{fieldName}` → applies to field components
- **Advanced filters fields**: `{uiNamespace}.advanced-search-card.advanced-filters.fields.{fieldName}` → applies to field components

Here is a sample JSON configuration for the design system:

```json
{
  "moduleUsers": {
    "users-page": {
      "advanced-search-card": {
        "q-card": {
          "flat": true,
          "bordered": true
        },
        "q-icon": {
          "name": "search",
          "color": "primary"
        },
        "toggle-button": {
          "q-btn": {
            "flat": true,
            "color": "primary"
          }
        },
        "default-filters": {
          "fields": {
            "email": {
              "q-input": {
                "dense": true,
                "outlined": true
              }
            }
          }
        },
        "advanced-filters": {
          "fields": {
            "age": {
              "q-input": {
                "dense": true,
                "outlined": true
              }
            }
          }
        }
      }
    }
  }
}
```

---

## **Internationalization**

The component uses scoped i18n with the following translation keys:

- `{i18nScope}.AdvancedSearchCard.title` - Title displayed in the card header
- `{i18nScope}.AdvancedSearchCard.moreFilters` - Label for the expand button
- `{i18nScope}.AdvancedSearchCard.lessFilters` - Label for the collapse button
- `{i18nScope}.AdvancedSearchCard.fields.{FIELD_NAME}.label` - Label for each filter field
- `{i18nScope}.AdvancedSearchCard.fields.{FIELD_NAME}.hint` - Helper text for each filter field
- `{i18nScope}.AdvancedSearchCard.fields.{FIELD_NAME}.prefix` - Input prefix for each filter field
- `{i18nScope}.AdvancedSearchCard.fields.{FIELD_NAME}.suffix` - Input suffix for each filter field
- `{i18nScope}.AdvancedSearchCard.fields.{FIELD_NAME}.close` - Label for the date picker's close button when the field is of type Date
- `{i18nScope}.AdvancedSearchCard.fields.{FIELD_NAME}.validation.dynamicList.missingRoute` - Validation message when a Dynamic List field is missing its data route
- `{i18nScope}.AdvancedSearchCard.fields.{FIELD_NAME}.validation.dynamicList.fetchError` - Validation message when fetching options for a Dynamic List field fails

Example:

```json
{
  "moduleUsers.UsersPage.AdvancedSearchCard": {
    "title": "Search filters",
    "moreFilters": "More filters",
    "lessFilters": "Less filters",
    "fields": {
      "email": {
        "label": "Email Address",
        "hint": "Enter a valid email address",
        "prefix": "",
        "suffix": ""
      },
      "age": {
        "label": "Age",
        "hint": "Enter the user's age",
        "prefix": "",
        "suffix": "years"
      }
    }
  }
}
```

---

## **Advantages**

- **Consistency:** Uniform filtering interface across modules
- **Type-safe:** Full TypeScript support with defined interfaces
- **Dynamic:** Automatically renders appropriate input types based on field configuration
- **Two-way binding:** Uses v-model pattern for seamless integration
- **Customizable:** Supports UI design system for consistent styling
- **Animated:** Smooth expand/collapse transitions for advanced section
- **i18n ready:** Fully internationalized with scoped translations
- **Test-friendly:** Includes `data-cy` attributes for E2E testing
- **Lazy loading:** Field components are loaded asynchronously using `loadAsyncComponent` for better performance
- **Smart validation:** All filter fields (default and advanced) automatically ignore validation rules since they're used for searching, not data entry

---

## **Usage Example**

### Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import AdvancedSearchCard from '@/components/card/AdvancedSearchCard.vue';
import type { LinidAttributeConfiguration } from '@linagora/linid-im-front-corelib';

const fields: LinidAttributeConfiguration[] = [
  { name: 'firstName', type: 'String', required: false, hasValidations: false, input: 'Text', inputSettings: {} },
  { name: 'lastName', type: 'String', required: false, hasValidations: false, input: 'Text', inputSettings: {} },
  { name: 'email', type: 'String', required: false, hasValidations: false, input: 'Text', inputSettings: {} },
  { name: 'isActive', type: 'Boolean', required: false, hasValidations: false, input: 'Boolean', inputSettings: {} },
  { name: 'createdAt', type: 'Date', required: false, hasValidations: false, input: 'Date', inputSettings: {} },
  { name: 'age', type: 'Integer', required: false, hasValidations: false, input: 'Number', inputSettings: {} },
];

const defaultFieldsNames = ['firstName', 'lastName', 'email'];
const advancedFieldsNames = ['isActive', 'createdAt', 'age'];

const filters = ref<Record<string, unknown>>({});

function onFiltersChange(newFilters: Record<string, unknown>) {
  filters.value = newFilters;
  fetchUsers(newFilters);
}
</script>

<template>
  <AdvancedSearchCard
    ui-namespace="users-page"
    i18n-scope="moduleUsers.UsersPage"
    instance-id="users"
    :fields="fields"
    :default-fields-names="defaultFieldsNames"
    :advanced-fields-names="advancedFieldsNames"
    :filters="filters"
    @update:filters="onFiltersChange"
  />
</template>
```

### With v-model

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import AdvancedSearchCard from '@/components/card/AdvancedSearchCard.vue';
import type { LinidAttributeConfiguration } from '@linagora/linid-im-front-corelib';

const fields: LinidAttributeConfiguration[] = [
  /* ... */
];
const defaultFieldsNames = ['firstName', 'lastName'];
const advancedFieldsNames = ['email', 'isActive'];

const filters = ref<Record<string, unknown>>({});

watch(
  filters,
  (newFilters) => {
    fetchUsers(newFilters);
  },
  { deep: true }
);
</script>

<template>
  <AdvancedSearchCard
    ui-namespace="users-page"
    i18n-scope="moduleUsers.UsersPage"
    instance-id="users"
    :fields="fields"
    :default-fields-names="defaultFieldsNames"
    :advanced-fields-names="advancedFieldsNames"
    v-model:filters="filters"
  />
</template>
```

---

## **Notes**

- **Field resolution:** Fields are matched by name from the `fields` array. If a field name in `defaultFieldsNames` or `advancedFieldsNames` doesn't exist in `fields`, it will be silently skipped
- **Empty advanced section:** If `advancedFieldsNames` is empty, the toggle button is not displayed
- **Lazy loading:** The `EntityAttributeField` component is loaded using `loadAsyncComponent('catalogUI/EntityAttributeField')` to improve initial load time
- **Validation rules:** All filter fields (both default and advanced) automatically ignore validation rules because the prop `:ignore-rules="true"` is passed to each field component. This ensures that no validation is performed on filter fields, since they are used for searching, not data entry
- **Two-way binding:** The component maintains a local copy of filters and syncs with the parent through props and events
- **External changes:** The component watches for external changes to the `filters` prop and updates its local state accordingly
- **UI namespacing:** Each field has its own UI namespace for granular styling control
- **Template coverage:** The template section contains only presentation logic

---

## **Testing**

The component includes `data-cy` attributes for Cypress testing:

- Main container: `data-cy="advanced-search-card"`
- Toggle button: `data-cy="advanced-search-card--toggle-button"`
- Advanced section: `data-cy="advanced-search-card--advanced-section"`

Example test:

```typescript
cy.get('[data-cy="advanced-search-card--toggle-button"]').click();
cy.get('[data-cy="advanced-search-card--advanced-section"]').should('be.visible');

cy.get('[data-cy="advanced-search-card"] input[name="firstName"]').type('John');
```

---

## **Architecture**

The component follows a reactive data-flow architecture:

1. **Props in:** Receives field definitions, field assignments, and current filter values
2. **Local state:** Maintains local copy of filters and expanded state
3. **Computed properties:** Filters field definitions based on `defaultFieldsNames` and `advancedFieldsNames`
4. **Field rendering:** Dynamically renders `EntityAttributeField` components based on configuration
5. **User interaction:** Captures filter changes from field components
6. **Events out:** Emits `update:filters` with the updated filters object
7. **Parent responsibility:** The parent handles API calls and data fetching

This architecture ensures:

- **Separation of concerns:** Filter UI is separated from data fetching logic
- **Reusability:** The component can be used with any entity type
- **Performance:** Lazy loading of field components and computed properties for minimal re-renders
- **Testability:** Both the component and parent logic can be tested independently
- **Flexibility:** Field configuration is fully dynamic based on entity metadata

---

## **CSS Classes**

The component applies the following CSS classes for styling customization:

- `.advanced-search-card` - Main card container
- `.advanced-search-card--title` - Title text in header
- `.advanced-search-card--default-filters` - Default filters section
- `.advanced-search-card--advanced-filters` - Advanced filters section

These classes can be targeted in your global or scoped styles for additional customization beyond the design system.

---

## **Field Types Support**

The component supports all field types defined in `LinidAttributeConfiguration`:

| Input Type | Component Rendered            | Description           |
| ---------- | ----------------------------- | --------------------- |
| `Text`     | `EntityAttributeTextField`    | Text input field      |
| `Number`   | `EntityAttributeNumberField`  | Numeric input field   |
| `Boolean`  | `EntityAttributeBooleanField` | Checkbox/toggle field |
| `Date`     | `EntityAttributeDateField`    | Date picker field     |
| `List`     | `EntityAttributeListField`    | Dropdown select field |

The `EntityAttributeField` component automatically delegates to the appropriate specialized field component based on the `input` property in the field definition.
