# **EntityAttributeDynamicListField 📋**

The **EntityAttributeDynamicListField** component is a specialized attribute field designed to handle **dynamic list-based attributes** within an entity.

It relies on Quasar's `QSelect` component with **lazy loading** (dynamic loading on virtual scroll) and integrates with the LinID design system and scoped i18n to provide a fully customizable, localized, and reactive select input for structured `{ label, value }` elements fetched from a backend endpoint. The dropdown displays **labels** while the entity stores only the **value**.

The route itself is a **Nunjucks template** rendered against the edited entity, so the endpoint can depend on other attribute values (e.g. `/api/organizations/{{ entity.organizationId }}/units`). Options are reloaded automatically whenever the rendered route changes.

Unlike `EntityAttributeListField`, which uses a static predefined list, this component fetches options **page by page** from a DLVP (Dynamic List Validation Plugin) route endpoint, loading more items as the user scrolls through the dropdown.

---

## **🎯 Purpose**

- Renders a dynamic list attribute using a dropdown/select field with lazy loading
- Fetches structured `{ label, value }` elements from a backend route endpoint (DLVP) using pagination
- Renders the `route` as a Nunjucks template against the edited entity, and reloads the options whenever the rendered route changes
- Defers the first fetch of a templated route until the entity has been loaded, so a details page never requests a malformed URL
- Optionally maps elements of any paginated entity endpoint to options through the `optionLabel` and `optionValue` Nunjucks templates
- Displays **labels** in the dropdown while storing only **values** in the entity
- Loads additional pages on virtual scroll (infinite scrolling pattern)
- Resolves pre-filled entity values to their corresponding label via Quasar's `map-options`
- Synchronizes the selected value with the entity model
- Emits normalized entity updates on user selection
- Supports scoped translations for labels, hints, prefixes, and suffixes
- Enables UI customization via the design system
- Displays loading and error states during data fetching
- Supports disabling the field via `inputSettings.disable`

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
   * Exposed by the DLVP route plugin. Rendered as a Nunjucks template with the edited entity
   * exposed as `entity` (e.g. "/api/organizations/{{ entity.organizationId }}/units"), so the
   * options are reloaded whenever the entity values the route depends on change.
   */
  route: string;

  /**
   * Number of items to fetch per page.
   * @default 20
   */
  size?: number;

  /**
   * Nunjucks template rendered with each fetched element as context to build the option label.
   * Allows the field to consume any paginated entity endpoint (e.g. "{{ lastname }} {{ firstname }}").
   * When omitted, the element `label` property is used.
   */
  optionLabel?: string;

  /**
   * Nunjucks template rendered with each fetched element as context to build the option value
   * (e.g. "{{ id }}"). When omitted, the element `value` property is used.
   */
  optionValue?: string;

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

  /** When true, the select is rendered as non-interactive (disabled state). */
  disable?: boolean;
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

A templated route awaiting its entity is **not** an error state: no message is displayed while the field waits.

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
const rules = computed(() => (!props.ignoreRules && !props.definition.inputSettings?.ignoreRules ? useQuasarRules(props.instanceId, props.definition, ['unique'], localI18nScope) : []));
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

## **🧭 Nested Attributes**

The attribute `name` supports **dot notation** to target values located inside sub-objects of the entity (e.g. `extraParameters.login`):

- The initial value is read from the nested path (`getNestedValue` from corelib)
- Updates rewrite only the targeted nested property, preserving the rest of the entity structure (`setNestedValue` from corelib)
- Missing intermediate objects are created when updating; intermediate values that are not objects are replaced by objects
- The `update:entity` event still emits the **complete** updated entity object

---

## **🔁 Data Flow**

1. Initial value is resolved from:
   - the entity value at `definition.name` (existing value string in entity)
   - `null` (fallback if no entity value exists)

2. The `route` template is rendered against the entity; as soon as it resolves, the first page of `{ label, value }` elements is fetched from the backend
3. After the initial fetch, if the entity has a preset value not found in the loaded options, a placeholder entry `{ label: value, value: value }` is injected so that the field always displays something meaningful
4. User scrolls through the dropdown → next page is fetched and appended; if the real option matching the preset value is loaded, the placeholder is automatically removed
5. Quasar's `map-options` resolves the stored value string to its corresponding label for display
6. User selects an element from the dropdown → `emit-value` ensures only the `value` string is stored
7. `localValue` is updated via `v-model` (always a string)
8. `updateValue()` emits `update:entity` with a new entity object
9. If the updated entity changes a value the route template depends on, the rendered route changes and the options are discarded and refetched from page 0

```text
entity → route template → rendered route ─┬→ (unchanged) keep options
                                          └→ (changed) reload() → discard + refetch page 0

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
let loadedRoute: string | null = null;
let currentLoadId = 0;
```

