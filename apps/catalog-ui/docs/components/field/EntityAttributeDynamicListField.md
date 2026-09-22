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
- Drops the current selection on a route change, so a value picked under a previous scope is never carried over into the new list
- Suspends a load it cannot perform instead of abandoning it, so restoring the value resumes the list where it stopped
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
   * Backend route path exposed by the DLVP route plugin, rendered as a Nunjucks template with the
   * edited entity as `entity` (e.g. "/api/organizations/{{ entity.organizationId }}/units").
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

| Key                                   | Usage                                          |
| ------------------------------------- | ---------------------------------------------- |
| `validation.dynamicList.missingRoute` | Displayed when no `route` is configured at all |
| `validation.dynamicList.fetchError`   | Displayed when a fetch request fails           |

Two error sources, deliberately separate:

- **A missing `route` setting** is reported for as long as it is missing — no load can clear it
- **A failed request** is reported until the next load replaces it

A broken configuration outranks a failed request.

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
3. After the **first page** of each load, a preset value missing from the options gets a placeholder entry `{ label: value, value: value }` — unless that page failed, in which case the list stays empty so the error remains visible
4. User scrolls through the dropdown → next page is fetched and appended; if the real option matching the preset value is loaded, the placeholder is automatically removed
5. Quasar's `map-options` resolves the stored value string to its corresponding label for display
6. User selects an element from the dropdown → `emit-value` ensures only the `value` string is stored
7. `localValue` is updated via `v-model` (always a string)
8. `updateValue()` emits `update:entity` with a new entity object
9. If the updated entity changes a value the route template depends on, the **selection is dropped** — a value picked from the previous route does not belong to the new one — and the options are discarded and refetched from page 0

```text
Backend API → fetchPage() → allOptions (DynamicListElement[]) → QSelect (displays labels)
QSelect → localValue (value string) → updateValue → update:entity
```

---

## **🧠 Internal State Management**

### Options Management (Lazy Loading)

```ts
interface PagedFetch {
  readonly route: string;
  readonly controller: AbortController;
  nextPage: number;
  hasMore: boolean;
  hasPendingRequest: boolean;
}

const allOptions = ref<DynamicListElement[]>([]);
let currentFetch: PagedFetch | null = null;
let requestedRoute: string | null = null;
```

- `allOptions`: Accumulates all fetched `{ label, value }` elements across pages
- `PagedFetch`: One paginated load from a single route, holding its own pagination position. `route` is `readonly`, so page 3 of a load can never come from a different URL than page 0.
- `currentFetch`: The load the list is currently filled from, `null` while the field has none. Replacing it is what invalidates a response that arrives too late.
- `requestedRoute`: The last rendered route a request was opened on, `null` until the first one. It is what tells a **first** load, where the persisted value is kept, from a **later route change**, where the selection is dropped.

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
- `error`: the failure of the last request. A missing `route` is reported separately — see _Error Translation Keys_ — and the `#no-option` slot displays whichever of the two applies

### Route Resolution

The `route` is a Nunjucks template rendered against the edited entity, exposed as `entity`:

```json
{ "route": "/api/organizations/{{ entity.organizationId }}/units" }
```

- A route without `{{` is used as-is
- A template that has not resolved renders empty, and the load simply suspends. Only a `route` missing from `inputSettings` is reported as an error.

