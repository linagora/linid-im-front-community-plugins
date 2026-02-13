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
- Automatically sets the first value of the list as default value when no other default is provided

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldListSettings`.

| Prop          | Type                                             | Required | Description                                                                  |
| ------------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                         | Yes      | Identifier used to scope translations and contextual data                    |
| `uiNamespace` | `string`                                         | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldListSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                        | Yes      | Entity object containing the list attribute value                            |
| `ignoreRules` | `boolean`                                        | No       | Indicates whether to bypass validation rules for this field (default: false) |

### AttributeFieldProps Interface

```ts
export interface AttributeFieldProps<T = Record<string, unknown>> extends CommonComponentProps {
  /** Identifier of the instance used to scope translations and contextual data. */
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
export interface FieldListSettings extends FieldSettings {
  /** List of possible values for the field. The user must select one of these values. */
  values: string[];

  /**
   * Default value for the field. Must be one of the values defined in the `values` array.
   * If not provided or if the value is not in the `values` array, defaults to the first value.
   * @default values[0]
   */
  defaultValue?: string;

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
`${instanceId}.fields.${definition.name}`;
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
const rules = computed(() => (!props.ignoreRules && !props.definition.inputSettings?.ignoreRules ? useQuasarRules(props.instanceId, props.definition, []) : []));
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
   - `options[0]` (first value in the options array)
   - `null` (fallback if options array is empty)

2. User selects a value from the dropdown
3. `localValue` is updated via `v-model`
4. `updateValue()` emits `update:entity` with a new entity object

```text
QSelect → localValue → updateValue → update:entity
```

---

## **🧠 Internal State Management**

### Options Management

```ts
const options = props.definition.inputSettings?.values || [];
```

- Stores the list of available values as a local constant
- Falls back to an empty array if `values` is not provided
- Remains static after initialization (props don't change during component lifecycle)

### Default Value Resolution

```ts
const defaultValue = props.definition.inputSettings?.defaultValue && options.includes(props.definition.inputSettings.defaultValue) ? props.definition.inputSettings.defaultValue : options[0];
```

- Validates that `defaultValue` (if provided) exists in the `values` array
- Falls back to the first value in the options array if validation fails
- Returns `undefined` if the options array is empty

### Selected Value Management

```ts
const localValue = ref(props.entity[props.definition.name] ?? defaultValue ?? null);
```

- Uses a local reactive reference to isolate UI interaction
- Implements a cascading default value resolution strategy:
  1. Entity's existing value takes precedence
  2. Falls back to the validated `defaultValue` (or first option)
  3. Finally falls back to `null` if no default is available
- Does not react to prop changes after initialization (stable props assumption)

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeListField from '@/components/field/EntityAttributeListField.vue';

const entity = reactive({
  role: 'user',
});

const definition = {
  name: 'role',
  input: 'List',
  type: 'String',
  required: true,
  hasValidations: false,
  inputSettings: {
    values: ['admin', 'user', 'guest'],
    defaultValue: 'user', // Optional, defaults to 'admin' (values[0]) if omitted or invalid
    ignoreRules: false,
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

---

## **✅ Advantages**

- **Focused responsibility:** Dedicated to list-based selection attributes
- **Immutable updates:** Avoids mutating the parent entity directly
- **Localized UI:** Supports multiple translatable UI elements
- **Highly customizable:** Fully integrated with the UI design system
- **Reusable:** Works across modules with different schemas
- **Smart defaults:** Validates defaultValue and automatically selects the first value when needed
- **Framework-native:** Built using Vue 3 Composition API and Quasar standards

---

## **🧪 Testing Considerations**

- Verify initial selected value matches the entity state or default value
- Assert `update:entity` emission on selection changes
- Test default value resolution (entity value → validated defaultValue → options[0] → null)
- Test that invalid `defaultValue` (not in `values` array) falls back to first option
- Mock `useScopedI18n` to control translation output
- Shallow mount the component to isolate logic from UI rendering
- Verify that the options list matches the `values` array from `inputSettings`

---

## **📌 Notes**

- The component assumes `definition.input === 'List'`
- Uses `FieldListSettings` type for `inputSettings`, which requires a `values` array
- The `values` property is **mandatory** in `FieldListSettings`
- Available options are stored in a local constant, not reactive, as they are expected to be static
- Default value is validated to ensure it exists in the `values` array
- Default value resolution follows a specific cascade: entity value → validated `defaultValue` → `options[0]` → `null`
- Props are assumed to be **stable** (no changes after component mounting)
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
