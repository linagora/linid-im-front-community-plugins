# **EntityAttributeDynamicListField 📋**

The **EntityAttributeDynamicListField** component is a specialized attribute field designed to handle **dynamic list-based attributes** within an entity.

It relies on Quasar's `QSelect` component with **lazy loading** (dynamic loading on virtual scroll) and integrates with the LinID design system and scoped i18n to provide a fully customizable, localized, and reactive select input for structured `{ label, value }` elements fetched from a backend endpoint. The dropdown displays **labels** while the entity stores only the **value**.

The route itself is a **Nunjucks template** rendered against the edited entity, so the endpoint can depend on other attribute values (e.g. `/api/organizations/{{ entity.organizationId }}/units`). Options are reloaded automatically whenever the rendered route changes.

A templated route declares the values it needs through `routeDependencies`. While one of them is empty the field is **disabled** and no request is sent; as soon as they all hold a value the options are loaded, and they are reloaded whenever one of them changes the rendered route. A templated route that declares **no** dependency is rendered and requested as-is from the first render, missing values included — so a route built on entity values should always declare them.

Unlike `EntityAttributeListField`, which uses a static predefined list, this component fetches options **page by page** from a DLVP (Dynamic List Validation Plugin) route endpoint, loading more items as the user scrolls through the dropdown.

---

## **🎯 Purpose**

- Renders a dynamic list attribute using a dropdown/select field with lazy loading
- Fetches structured `{ label, value }` elements from a backend route endpoint (DLVP) using pagination
- Renders the `route` as a Nunjucks template against the edited entity, and reloads the options whenever the rendered route changes
- Drops the current selection on a route change, so a value picked under a previous scope is never carried over into the new list
- Disables the field and holds the route back while a value declared in `routeDependencies` is still empty, and loads the options as soon as they all hold a value
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
   * Dot-notation paths of the values the `route` needs before it can be loaded, written against the
   * same context as the `route` template, where the edited entity is exposed as `entity`
   * (e.g. ["entity.organizationId"] for "/organizations/{{ entity.organizationId }}/units").
   * While one of them is empty the field is disabled and no request is sent; once they all hold a
   * value the options are loaded, and they are reloaded whenever the rendered `route` changes.
   * A path that does not appear in the `route` is accepted — the route is never read to check it.
   * Such a dependency still disables the field while it is empty, but changing it from one value to
   * another asks for the very same URL, and therefore reloads nothing.
   * Omitted or left empty, the options are loaded immediately, as for a route without dependencies.
   */
  routeDependencies?: string[];

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

A route waiting for one of its declared dependencies is **not** an error state: no message is displayed while the field is disabled.

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

2. The `route` template is rendered against the entity; as soon as it resolves **and** every declared `routeDependencies` value is non-empty, the first page of `{ label, value }` elements is fetched from the backend
3. After the **first** fetch, if the entity has a preset value not found in the loaded options, a placeholder entry `{ label: value, value: value }` is injected so that the field always displays something meaningful
4. User scrolls through the dropdown → next page is fetched and appended; if the real option matching the preset value is loaded, the placeholder is automatically removed
5. Quasar's `map-options` resolves the stored value string to its corresponding label for display
6. User selects an element from the dropdown → `emit-value` ensures only the `value` string is stored
7. `localValue` is updated via `v-model` (always a string)
8. `updateValue()` emits `update:entity` with a new entity object
9. If the updated entity changes a value the route template depends on, the **selection is dropped** — a value picked from the previous route does not belong to the new one — and the options are discarded and refetched from page 0
10. If the update empties a declared dependency, the options are discarded, the field is disabled, and no request is sent until the dependency holds a value again

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
let loadedRoute: string | null = null;
let currentLoadId = 0;
```

- `allOptions`: Accumulates all fetched `{ label, value }` elements across pages
- `currentPage`: Tracks the next page to fetch (zero-based)
- `hasMore`: Set to `false` when the backend returns `last: true`
- `loadedRoute`: The route the current options were loaded from, `null` until the first load. It is what distinguishes the **first** load — where the entity's persisted value must be preserved — from a **later route change**, where the selection belongs to options that no longer apply.
- `currentLoadId`: Identifies the load in progress; incremented by every `reset()`. A request captures it when it starts and compares it when it settles, which is what makes a superseded response identifiable even when it targets the same URL as the current one.

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

The configured route is rendered against a context shared with the dependency paths:

```ts
const renderContext = computed(() => ({ entity: props.entity }));

