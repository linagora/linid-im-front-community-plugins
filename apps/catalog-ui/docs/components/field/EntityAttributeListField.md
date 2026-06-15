# **EntityAttributeListField 📋**

The **EntityAttributeListField** component is a specialized attribute field designed to handle **list-based attributes**
within an entity.

It relies on Quasar's `QSelect` component and integrates with the LinID design system and scoped i18n to provide a fully
customizable, localized, and reactive select input for predefined value lists.

---

## **🎯 Purpose**

- Renders a list attribute using a dropdown/select field
- Synchronizes the selected value with the entity model
- Emits normalized entity updates on user selection
- Supports scoped translations for labels, hints, prefixes, and suffixes
- Enables UI customization via the design system
- Supports disabling the field via `inputSettings.disable`

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldListSettings`.

| Prop          | Type                                             | Required | Description                                                                  |
| ------------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                         | Yes      | Identifier used for contextual data                                          |
| `i18nScope`   | `string`                                         | Yes      | I18n scope for localizing the component                                      |
| `uiNamespace` | `string`                                         | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldListSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                        | Yes      | Entity object containing the list attribute value                            |
| `ignoreRules` | `boolean`                                        | No       | Indicates whether to bypass validation rules for this field (default: false) |

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

### FieldListSettings

```ts
export interface FieldListValue {
  /** The option value displayed in the select. */
  value: string;
  /**
   * Conditions under which this option is shown.
   * Each key is an entity field name; the value is a string or an array of strings (OR logic within a key).
   * All keys must match simultaneously (AND logic across keys).
   * When a key's entity field has no value (null/undefined), the condition is considered satisfied.
   * When absent, the option is always shown regardless of entity state.
   */
  filterContext?: Record<string, string | string[]>;
}

export interface FieldListSettings extends FieldSettings {
  /**
   * List of possible values for the field.
   * Use `string[]` for a flat list with no filtering.
   * Use `FieldListValue[]` to configure conditional visibility via `filterContext`.
   */
  values: string[] | FieldListValue[];