- `allOptions`: Accumulates all fetched `{ label, value }` elements across pages
- `currentPage`: Tracks the next page to fetch (zero-based)
- `hasMore`: Set to `false` when the backend returns `last: true`
- `loadedRoute`: The route the current options were loaded from, `null` until the first load. It distinguishes the **first** load — where the entity's persisted value must be preserved — from a **later route change**, where the selection belongs to options that no longer apply.
- `currentLoadId`: Identifies the load in progress; incremented by every `reload()`. A request captures it when it starts and compares it when it settles, which is what makes a superseded response identifiable even when it targets the same URL as the current one.

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

### Route Resolution

The configured route is split into three computed properties:

```ts
const rawRoute = computed(() => props.definition.inputSettings?.route ?? '');

const isRouteResolved = computed(() => !rawRoute.value.includes('{{') || Object.keys(props.entity).length > 0);

const route = computed(() => renderString(rawRoute.value, { entity: props.entity }));
```

- `rawRoute`: the raw template configured in `inputSettings`, defaulting to an empty string when absent
- `isRouteResolved`: whether the template can safely be rendered. A details page mounts its form **before** it has loaded the entity, so a route templated on the entity would render to a malformed URL at that point (e.g. `/api/organizations//units`). Routes without a `{{` template never wait.
- `route`: the rendered route, with the edited entity exposed as `entity` in the Nunjucks context

### Fetch Trigger

Fetching is driven by a `watch` with `immediate: true`, so that the options follow the rendered route throughout the component lifetime instead of only at mount time:

```ts
watch(
  () => (isRouteResolved.value ? route.value : null),
  async (renderedRoute) => {
    if (renderedRoute === null) {
      return;
    }
    if (!renderedRoute) {
      error.value = t('validation.dynamicList.missingRoute');
      return;
    }
    await reload();
  },
  { immediate: true }
);
```

| Watched value       | Meaning                                  | Behavior                            |
| ------------------- | ---------------------------------------- | ----------------------------------- |
| `null`              | Templated route, entity not loaded yet   | Waits silently — no fetch, no error |
| `''` (empty string) | No `route` configured in `inputSettings` | Sets the `missingRoute` error       |
| A rendered route    | Route is usable                          | Triggers `reload()`                 |

- The watcher only fires when the **rendered** route changes — editing an entity attribute the route does not depend on does not cause a refetch
- `immediate: true` makes the initial fetch and subsequent reloads go through the same code path

### Selection Reset

```ts
function clearSelection() { ... }
```

- A value picked from one route does not belong to the next one: a unit chosen under `org-1` is not a unit of `org-2`. The selection is therefore dropped whenever the rendered route changes.
- `updateValue()` emits the usual `update:entity`, so the form stops carrying a value the field no longer offers instead of failing validation at submit time
- Because the selection is cleared **before** `fetchPage()`, `ensurePresetValueInOptions()` has nothing to re-inject — the new list never presents a stale value as one of its own options
- It is guarded by `loadedRoute !== null`, so the **first** load never clears anything: a details page mounts its form before the entity arrives, and the persisted value must survive that first render

Emitting outside of a user interaction follows the same pattern as `EntityAttributeListField`, whose `watch` on `options` drops a value its filtered list no longer offers. It is safe here because within one mount the `entity` prop only goes from empty to loaded once — pages fetch it from `onMounted` — so a route change can only come from an edit made in the form.

### Reload

```ts
async function reload() { ... }
```

- Discards the previously loaded options, which belong to the previous route and are no longer valid
- Resets the pagination cursor (`currentPage`, `hasMore`) so the new route starts at page 0
- Resets `isLoading` so that a fetch still in flight for the previous route does not block the new one
- Starts a **new load** by incrementing `currentLoadId`, which is what makes the requests it just unblocked identifiable as stale when they settle (see _Fetch Logic_)
- Re-runs `ensurePresetValueInOptions()` so a preset value absent from the new first page is still displayed

### Fetch Logic

```ts
async function fetchPage() { ... }
```

- **Stale response guard:** the load in effect when the request starts is captured in `loadId` and compared against `currentLoadId` **once**, right after the request settles. A response from a superseded load is discarded — its options belong to a list that is gone and must not pollute the current one, nor advance its pagination cursor, nor touch `error` or `isLoading`, which the newer load now owns.
- The guard is a **load id, not the route string**. `reload()` clears `isLoading` so that a request still in flight does not block the new load, which means two requests can legitimately overlap — and going `A → B → A` while the first request for `A` is in flight would leave two live requests for the _same_ URL. Comparing routes would accept both and append page 0 twice; comparing load ids accepts only the last one.
- The `try` block **only** awaits: turning the failure into an absent `page` rather than a control-flow branch is what allows a single guard. With a `catch` and a `finally`, the check has to be repeated on each of the three exit paths.
- `page?.content` is what tells a failure from a success: a body that is missing or malformed reports a fetch error rather than throwing outside the `try`. An **empty** `content` array is a success — the cursor advances and `hasMore` is updated.
- Fetches are **guarded** against concurrent calls (`isLoading.value`) and exhausted data (`!hasMore`)
- `currentPage`, `hasMore`, `loadedRoute` and `currentLoadId` are plain `let` variables — they do not need reactivity since they are never used in the template
- Uses `push(...page.content.map(toOption))` to append in-place instead of creating a new array each time
- Skips the append when the page is empty to avoid unnecessary operations

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