const route = computed(() => renderString(props.definition.inputSettings?.route ?? '', renderContext.value));
```

- `renderContext`: the context the route template **and** the dependency paths are both resolved against — the edited entity exposed as `entity`
- `route`: the rendered route, falling back to an empty string when no `route` is configured
- The route is rendered from the **first render onwards**: the component does not try to guess whether the entity is loaded yet. A details page mounts its form before it has loaded the entity, so a route templated on entity values must declare them in `routeDependencies` — otherwise it is requested with those values missing (e.g. `/api/organizations//units`).

### Route Dependencies

`routeDependencies` declares the values the route needs before it can be loaded:

```ts
const areDependenciesSatisfied = computed(() => { ... });
```

- Each dependency is a **dot-notation path resolved against the render context**, so it is written exactly as it appears in the route template (`entity.organizationId` for `{{ entity.organizationId }}`)
- The route is **never read** to check that a declared path appears in it, so declaring a dependency the route ignores is accepted. It still disables the field while it is empty, but changing it from one value to another asks for the very same URL, and therefore reloads nothing.
- A dependency located in a sub-object is supported (`entity.extraParameters.organizationId`)

A dependency counts as **missing** when its value is:

| Value                       | Satisfied |
| --------------------------- | --------- |
| `undefined` (absent path)   | ❌        |
| `null`                      | ❌        |
| `''` or a whitespace string | ❌        |
| `[]`                        | ❌        |
| `0`, `false`                | ✅        |
| Any other value             | ✅        |

When `routeDependencies` is omitted or empty, `areDependenciesSatisfied` is `true` and the field behaves as if it had no dependency.

### Disabled State

```ts
const isDisabled = computed(() => props.definition.inputSettings?.disable === true || !areDependenciesSatisfied.value);
```

- The select is non-interactive when it is explicitly disabled through `inputSettings.disable`, **or** while one of its declared dependencies is empty

### Fetch Trigger

Fetching is driven by a `watch` with `immediate: true`, so that the options follow the rendered route throughout the component lifetime instead of only at mount time. It watches **two** sources: whether loading is allowed, and which page to load.

```ts
watch([areDependenciesSatisfied, route], async ([areSatisfied, renderedRoute]) => { ... }, { immediate: true });
```

| Watched state            | Meaning                                  | Behavior                                      |
| ------------------------ | ---------------------------------------- | --------------------------------------------- |
| A dependency is empty    | The route must not be requested          | Discards the options — no fetch, no error     |
| Satisfied, empty route   | No `route` configured in `inputSettings` | Sets the `missingRoute` error                 |
| Satisfied, first route   | Nothing has been loaded yet              | Fetches page 0 and **keeps** the preset value |
| Satisfied, route changed | The options no longer match the route    | Drops the selection, then fetches page 0      |

- Both sources are plain values — a boolean and a string — so `watch` compares them with `Object.is` and only fires when one of them really moved. Editing an entity attribute that changes neither does **not** cause a refetch.
- A dependency triggers a reload through **two** paths, and never more than one at a time: filling it in or emptying it flips `areDependenciesSatisfied`, and changing its value flips `route` when the route is templated on it
- A dependency **absent from the route** therefore only gates: changing it from one non-empty value to another requests the exact same URL, so nothing is reloaded
- `immediate: true` makes the initial fetch and subsequent reloads go through the same code path

### Selection Reset

```ts
function clearSelection() { ... }
```

- A value picked from one route does not belong to the next one: a unit chosen under `org-1` is not a unit of `org-2`. The selection is therefore dropped whenever the rendered route changes.
- `updateValue()` emits the usual `update:entity`, so the form stops carrying a value the field no longer offers instead of failing validation at submit time
- Because the selection is cleared **before** `fetchPage()`, `ensurePresetValueInOptions()` has nothing to re-inject — the new list never presents a stale value as one of its own options
- It is guarded by `loadedRoute !== null`, so the **first** load never clears anything: a details page mounts its form before the entity arrives, and the persisted value must survive that first render
- Returning to a route that was already loaded (emptying a dependency then restoring it to the same value) is not a change, so the selection survives it

Emitting outside of a user interaction follows the same pattern as `EntityAttributeListField`, whose `watch` on `options` drops a value its filtered list no longer offers. It is safe here because within one mount the `entity` prop only goes from empty to loaded once — pages fetch it from `onMounted` — so a route change can only come from an edit made in the form.

### Reset

