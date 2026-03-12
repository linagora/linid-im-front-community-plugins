# **EntityAttributeDynamicListField 📋**

The **EntityAttributeDynamicListField** component is a specialized attribute field designed to handle **dynamic list-based attributes** within an entity.

It relies on Quasar's `QSelect` component with **lazy loading** (dynamic loading on virtual scroll) and integrates with the LinID design system and scoped i18n to provide a fully customizable, localized, and reactive select input for structured `{ label, value }` elements fetched from a backend endpoint. The dropdown displays **labels** while the entity stores only the **value**.

Unlike `EntityAttributeListField`, which uses a static predefined list, this component fetches options **page by page** from a DLVP (Dynamic List Validation Plugin) route endpoint, loading more items as the user scrolls through the dropdown.

---

## **🎯 Purpose**

- Renders a dynamic list attribute using a dropdown/select field with lazy loading
- Fetches structured `{ label, value }` elements from a backend route endpoint (DLVP) using pagination
- Displays **labels** in the dropdown while storing only **values** in the entity
- Loads additional pages on virtual scroll (infinite scrolling pattern)
- Resolves pre-filled entity values to their corresponding label via Quasar's `map-options`
- Synchronizes the selected value with the entity model
- Emits normalized entity updates on user selection
- Supports scoped translations for labels, hints, prefixes, and suffixes
- Enables UI customization via the design system
- Displays loading and error states during data fetching

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldDynamicListSettings`.

| Prop          | Type                                                    | Required | Description                                                                  |
| ------------- | ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                                | Yes      | Identifier used for contextual data                                          |
| `i18nScope`   | `string`                                                | Yes      | I18n scope for localizing the component                                      |
| `uiNamespace` | `string`                                                | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldDynamicListSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                               | Yes      | Entity object containing the dynamic list attribute value                    |
| `ignoreRules` | `boolean`                                               | No       | Indicates whether to bypass validation rules for this field (default: false) |

### AttributeFieldProps Interface

```ts
export interface AttributeFieldProps<T = Record<string, unknown>> extends CommonComponentProps {
  /** Identifier of the instance used for contextual data. */
  instanceId: string;

  /** Attribute configuration describing how the field should be rendered. */
  definition: LinidAttributeConfiguration<T>;

  /** Entity object holding the attribute value. */
  entity: Record<string, unknown>;

  /**
   * Indicates whether to bypass validation rules for this field.
   * When set to true, validation rules will not be applied.
   * @default false
   */
  ignoreRules?: boolean;
}
```

### DynamicListElement

```ts
export interface DynamicListElement {
  /** The display label shown in the dropdown. */
  label: string;
  /** The stored value used for entity binding. */
  value: string;
}
```

### FieldDynamicListSettings

```ts
export interface FieldDynamicListSettings extends FieldSettings {
  /**
   * The backend route path to fetch the list values (e.g. "/api/types").
   * Exposed by the DLVP route plugin.
   */
  route: string;

  /**
   * Number of items to fetch per page.
   * @default 20
   */
  size?: number;

  /**
   * Controls uniqueness validation for this field.
   * - When `true`: uniqueness validation is enabled but no reference values are provided yet.
   *   The parent component or page **must** replace this boolean with the actual array of
   *   existing values against which uniqueness is checked before passing the definition
   *   to this component.
   * - When `false` or omitted: no uniqueness validation is performed.
   */
  unique?: boolean;

  /** Indicates whether to bypass validation rules for this field. */
  ignoreRules?: boolean;
}
```

---

## **📤 Events**

| Event           | Payload                   | Description                                                       |
| --------------- | ------------------------- | ----------------------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | Emitted when the selected value changes and the entity is updated |

### Event Semantics

- Emits the **entire updated entity object**
- Preserves immutability by creating a new entity reference
- Ensures the parent component remains the single source of truth

---

## **🌍 Internationalization (i18n)**

The component uses `useScopedI18n` to resolve translations for multiple UI text elements.

### Translation Scope

```ts
`${i18nScope}.fields.${definition.name}`;
```

### Supported Translation Keys

| Key      | Usage in UI  |
| -------- | ------------ |
| `label`  | Select label |
| `hint`   | Helper text  |
| `prefix` | Input prefix |
| `suffix` | Input suffix |

### Error Translation Keys

| Key                                   | Usage                                    |
| ------------------------------------- | ---------------------------------------- |
| `validation.dynamicList.missingRoute` | Displayed when `route` is not configured |
| `validation.dynamicList.fetchError`   | Displayed when a fetch request fails     |

### Fallback Behavior

```ts
translateOrDefault('', 'label');
```

- Returns the translated value if the key exists
- Falls back to the provided default value if missing
- Prevents displaying raw translation keys

---

## **🎨 UI Customization**

UI customization is handled via the LinID design system using `useUiDesign()`.

### Namespace Resolution

```ts
`${uiNamespace}.${definition.name}`;
```

### Applied Component

- Quasar component: `q-select`
- Props type: `LinidQSelectProps`

Example:

```ts
uiNamespace = 'entity-editor'

