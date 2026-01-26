# **EntityAttributeTextField ✏️**

The **EntityAttributeTextField** component is a specialized attribute field designed to handle **text-based attributes**
within an entity.

It relies on Quasar’s `QInput` component and integrates with the LinID design system and scoped i18n to provide a fully
customizable, localized, and reactive text input.

---

## **🎯 Purpose**

- Renders a text attribute using a standard input field
- Synchronizes the input value with the entity model
- Emits normalized entity updates on user input
- Supports scoped translations for labels, hints, prefixes, and suffixes
- Enables UI customization via the design system

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldTextSettings`.

| Prop          | Type                                             | Required | Description                                                                  |
| ------------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                         | Yes      | Identifier used to scope translations and contextual data                    |
| `uiNamespace` | `string`                                         | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldTextSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                        | Yes      | Entity object containing the text attribute value                            |
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

### FieldTextSettings

```ts
export interface FieldTextSettings extends FieldSettings {
  /** Minimum length allowed for the input. */
  minLength?: number;

  /** Maximum length allowed for the input. */
  maxLength?: number;

  /** Pattern that the input value must match. */
  pattern?: string;

  /** Indicates whether to bypass validation rules for this field. */
  ignoreRules?: boolean;
}
```

---

## **📤 Events**

| Event           | Payload                   | Description                                                    |
| --------------- | ------------------------- | -------------------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | Emitted when the input value changes and the entity is updated |

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
| `label`  | Input label  |
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

- Quasar component: `q-input`
- Props type: `LinidQInputProps`

Example:

```ts
uiNamespace = 'entity-editor'

// Final UI namespace
entity-editor.username → q-input
```

This allows full control over appearance, validation rules, and behavior per attribute.

---

## **✅ Validation**

The component implements automatic validation based on the attribute's `inputSettings`, the `definition.required` property, and the `definition.hasValidations` property.

### Validation Rules

Validation rules are generated automatically using `useQuasarRules`:

```ts
const rules = computed(() => (!props.ignoreRules && !props.definition.inputSettings?.ignoreRules ? useQuasarRules(props.instanceId, props.definition, ['minLength', 'maxLength', 'pattern']) : []));
```

### Validation Execution Order

The validation rules are executed in a specific order to ensure proper validation flow:

1. **Required validation** (if applicable)
   - Depends on the `definition.required` property
   - If `definition.required` is `true`, this validation is automatically added as the **first rule** in the validation chain
   - Ensures that the field is not empty before proceeding to other validations

2. **Specific validation rules** (in order)
   - The rules specified in the `useQuasarRules` parameters (currently `['minLength', 'maxLength', 'pattern']` for text fields)
   - These rules are executed **in the order specified** in the array
   - Execute **after** the required validation (if present)

3. **Backend API validations** (if applicable)
   - Depends on the `definition.hasValidations` property
   - If `definition.hasValidations` is `true`, backend validation rules are added
   - These validations are executed **last**, after all client-side validations pass
   - Used for server-side validation logic (e.g., checking uniqueness, business rules)

### Supported Validation Types

| Setting       | Description                                                                          | Example                      |
| ------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| `required`    | Marks the field as mandatory. Setting comes from the `definition.required` property. | `required: true`             |
| `minLength`   | Minimum number of characters required                                                | `minLength: 3`               |
| `maxLength`   | Maximum number of characters allowed                                                 | `maxLength: 50`              |
| `pattern`     | Regular expression the value must match                                              | `pattern: '^[a-zA-Z0-9_]+$'` |
| `ignoreRules` | Bypass validation when set to `true`                                                 | `ignoreRules: true`          |

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` est `true`, no validation is performed
- Validation messages are automatically translated using the instance's i18n scope

---

## **🔁 Data Flow**

1. Initial value is read from `entity[definition.name]`
2. User edits the input field
3. `localValue` is updated via `v-model`
4. `updateValue()` emits `update:entity` with a new entity object

```text
QInput → localValue → updateValue → update:entity
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
import EntityAttributeTextField from '@/components/field/EntityAttributeTextField.vue';

const entity = reactive({
  username: 'john.doe',
});

const definition = {
  name: 'username',
  input: 'Text',
  type: 'String',
  required: true,
  hasValidations: true,
  inputSettings: {
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_]+$',
    ignoreRules: false,
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeTextField
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

- **Focused responsibility:** Dedicated to text attributes
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

- The component assumes `definition.input === 'Text'`
- Uses `FieldTextSettings` type for `inputSettings`, which supports `minLength`, `maxLength`, `pattern`, and `ignoreRules`
- Validation is handled internally using `useQuasarRules` and can be configured via `inputSettings`
- Missing translations safely fall back to default values
- Intended for use via `EntityAttributeField`, not directly in most cases

---

## **🏗️ Architecture Summary**

**EntityAttributeTextField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Rendering the text input
- Managing local UI state
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