```ts

### Fetch Trigger

The field loads whenever it can, and reacts to every change of the edited entity — not only at mount:

| State                    | Outcome                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| Empty rendered route     | **Suspends**, identically                                           |
| Same route as before     | **Suspends** too: the list simply carries on where it was           |
| First route              | Fetches page 0 and **keeps** the preset value                       |
| The rendered route moved | **Abandons**: drops the selection, empties the list, fetches page 0 |

- Editing an entity attribute the route does not use does **not** refetch
- A first page that fails leaves its error visible instead of hiding it behind the preset value

### Selection Reset

```ts
function clearSelection() { ... }
```

- A unit chosen under `org-1` is not a unit of `org-2`: the selection is dropped whenever the rendered route changes, and `update:entity` is emitted so the form stops carrying it
- The **first** load never clears anything — a persisted value survives a form mounted before its entity arrives
- A route that rendered empty is not a route change, it suspends, and the selection stays
- Returning to a route already loaded is not a change either, so nothing is dropped and nothing is refetched

The field therefore emits outside of a user interaction, like `EntityAttributeListField` when its filtered list stops offering the selected value. Parent components must expect an `update:entity` carrying `null` for this attribute after an edit elsewhere in the form.

#### ⚠️ A disabled field still carries its value

The two list fields look alike but do **not** clear on the same trigger:

| Component                         | Clears the selection when…                                        |
| --------------------------------- | ----------------------------------------------------------------- |
| `EntityAttributeListField`        | its `options` no longer contain the value                         |
| `EntityAttributeDynamicListField` | the **rendered route** changes — not when the options are emptied |

Aligning them is impossible: a dependency is missing on **every** first render of a details page, so clearing there would wipe the persisted value before it was ever displayed.

### Suspending and Abandoning

The field never has to choose between reloading everything and going blank — it has two distinct reactions.

#### Suspending

The route renders empty or it comes back to the one already loaded: the field **keeps what it has** and asks for nothing.

- The options, the selection and the scroll position all survive, so the selected value still displays with its **label** and scrolling resumes where it stopped instead of replaying page 0
- A request already in flight is left to finish, and its page is added normally
- A previous fetch error stays displayed — it describes the load, not the moment it failed

#### Abandoning

The rendered route changes, or the component unmounts: the field **throws the load away** and cancels its request. On a route change it also discards the options, drops the selection and fetches page 0 of the new route.

### Fetch Logic

Only the guarantees a caller can observe:

- A response from a superseded load is discarded whole — it cannot add options, advance the pagination, or change the error or loading state. Two loads of the **same** URL are still told apart, so `org-1 → org-2 → org-1` never appends page 0 twice.
- A missing or malformed response body is reported as a fetch error; an **empty** page is a success and simply ends the pagination
- The same page is never requested twice, however often the virtual scroll fires during a single gesture
- Abandoning a load cancels its request rather than merely ignoring the answer, so leaving a form while its list is loading costs nothing

### Preset Value Resolution

When editing an entity that already has a value, its option may not be in the first page. The field then shows the raw value as a placeholder, and replaces it with the real option — proper label included — as soon as a page brings it in.

This applies to the first load and to any reload a route change did not invalidate; a value the route change dropped is never re-injected. Two real options sharing a value are a backend duplicate, not a placeholder, and are left alone.

### Virtual Scroll Handler

Reaching the end of the loaded options fetches the next page, until the backend reports the last one. While the field is disabled the dropdown cannot open, so nothing is paginated.

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
export async function getDynamicListPage(route: string, pagination: Pagination, signal?: AbortSignal): Promise<Page<DynamicListElement>> {
  const response = await getHttpClient().get<Page<DynamicListElement>>(route, {
    params: pagination,
    signal,
  });
  return response.data;
}
```

The `signal` is what makes a replaced or unmounted fetch stop costing a response: the component passes
its `PagedFetch.controller.signal`, so aborting the controller aborts the request. It is optional, so a
caller that does not need cancellation keeps calling the service with two arguments.

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

```json
{
  "name": "unit",
  "type": "String",
  "input": "DynamicList",
  "inputSettings": {
    "route": "/api/organizations/{{ entity.organizationId }}/units",
    "size": 10
  }
}
```

- While `organizationId` is empty the select is **disabled** and `/api/organizations//units` is never requested
- Picking `org-1` enables the field and fetches `/api/organizations/org-1/units`
- Moving to `org-2` fetches its page 0, discards the units of `org-1` and drops the selected unit from the entity
- Clearing the organization suspends instead: the units, the selection and the cursor are kept, and restoring `org-1` resumes without a request

---

## **✅ Advantages**