// Final UI namespace
entity-editor.type → q-select
```

This allows full control over appearance, validation rules, and behavior per attribute.

---

## **✅ Validation**

The component implements automatic validation based on the attribute's `inputSettings`, the `definition.required` property, and the `definition.hasValidations` property.

### Validation Rules

Validation rules are generated automatically using `useQuasarRules`:

```ts
const rules = computed(() => (!props.ignoreRules && !props.definition.inputSettings?.ignoreRules ? useQuasarRules(props.instanceId, props.definition, ['unique']) : []));
```

### Validation Execution Order

The validation rules are executed in a specific order to ensure proper validation flow:

1. **Required validation** (if applicable)
   - Depends on the `definition.required` property
   - If `definition.required` is `true`, this validation is automatically added as the **first rule** in the validation chain
   - Ensures that a value is selected before proceeding to other validations

2. **Specific validation rules** (in order)
   - The rules specified in the `useQuasarRules` parameters (`['unique']` for dynamic list fields)
   - These rules are executed **in the order specified** in the array
   - Execute **after** the required validation (if present)

3. **Backend API validations** (if applicable)
   - Depends on the `definition.hasValidations` property
   - If `definition.hasValidations` is `true`, backend validation rules are added
   - These validations are executed **last**, after all client-side validations pass
   - Used for server-side validation logic (e.g., checking that the value exists in the dynamic list)

### Supported Validation Types

| Setting       | Description                                                                          | Example             |
| ------------- | ------------------------------------------------------------------------------------ | ------------------- |
| `required`    | Marks the field as mandatory. Setting comes from the `definition.required` property. | `required: true`    |
| `unique`      | Enforces that the selected value is unique among a list of existing values           | `unique: true`      |
| `ignoreRules` | Bypass validation when set to `true`                                                 | `ignoreRules: true` |

### Unique Rule — Parent Responsibility

The `unique` setting in `FieldDynamicListSettings` follows a **two-phase configuration** pattern:

**Phase 1 — Static configuration (schema / definition file)**

In the static attribute definition, `unique` is declared as a boolean to signal that uniqueness must be enforced:

```ts
definition.inputSettings = {
  route: '/api/types',
  unique: true, // signals intent, not yet the actual values
};
```

**Phase 2 — Runtime injection (parent component or page)**

Any Vue component or page that uses `EntityAttributeDynamicListField` directly, or uses it indirectly via `EntityAttributeField`, **must replace** `unique: true` with the actual array of existing values against which uniqueness should be checked:

```ts
// In the parent component, before passing the definition to the field:
const enrichedDefinition = {
  ...definition,
  inputSettings: {
    ...definition.inputSettings,
    unique: existingEntities.map((e) => e[definition.name]),
  },
};
```

- If `unique` remains `true` (boolean), `useQuasarRules` will receive no values to compare against and the validation will not work as intended
- The parent is responsible for knowing the context (e.g. the list of already-assigned values in a collection) and injecting the correct array
- When `unique` is `false` or `undefined` no uniqueness validation is performed

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` is `true`, no validation is performed
- Validation messages are automatically translated using the instance's i18n scope

---

## **🔁 Data Flow**

1. Initial value is resolved from:
   - `entity[definition.name]` (existing value string in entity)
   - `null` (fallback if no entity value exists)

2. On mount, the first page of `{ label, value }` elements is fetched from the backend
3. After the initial fetch, if the entity has a preset value not found in the loaded options, a placeholder entry `{ label: value, value: value }` is injected so that the field always displays something meaningful
4. User scrolls through the dropdown → next page is fetched and appended; if the real option matching the preset value is loaded, the placeholder is automatically removed
5. Quasar's `map-options` resolves the stored value string to its corresponding label for display
6. User selects an element from the dropdown → `emit-value` ensures only the `value` string is stored
7. `localValue` is updated via `v-model` (always a string)
8. `updateValue()` emits `update:entity` with a new entity object

```text
Backend API → fetchPage() → allOptions (DynamicListElement[]) → QSelect (displays labels)
QSelect → localValue (value string) → updateValue → update:entity
```