```ts
function reset() { ... }
```

- Discards everything that belongs to the previously loaded route: its options, which are no longer valid, its pagination cursor so the new route starts at page 0, the `isLoading` flag so a fetch still in flight cannot block the new one, and the `error` message it owns
- Starts a **new load**, which is what makes the requests it just unblocked identifiable as stale when they settle (see _Fetch Logic_)
- Called on its own when the field becomes unusable (a dependency emptied), leaving no stale options behind a disabled select
- Called by the watcher before each reload, which then fetches page 0 and re-runs `ensurePresetValueInOptions()` so a preset value absent from the new first page is still displayed

### Fetch Logic

```ts
async function fetchPage() { ... }
```

- **Stale response guard:** the load in effect when the request starts is captured in `loadId` and compared against `currentLoadId` **once**, right after the request settles. A response from a superseded load is discarded — its options belong to a list that is gone and must not pollute the current one, nor advance its pagination cursor, nor touch `error` or `isLoading`, which the newer load now owns.
- The `try` block **only** awaits: turning the failure into an absent `page` rather than a control-flow branch is what allows a single guard. With a `catch` and a `finally`, the check has to be repeated on each of the three exit paths, since the `catch` is only reached when the code after the `await` was skipped, and the `finally` also runs on the stale `return`.
- Every state write therefore sits after the guard: the load is over as soon as it is known to be the current one, then the outcome is handled. Adding another piece of state later cannot forget the check.
- `page?.content` is what tells a failure from a success: a body that is missing or malformed reports a fetch error rather than throwing outside the `try`. An **empty** `content` array is a success — the cursor advances and `hasMore` is updated.
- The guard is a **load id, not the route string**. `reset()` clears `isLoading` so that a request still in flight does not block the new load, which means two requests can legitimately overlap — and going `A → B → A` while the first request for `A` is in flight would leave two live requests for the _same_ URL. Comparing routes would accept both and append page 0 twice; comparing load ids accepts only the last one.
- Fetches are **guarded** against concurrent calls (`isLoading.value`), exhausted data (`!hasMore`) and unsatisfied dependencies (`!areDependenciesSatisfied.value`), so no request is ever sent while the field is disabled — including from the virtual scroll handler
- `currentPage`, `hasMore`, `loadedRoute` and `currentLoadId` are plain `let` variables — they do not need reactivity since they are never used in the template
- Uses `push(...page.content.map(toOption))` to append in-place instead of creating a new array each time
- Skips the append when the page is empty to avoid unnecessary operations

### Preset Value Resolution

When editing an entity that already has a value stored, the corresponding option may not be in the first page of results. Two helper functions handle this — and they only ever concern the **persisted** value, since a selection made under a previous route is dropped before the reload:

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

- `ensurePresetValueInOptions()`: Called by the watcher after its `fetchPage()`. In practice it only ever fires on the **first** load, since a route change clears the selection beforehand. Prepends a placeholder entry if the entity's preset value is not found in the loaded options.
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

A route may depend on another attribute of the same entity. Here the list of units is scoped to the organization currently selected on the entity, and `routeDependencies` declares the value that route needs:

```json
{
  "name": "unit",
  "type": "String",
  "input": "DynamicList",
  "inputSettings": {
    "route": "/api/organizations/{{ entity.organizationId }}/units",
    "routeDependencies": ["entity.organizationId"],
    "size": 10
  }
}
```

- While `organizationId` is empty the select is **disabled** and `/api/organizations//units` is never requested. Without the declaration the field would fire that malformed URL as soon as it renders — which is what a details page does, mounting its form before the entity has loaded.
- As soon as the user picks `org-1`, the field is enabled and `/api/organizations/org-1/units` is fetched
- Changing the organization to `org-2` fetches page 0 of `/api/organizations/org-2/units`, discards the units of `org-1`, and drops the unit selected under `org-1` from the entity
- Clearing the organization discards the loaded units and disables the field again

Several dependencies can be declared, and they do not have to appear in the route:

```json
{
  "name": "accountId",
  "type": "String",
  "input": "DynamicList",
  "inputSettings": {
    "route": "/organizations/{{ entity.organizationId }}/accounts",
    "routeDependencies": ["entity.organizationId", "entity.unitId"]
  }
}
```

- The list stays disabled until **both** `organizationId` and `unitId` hold a value
- `unitId` is not part of the route: the component never checks that a dependency is used by the route. Emptying it disables the field, filling it back in reloads the options, but changing it from one non-empty value to another requests the same URL and therefore changes nothing.