- **Lazy loading:** Fetches options on demand, avoiding large upfront data transfers
- **Infinite scrolling:** Seamless pagination via Quasar's virtual scroll
- **Contextual routes:** The endpoint can depend on other entity attributes, keeping the options scoped to the current selection
- **Race-safe:** A slow response from a load that no longer applies never corrupts the list on screen
- **No stale selection:** On a route change, a value picked under the previous scope is removed from the entity rather than surviving as a fabricated option
- **Resumable:** A load held back by a missing value keeps its options and its cursor, so filling the value back in costs nothing
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
- Assert `getDynamicListPage` is called on mount with `{ page: 0, size: configuredSize }` and the current fetch's abort signal
- Test default page size (20) when `size` is not configured
- Verify options are populated with `{ label, value }` objects after a successful fetch
- Verify `configurationError` reports a missing `route` setting, reports nothing when a configured one renders empty, and cannot be cleared by the loading flow
- Verify `displayedError` shows the configuration error over a fetch failure
- Verify a `route` that renders empty after a load suspends: no request, no `missingRoute`, everything kept
- Test error state on fetch failure
- Verify a templated `route` is rendered against the entity before being fetched
- Verify a route change reloads from page 0, drops the selection, emits `update:entity` with `null`, and rebuilds no placeholder
- Verify the preset value **survives** the first load, including when the entity arrives after mount
- Verify a route coming back to an already loaded one requests nothing, and the next scroll asks for the following page
- Verify `clearSelection` emits nothing when no value is selected — which is what keeps a route change silent in that state
- Verify **no** reload occurs when the entity changes outside of the values the route depends on
- Verify a route change **does** clear the fetch error, since `cancelFetch()` kills the fetch that owned it
- Verify `cancelFetch` aborts the request **and** drops `currentFetch`, clearing the spinner and the error it owned
- Verify `fetchPage` requests nothing when one of its requests is already pending, or when the last page was reached
- Verify the in-flight request is aborted on unmount
- Verify a response arriving after the route changed appends nothing, sets no `error`, and leaves the `isLoading` spinner its replacement owns
- Verify a response from a superseded load of the **same** route is discarded: going `A → B → A` while the first request for `A` is in flight must not append page 0 twice
- Verify a failure from a superseded load does not set the error state
- Verify a response carrying no `content` sets the fetch error, clears `isLoading` and leaves the pagination cursor where it was
- Verify fetching stops when the last page is reached
- Test that a second request for the same page is prevented while the first is awaiting (`hasPendingRequest`, not `isLoading`)
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
- A route change drops the selection, discards the options and refetches from page 0; anything else that cannot load **suspends**, keeping everything — see _A disabled field still carries its value_
- A slow response from a load that no longer applies is discarded, even when it targets the same URL as the load in progress
- Unmounting the component aborts the request in flight, so leaving a form while its list is loading costs nothing
- The field is rendered as non-interactive when `definition.inputSettings.disable` is **truthy**, like every other attribute field
- Options are fetched lazily and accumulated across pages
- The `entity` prop is reactive: a change to the value at `definition.name` is reflected in the field, and a change to any other attribute is not
- Validation is handled internally using `useQuasarRules` with a `unique` rule and can be configured via `inputSettings`
- Missing translations safely fall back to default values
- Intended for use via `EntityAttributeField` dispatcher, not directly in most cases
- The backend endpoint must return a Spring `Page<Map<String, String>>` response with `{ label, value }` elements
- Works in conjunction with the DLVP (Dynamic List Validation Plugin) on the backend
- Quasar's `option-label`, `option-value`, `emit-value`, and `map-options` props handle the label/value mapping natively
- A pre-filled value missing from the first page is shown as a placeholder once that page has loaded, and replaced by the real option — proper label included — when a later page brings it in

---

## **🏗️ Architecture Summary**

**EntityAttributeDynamicListField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Resolving its route template against the edited entity,
- Fetching `{ label, value }` elements lazily from a backend DLVP route endpoint
- Rendering the select dropdown with labels while storing values in the entity
- Managing local UI state (pagination, loading, error)
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