  /**
   * Default value for the field. Must be one of the values defined in the `values` array.
   * If not provided or if the value is not in the `values` array, falls back to `null`.
   */
  defaultValue?: string;

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
entity-editor.role → q-select
```

This allows full control over appearance, validation rules, and behavior per attribute.

---

## **✅ Validation**

The component implements automatic validation based on the attribute's `inputSettings`, the `definition.required` property, and the `definition.hasValidations` property.

### Validation Rules

Validation rules are generated automatically using `useQuasarRules`:

```ts
const rules = computed(() => (!props.ignoreRules && !props.definition.inputSettings?.ignoreRules ? useQuasarRules(props.instanceId, props.definition, [], localI18nScope) : []));
```

### Validation Execution Order

The validation rules are executed in a specific order to ensure proper validation flow:

1. **Required validation** (if applicable)
   - Depends on the `definition.required` property
   - If `definition.required` is `true`, this validation is automatically added as the **first rule** in the validation chain
   - Ensures that a value is selected before proceeding to other validations

2. **Specific validation rules** (in order)
   - The rules specified in the `useQuasarRules` parameters (currently an empty array `[]` for list fields)
   - These rules are executed **in the order specified** in the array
   - Execute **after** the required validation (if present)

3. **Backend API validations** (if applicable)
   - Depends on the `definition.hasValidations` property
   - If `definition.hasValidations` is `true`, backend validation rules are added
   - These validations are executed **last**, after all client-side validations pass
   - Used for server-side validation logic (e.g., checking business rules)

### Supported Validation Types

| Setting       | Description                                                                          | Example             |
| ------------- | ------------------------------------------------------------------------------------ | ------------------- |
| `required`    | Marks the field as mandatory. Setting comes from the `definition.required` property. | `required: true`    |
| `ignoreRules` | Bypass validation when set to `true`                                                 | `ignoreRules: true` |

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` is `true`, no validation is performed
- Validation messages are automatically translated using the instance's i18n scope

---

## **🔁 Data Flow**

1. Initial value is resolved from:
   - `entity[definition.name]` (existing value in entity)
   - `defaultValue` (if provided and included in `values` array)
   - `null` (fallback if `defaultValue` is absent or invalid)

2. On mount, if `localValue` is not `null` (i.e. a `defaultValue` was applied) but the entity has no value yet, `updateValue()` is called immediately to propagate the default to the parent
3. User selects a value from the dropdown
4. `localValue` is updated via `v-model`
5. `updateValue()` emits `update:entity` with a new entity object

```text
QSelect → localValue → updateValue → update:entity
```

---

## **🧠 Internal State Management**

### Options Management

```ts
const options = computed((): FieldListValue[] => { ... });
```

- Always returns `FieldListValue[]` — `string[]` inputs are normalized to `{ value: string }` objects
- Falls back to an empty array if `values` is not provided
- When no value has a `filterContext`, returns the full normalized list unchanged
- When `filterContext` is present on some values, filters entries against the current `entity` state:
  - OR logic within each `filterContext` key (single string or array of accepted values)
  - AND logic across keys (all constraints must be satisfied simultaneously)
  - Entries with no `filterContext` are always included
  - If a `filterContext` key references an entity field with no value (null/undefined), the constraint is considered satisfied and the entry is shown
- Re-evaluates automatically whenever the referenced `entity` fields change
- The `q-select` receives `option-value="value"`, `option-label="value"`, `emit-value`, and `map-options` so that `localValue` remains a plain string regardless of the object options format

### Default Value Resolution

```ts
const defaultValue = props.definition.inputSettings?.defaultValue && normalizedValues.some((opt) => opt.value === props.definition.inputSettings?.defaultValue) ? props.definition.inputSettings.defaultValue : null;
```

- Validates that `defaultValue` (if provided) exists in the `values` array
- Falls back to `null` if `defaultValue` is absent or not included in the `values` array

### Selected Value Management

```ts
const localValue = ref(props.entity[props.definition.name] ?? defaultValue ?? null);
```

- Uses a local reactive reference to isolate UI interaction
- Implements a cascading default value resolution strategy:
  1. Entity's existing value takes precedence
  2. Falls back to the validated `defaultValue` if provided and present in `values`
  3. Finally falls back to `null` if no valid default is available
- A `watch` on `() => props.entity[props.definition.name]` keeps `localValue` in sync when the parent updates the entity — it only triggers when the **specific attribute value** changes, not when other fields of the entity change
- When the watched value becomes `null` or `undefined`, the fallback cascade `newValue ?? defaultValue ?? null` is applied, restoring the default value if available
- A second `watch` on the `options` computed detects when the current `localValue` is no longer available after filtering: it resets `localValue` to `null` and emits `update:entity` to notify the parent

---

## **💡 Usage Examples**

### Flat list (no filtering)

```vue
<script setup lang="ts">
import EntityAttributeListField from '@/components/field/EntityAttributeListField.vue';

const entity = reactive({ role: 'user' });

const definition = {
  name: 'role',
  input: 'List',
  type: 'String',
  required: true,
  hasValidations: false,
  inputSettings: {
    values: ['admin', 'user', 'guest'],
    defaultValue: 'user',
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeListField
    ui-namespace="entity-editor"
    instance-id="user-1"
    :definition="definition"
    :entity="entity"
    @update:entity="onUpdateEntity"
  />
</template>
```

### Dependent filtering

When `country` changes, the city options update automatically. If the selected city is no longer available, it is cleared and `update:entity` is emitted.

```vue
<script setup lang="ts">
const entity = reactive({ country: 'France', city: null });

const cityDefinition = {
  name: 'city',
  input: 'List',
  type: 'String',
  required: false,
  hasValidations: false,
  inputSettings: {
    values: [
      { value: 'Paris', filterContext: { country: 'France' } },
      { value: 'Lyon', filterContext: { country: 'France' } },
      { value: 'London', filterContext: { country: 'UK' } },
      { value: 'Valence', filterContext: { country: ['France', 'Espagne'] } },
    ],
  },
};
</script>
```

---

## **✅ Advantages**

- **Focused responsibility:** Dedicated to list-based selection attributes
- **Immutable updates:** Avoids mutating the parent entity directly
- **Localized UI:** Supports multiple translatable UI elements
- **Highly customizable:** Fully integrated with the UI design system
- **Reusable:** Works across modules with different schemas
- **Smart defaults:** Validates `defaultValue` against the `values` array; falls back to `null` if absent or invalid
- **Framework-native:** Built using Vue 3 Composition API and Quasar standards

---

## **🧪 Testing Considerations**

- Verify initial selected value matches the entity state or default value
- Verify `update:entity` is emitted on mount when a `defaultValue` is applied and the entity has no existing value
- Verify `update:entity` is **not** emitted on mount when the entity already has a value
- Assert `update:entity` emission on selection changes
- Test default value resolution (entity value → validated defaultValue → null)
- Test that invalid `defaultValue` (not in `values` array) falls back to `null`
- Mock `useScopedI18n` to control translation output
- Shallow mount the component to isolate logic from UI rendering
- Verify that the options list matches the `values` array from `inputSettings`
- Verify that `localValue` is updated when `entity[definition.name]` changes
- Verify that when `entity[definition.name]` is set to `null`, `localValue` falls back to `defaultValue` (or `options[0]`)
- Verify that `localValue` is **not** overwritten when only other entity attributes change
- Verify that `options` is filtered reactively when entity fields referenced in `filterContext` change
- Verify OR logic within a single `filterContext` key (array of accepted values)
- Verify AND logic across multiple `filterContext` keys
- Verify that entries with no `filterContext` are always included
- Verify that entries are shown when a `filterContext` key references an entity field with no value
- Verify that `localValue` is cleared and `update:entity` is emitted when the selected value is no longer in the filtered options
- Verify that no emission occurs when `localValue` is already `null` and the options change

---

## **📌 Notes**

- The component assumes `definition.input === 'List'`
- Uses `FieldListSettings` type for `inputSettings`, which requires a `values` array
- The `values` property is **mandatory** in `FieldListSettings`
- Available options are computed reactively; when no value has a `filterContext`, the result is equivalent to the full normalized list
- Default value is validated against the full `values` array (unfiltered)
- Default value resolution follows a specific cascade: entity value → validated `defaultValue` → `null`
- The `entity` prop is reactive: changes to `entity[definition.name]` are reflected in `localValue` via a selective `watch`; the default value cascade also applies when the watched value becomes `null` or `undefined`
- Validation is handled internally using `useQuasarRules` and can be configured via `inputSettings`
- Missing translations safely fall back to default values
- Intended for use via `EntityAttributeField`, not directly in most cases

---

## **🏗️ Architecture Summary**

**EntityAttributeListField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Rendering the select dropdown with predefined values
- Managing local UI state
- Validating and resolving default values
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
