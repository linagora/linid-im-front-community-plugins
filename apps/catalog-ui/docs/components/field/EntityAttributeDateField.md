# **EntityAttributeDateField ✏️**

The **EntityAttributeDateField** component is a specialized attribute field designed to handle **date-based attributes**
within an entity.

It relies on Quasar’s `QInput` and `QDate` component and integrates with the LinID design system and scoped i18n to provide a fully
customizable, localized, and reactive date input.

---

## **🎯 Purpose**

- Renders a date attribute using a standard input field with a date-picker
- Synchronizes the input value with the entity model
- Emits normalized entity updates on user input
- Supports scoped translations for labels, hints, prefixes, and suffixes
- Enables UI customization via the design system

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldDateSettings`.

| Prop          | Type                                             | Required | Description                                                                  |
| ------------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                         | Yes      | Identifier used to scope translations and contextual data                    |
| `uiNamespace` | `string`                                         | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldDateSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                        | Yes      | Entity object containing the date attribute value                            |
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

### FieldDateSettings

```ts
export interface FieldDateSettings extends FieldSettings {
  /** Indicates whether to bypass validation rules for this field. */
  ignoreRules?: boolean;
}
```

---

## **📤 Events**

| Event           | Payload                   | Description                                                                      |
| --------------- | ------------------------- | -------------------------------------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | Emitted when the user edits the input field or selects a date in the date-picker |

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

| Key      | Usage in UI                              |
| -------- | ---------------------------------------- |
| `label`  | Input label                              |
| `hint`   | Helper text                              |
| `prefix` | Input prefix                             |
| `suffix` | Input suffix                             |
| `close`  | Close button label, to close date-picker |

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

- Quasar component: `q-input`, `q-btn`, `q-icon` and `q-date`
- Props type: `LinidQInputProps`, `LinidQBtnProps`, `LinidQIconProps` and `LinidQDateProps`

Example:

```ts
uiNamespace = 'entity-editor'

// Final UI namespace
entity-editor.username → q-input
entity-editor.username → q-btn
entity-editor.username → q-icon
entity-editor.username → q-date
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
   - Ensures that the field is not empty before proceeding to other validations

2. **Specific validation rules** (in order)
   - The rules specified in the `useQuasarRules` parameters (currently an empty array `[]` for date fields)
   - These rules are executed **in the order specified** in the array
   - Execute **after** the required validation (if present)

3. **Backend API validations** (if applicable)
   - Depends on the `definition.hasValidations` property
   - If `definition.hasValidations` is `true`, backend validation rules are added
   - These validations are executed **last**, after all client-side validations pass
   - Used for server-side validation logic (e.g., checking uniqueness, business rules)

### Supported Validation Types

| Setting       | Description                                                                          | Example             |
| ------------- | ------------------------------------------------------------------------------------ | ------------------- |
| `required`    | Marks the field as mandatory. Setting comes from the `definition.required` property. | `required: true`    |
| `ignoreRules` | Bypass validation when set to `true`                                                 | `ignoreRules: true` |

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` est `true`, no validation is performed
- Validation messages are automatically translated using the instance's i18n scope

---

## **🔁 Data Flow**

1. Initial value is read from `entity[definition.name]`
2. User edits the input field or the date-picker
3. `localValue` is updated via `v-model`
4. `updateValue()` emits `update:entity` with a new entity object

```text
QInput/QDate → localValue → updateValue → update:entity
```

---

## **🧠 Internal State Management**

```ts
const localValue = ref(props.entity[props.definition.name] ?? null);
```

- Uses a local reactive reference to isolate UI interaction
- Supports `null` as an initial value when the attribute is undefined

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeDateField from '@/components/field/EntityAttributeDateField.vue';

const entity = reactive({
  birthdate: '1990/01/30',
});

const definition = {
  name: 'birthdate',
  input: 'Date',
  type: 'Date',
  required: true,
  hasValidations: true,
  inputSettings: {
    ignoreRules: false,
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeDateField
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

- **Focused responsibility:** Dedicated to date attributes
- **Immutable updates:** Avoids mutating the parent entity directly
- **Localized UI:** Supports multiple translatable UI elements
- **Highly customizable:** Fully integrated with the UI design system
- **Reusable:** Works across modules with different schemas
- **Framework-native:** Built using Vue 3 Composition API and Quasar standards

---

## **🧪 Testing Considerations**

- Verify initial input value matches the entity state
- Assert `update:entity` emission on input changes
- Mock `useScopedI18n` to control translation output
- Shallow mount the component to isolate logic from UI rendering

---

## **📌 Notes**

- The component assumes `definition.input === 'Date'`
- Uses `FieldDateSettings` type for `inputSettings`, which supports `ignoreRules`
- Validation is handled internally using `useQuasarRules` with support for `required` date constraints
- Missing translations safely fall back to default values
- Intended for use via `EntityAttributeField`, not directly in most cases

---

## **🏗️ Architecture Summary**

**EntityAttributeDateField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Rendering the date input with the date-picker
- Managing local UI state
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