---

## **✅ Advantages**

- **Lazy loading:** Fetches options on demand, avoiding large upfront data transfers
- **Infinite scrolling:** Seamless pagination via Quasar's virtual scroll
- **Contextual routes:** The endpoint can depend on other entity attributes, keeping the options scoped to the current selection
- **Declared dependencies:** The values the route needs are configuration, not guesswork — the field stays disabled and silent until they are all filled in
- **Race-safe:** Responses from superseded loads are discarded instead of corrupting the current state, including when they target the same URL as the load in progress
- **No stale selection:** A value picked under a previous scope is removed from the entity rather than surviving as a fabricated option of the new list
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
- Verify the rendered route is fetched once the entity is loaded into the props
- Verify options are discarded and refetched from page 0 when an entity change alters the rendered route
- Verify the selection is dropped and `update:entity` emitted with a `null` value when the rendered route changes
- Verify no placeholder is rebuilt for a selection dropped that way
- Verify the preset value **survives** the first load, including when the entity arrives after mount
- Verify the selection survives a route that comes back to an already loaded one (a dependency emptied then restored)
- Verify nothing is emitted when the route changes while no value is selected
- Verify **no** reload occurs when the entity changes outside of the values the route depends on
- Verify `routeDependencies` defaults to an empty array and that the field then behaves as if it had no dependency
- Verify a dependency is satisfied only by a non-empty value: `undefined`, `null`, blank strings and empty arrays are missing, while `0` and `false` are values
- Verify a dependency located in a nested path is resolved
- Verify **no** request is sent while a declared dependency is empty, and that no error is displayed in that state
- Verify the fetch happens once every dependency holds a value, including when several are declared
- Verify a dependency that changes the rendered route reloads the options **once**
- Verify a dependency absent from the route does **not** reload the options when it changes from one non-empty value to another, but does when it is filled back in
- Verify the loaded options, the pagination cursor and the error are discarded when a dependency becomes empty
- Verify `fetchPage` returns without requesting anything while a dependency is empty
- Verify a response arriving after the route changed is discarded (stale response guard): it must not append options, advance `currentPage`, set `error`, or clear `isLoading`
- Verify a response from a superseded load of the **same** route is discarded: going `A → B → A` while the first request for `A` is in flight must not append page 0 twice
- Verify a failure from a superseded load does not set the error state
- Verify a response carrying no `content` sets the fetch error, clears `isLoading` and leaves the pagination cursor where it was
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
- Verify the select is rendered as disabled while a declared dependency is empty, and enabled again once it holds a value

---

## **📌 Notes**

- The component assumes `definition.input === 'DynamicList'`
- Uses `FieldDynamicListSettings` type for `inputSettings`, which requires a `route` property
- The `route` property is **mandatory** in `FieldDynamicListSettings` — without it, the component displays an error
- The `route` is rendered as a Nunjucks template with the edited entity exposed as `entity`; a route without `{{` is used as-is
- A templated route is rendered and requested from the first render: the values it needs must be declared in `routeDependencies`, otherwise a details page that mounts its form before loading the entity requests a malformed URL
- Changing an entity value the route template depends on drops the current selection, discards the loaded options and refetches from page 0; changing any other entity value does not trigger a refetch
- The preset value is preserved on the first load only — afterwards, a value picked from a route that no longer applies is removed from the entity rather than displayed as a valid option of the new list
- Responses from a superseded load are discarded, so a slow request cannot pollute the current options, error or loading state — identified by a load id rather than by the route, so that two live requests for the same URL are told apart
- `routeDependencies` declares the values the route needs; the component never parses the route to check that a declared dependency is actually used by it
- While a declared dependency is empty the field is disabled, its options are discarded and no request is sent — not even from the virtual scroll handler
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
- `clearSelection()` emits outside of a user interaction, like the `watch` on `options` in `EntityAttributeListField` which drops a value the filtered list no longer offers; it is safe because the `entity` prop only goes from empty to loaded once per mount, so a route change always originates from an edit in the form

---

## **🏗️ Architecture Summary**

**EntityAttributeDynamicListField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Resolving its route template against the edited entity, holding it back until its declared dependencies are filled in, and keeping the options **and the selection** in sync with both
- Fetching `{ label, value }` elements lazily from a backend DLVP route endpoint
- Rendering the select dropdown with labels while storing values in the entity
- Managing local UI state (pagination, loading, error)
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