---

## **🧠 Internal State Management**

### Options Management (Lazy Loading)

```ts
const allOptions = ref<DynamicListElement[]>([]);
let currentPage = 0;
let hasMore = true;
```

- `allOptions`: Accumulates all fetched `{ label, value }` elements across pages
- `currentPage`: Tracks the next page to fetch (zero-based)
- `hasMore`: Set to `false` when the backend returns `last: true`

### Page Size Configuration

```ts
const pageSize = computed(() => props.definition.inputSettings?.size ?? 20);
```

- Uses the `size` property from `inputSettings` if provided
- Falls back to a default page size of 20

### Loading and Error States

```ts
const isLoading = ref(false);
const error = ref<string | null>(null);
```

- `isLoading`: `true` while a page fetch is in progress; shows a loading spinner in the `q-select`
- `error`: Set to a translated error message when a fetch fails or the route is missing; displayed via the `#no-option` slot

### Fetch Logic

The `route` is a computed property derived from `inputSettings` and validated in `onMounted`:

```ts
const route = computed(() => props.definition.inputSettings?.route);

onMounted(async () => {
  if (!route.value) {
    error.value = t('validation.dynamicList.missingRoute');
    return;
  }
  await fetchPage();
});
```

```ts
async function fetchPage() {
  if (!route.value || isLoading.value || !hasMore) {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const page = await getDynamicListPage(route.value, {
      page: currentPage,
      size: pageSize.value,
    });
    if (page.content.length > 0) {
      allOptions.value.push(...page.content);
    }
    hasMore = !page.last;
    currentPage++;
  } catch {
    error.value = t('validation.dynamicList.fetchError');
  } finally {
    isLoading.value = false;
  }
}
```

- The `route` is a **computed** property, validated **once** in `onMounted`
- Fetches are **guarded** against concurrent calls (`isLoading.value`) and exhausted data (`!hasMore`)
- `currentPage` and `hasMore` are plain `let` variables — they do not need reactivity since they are never used in the template
- Uses `push(...page.content)` to append in-place instead of creating a new array each time
- Skips the append when the page is empty to avoid unnecessary operations
- On failure, `error` is set to a user-facing translated message

### Preset Value Resolution

When editing an entity that already has a value stored, the corresponding option may not be in the first page of results. Two helper functions handle this:

```ts
function ensurePresetValueInOptions() {
  // After initial fetch, if localValue is not found in allOptions,
  // prepends a placeholder { label: value, value: value }
}

function removePlaceholderIfResolved() {
  // After each page fetch, if the real option has been loaded,
  // removes the placeholder to avoid duplicates
}
```

- `ensurePresetValueInOptions()`: Called once after the initial `fetchPage()` in `onMounted`. Prepends a placeholder entry if the entity's preset value is not found in the loaded options.
- `removePlaceholderIfResolved()`: Called after each successful `fetchPage()`. Detects and removes the placeholder when the real option (with its proper label) is loaded.

### Virtual Scroll Handler

```ts
function onVirtualScroll(payload: VirtualScrollPayload) {
  const lastIndex = allOptions.value.length - 1;
  if (payload.to < lastIndex) {
    return;
  }
  fetchPage();
}
```

- Triggered by Quasar's `@virtual-scroll` event on the `q-select`
- Fetches the next page only when the scroll position reaches the last loaded item
- Delegates loading and exhaustion guards to `fetchPage()` to avoid duplicating logic

### Selected Value Management

```ts
const localValue = ref(props.entity[props.definition.name] ?? null);
```

- Uses a local reactive reference to isolate UI interaction
- Stores the **value string** (not the full `{ label, value }` object), thanks to Quasar's `emit-value` prop
- Falls back to `null` if the entity has no existing value
- A `watch` on `() => props.entity[props.definition.name]` keeps `localValue` in sync when the parent updates the entity — it only triggers when the **specific attribute value** changes, not when other fields of the entity change
- Quasar's `map-options` resolves the stored value to its corresponding `{ label, value }` object for display

---

## **📡 Backend Integration**

### Dynamic List Service

The component uses a local service (`dynamicListService.ts`) to communicate with the backend:

```ts
import { getDynamicListPage } from '../../services/dynamicListService';
```

### Service API

```ts
export async function getDynamicListPage(route: string, pagination: Pagination): Promise<Page<DynamicListElement>> {
  const response = await getHttpClient().get<Page<DynamicListElement>>(route, {
    params: pagination,
  });
  return response.data;
}
```