- `ensurePresetValueInOptions()`: Called by `reload()` after its `fetchPage()` — on mount and on every route change. Prepends a placeholder entry if the entity's preset value is not found in the loaded options.
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
const localValue = ref(getNestedValue(props.entity, props.definition.name) ?? null);
```

- Uses a local reactive reference to isolate UI interaction
- Stores the **value string** (not the full `{ label, value }` object), thanks to Quasar's `emit-value` prop
- Falls back to `null` if the entity has no existing value
- A `watch` on `() => getNestedValue(props.entity, props.definition.name)` keeps `localValue` in sync when the parent updates the entity — it only triggers when the **specific attribute value** changes, not when other fields of the entity change
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

### Templated Route Example

A route may depend on another attribute of the same entity. Here the list of units is scoped to the organization currently selected on the entity:

```ts
const entity = reactive({
  organizationId: 'org-1',
  unit: 'unit-a',
});

const definition = {
  name: 'unit',
  input: 'DynamicList',
  type: 'String',
  inputSettings: {
    route: '/api/organizations/{{ entity.organizationId }}/units',
    size: 10,
  },
};
```

- On mount, the field fetches `/api/organizations/org-1/units`
- When the user changes `organizationId` to `org-2`, the rendered route becomes `/api/organizations/org-2/units`, the loaded units are discarded and page 0 of the new route is fetched
- If the entity is still empty (details page loading), the field waits without fetching and without displaying an error

---

## **✅ Advantages**

- **Lazy loading:** Fetches options on demand, avoiding large upfront data transfers
- **Infinite scrolling:** Seamless pagination via Quasar's virtual scroll
- **Contextual routes:** The endpoint can depend on other entity attributes, keeping the options scoped to the current selection
- **Race-safe:** Stale responses from a previous route are discarded instead of corrupting the current state
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
- Verify a templated `route` is rendered against the entity before being fetched
- Verify a templated route is **not** fetched while the entity is empty, and that no error is displayed in that state
- Verify the fetch happens once the entity is loaded into the props
- Verify options are discarded and refetched from page 0 when an entity change alters the rendered route
- Verify **no** reload occurs when the entity changes outside of the values the route depends on
- Verify a response arriving after the route changed is discarded (stale response guard): it must not append options, advance `currentPage`, set `error`, or clear `isLoading`
- Verify a response from a superseded load of the **same** route is discarded: going `A → B → A` while the first request for `A` is in flight must not append page 0 twice
- Verify a failure from a superseded load does not set the error state
- Verify the selection is dropped and `update:entity` emitted with a `null` value when the rendered route changes, with no placeholder rebuilt for it
- Verify the preset value survives the first load, including when the entity arrives after mount
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
- Verify that `localValue` is updated when the entity value at `definition.name` changes
- Verify that `localValue` is **not** overwritten when only other entity attributes change
- Verify the select is rendered as disabled when `definition.inputSettings.disable` is `true`

---

## **📌 Notes**

- The component assumes `definition.input === 'DynamicList'`
- Uses `FieldDynamicListSettings` type for `inputSettings`, which requires a `route` property
- The `route` property is **mandatory** in `FieldDynamicListSettings` — without it, the component displays an error
- The `route` is rendered as a Nunjucks template with the edited entity exposed as `entity`; a route without `{{` is used as-is
- A templated route waits for the entity to be non-empty before its first fetch, so a details page that mounts its form before loading the entity never requests a malformed URL
- Changing an entity value the route depends on discards the loaded options and refetches from page 0; changing any other entity value does not trigger a refetch
- Responses from a superseded load are discarded, so a slow request cannot pollute the current options, error or loading state — identified by a load id rather than by the route, so that two live requests for the same URL are told apart
- Changing the rendered route drops the current selection from the entity: a value picked from the previous route does not belong to the new one
- The field is rendered as non-interactive when `definition.inputSettings.disable` is `true`
- Options are fetched lazily and accumulated across pages
- The `entity` prop is reactive: changes to the entity value at `definition.name` are reflected in `localValue` via a selective `watch`
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

- Resolving its route template against the edited entity and keeping the options in sync with it
- Fetching `{ label, value }` elements lazily from a backend DLVP route endpoint
- Rendering the select dropdown with labels while storing values in the entity
- Managing local UI state (pagination, loading, error)
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