### Backend Response Format (Spring Page)

The backend DLVP route plugin returns a standard Spring `Page<Map<String, String>>` response with structured elements:

```json
{
  "content": [
    { "label": "Type A", "value": "1" },
    { "label": "Type B", "value": "2" },
    { "label": "Type C", "value": "3" }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "number": 0,
  "size": 10,
  "last": false,
  "first": true,
  "numberOfElements": 3,
  "empty": false
}
```

Key fields used by the component:

| Field     | Usage                                                    |
| --------- | -------------------------------------------------------- |
| `content` | Array of `{ label, value }` elements appended to options |
| `last`    | When `true`, stops fetching additional pages             |

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeDynamicListField from '@/components/field/EntityAttributeDynamicListField.vue';

const entity = reactive({
  type: 'typeA',
});

const definition = {
  name: 'type',
  input: 'DynamicList',
  type: 'String',
  required: true,
  hasValidations: true,
  inputSettings: {
    route: '/api/types',
    size: 10,
    ignoreRules: false,
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeDynamicListField
    ui-namespace="entity-editor"
    instance-id="user-1"
    i18n-scope="user-editor"
    :definition="definition"
    :entity="entity"
    @update:entity="onUpdateEntity"
  />
</template>
```

---

## **✅ Advantages**

- **Lazy loading:** Fetches options on demand, avoiding large upfront data transfers
- **Infinite scrolling:** Seamless pagination via Quasar's virtual scroll
- **Loading and error states:** Visual feedback during data fetching
- **Focused responsibility:** Dedicated to dynamic list-based selection attributes
- **Immutable updates:** Avoids mutating the parent entity directly
- **Localized UI:** Supports multiple translatable UI elements
- **Highly customizable:** Fully integrated with the UI design system
- **Reusable:** Works across modules with different schemas
- **Framework-native:** Built using Vue 3 Composition API and Quasar standards

---

## **🧪 Testing Considerations**

- Verify initial selected value matches the entity state
- Assert `getDynamicListPage` is called on mount with `{ page: 0, size: configuredSize }`
- Test default page size (20) when `size` is not configured
- Verify options are populated with `{ label, value }` objects after a successful fetch
- Test error state when `route` is missing from `inputSettings`
- Test error state on fetch failure
- Verify fetching stops when the last page is reached
- Verify page number increments after each successful fetch
- Test that concurrent fetches are prevented (loading guard)
- Test virtual scroll triggers next page fetch when reaching the end
- Test virtual scroll does not fetch when not at the end of the list
- Test virtual scroll does not fetch when `hasMore` is `false`
- Verify a placeholder is added when the entity's preset value is not in the loaded options
- Verify no placeholder is added when the preset value is found in the options
- Verify no placeholder is added when the entity has no value
- Verify the placeholder is removed when the real option is loaded on a subsequent page
- Assert `update:entity` emission stores the `value` string (not the full object) on selection changes
- Verify `ignoreRules` prop bypasses validation rules
- Verify validation rules are applied when `ignoreRules` is `false`
- Verify that `localValue` is updated when `entity[definition.name]` changes
- Verify that `localValue` is **not** overwritten when only other entity attributes change

---

## **📌 Notes**

- The component assumes `definition.input === 'DynamicList'`
- Uses `FieldDynamicListSettings` type for `inputSettings`, which requires a `route` property
- The `route` property is **mandatory** in `FieldDynamicListSettings` — without it, the component displays an error
- Options are fetched lazily and accumulated across pages
- The `entity` prop is reactive: changes to `entity[definition.name]` are reflected in `localValue` via a selective `watch`
- Validation is handled internally using `useQuasarRules` with a `unique` rule and can be configured via `inputSettings`
- Missing translations safely fall back to default values
- Intended for use via `EntityAttributeField` dispatcher, not directly in most cases
- The backend endpoint must return a Spring `Page<Map<String, String>>` response with `{ label, value }` elements
- Works in conjunction with the DLVP (Dynamic List Validation Plugin) on the backend
- Quasar's `option-label`, `option-value`, `emit-value`, and `map-options` props handle the label/value mapping natively
- Pre-filled entity values are displayed immediately via a placeholder if not found in the initial page; the placeholder is replaced with the real option (including its proper label) when it is loaded via lazy scrolling

---

## **🏗️ Architecture Summary**

**EntityAttributeDynamicListField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Fetching `{ label, value }` elements lazily from a backend DLVP route endpoint
- Rendering the select dropdown with labels while storing values in the entity
- Managing local UI state (pagination, loading, error)
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
