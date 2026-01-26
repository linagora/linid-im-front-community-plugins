# **EntityAttributeNumberField 🔢**

The **EntityAttributeNumberField** component is a specialized attribute field dedicated to handling **numeric attributes**
within an entity.

It is built on Quasar’s `QInput` component configured for numeric input and integrates with the LinID design system and
scoped i18n to provide a consistent, localized, and customizable number field.

---

## **🎯 Purpose**

- Renders a numeric attribute using a number input
- Automatically casts user input to a number
- Synchronizes the numeric value with the entity model
- Emits normalized entity updates on value changes
- Supports scoped translations for labels and helper texts
- Enables UI customization through the design system

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldNumberSettings`.

| Prop          | Type                                               | Required | Description                                                                  |
| ------------- | -------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                           | Yes      | Identifier used to scope translations and contextual data                    |
| `uiNamespace` | `string`                                           | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldNumberSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                          | Yes      | Entity object containing the numeric attribute value                         |
| `ignoreRules` | `boolean`                                          | No       | Indicates whether to bypass validation rules for this field (default: false) |

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

### FieldNumberSettings

```ts
export interface FieldNumberSettings extends FieldSettings {
  /** Minimum value allowed for the input. */
  min?: number;

  /** Maximum value allowed for the input. */
  max?: number;

  /** Indicates whether to bypass validation rules for this field. */
  ignoreRules?: boolean;
}
```

---

## **📤 Events**

| Event           | Payload                   | Description                                                      |
| --------------- | ------------------------- | ---------------------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | Emitted when the numeric value changes and the entity is updated |

### Event Semantics

- Emits a **new entity object** with the updated numeric value
- Avoids mutating the original entity reference
- Keeps state ownership in the parent component

---

## **🌍 Internationalization (i18n)**

The component uses `useScopedI18n` to resolve translations for UI text elements.

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
- Falls back to the provided default value when missing
- Prevents untranslated keys from appearing in the UI

---

## **🎨 UI Customization**

UI customization is handled through the LinID design system via `useUiDesign()`.

### Namespace Resolution

```ts
`${uiNamespace}.${definition.name}`;
```

### Applied Component

- Quasar component: `q-input`
- Input type: `number`
- Props type: `LinidQInputProps`

Example:

```ts
uiNamespace = 'entity-editor'

// Final UI namespace
entity-editor.age → q-input (type="number")
```

This allows precise styling and behavior customization per numeric attribute.

---

## **✅ Validation**

The component implements automatic validation based on the attribute's `inputSettings`, the `definition.required` property, and the `definition.hasValidations` property.

### Validation Rules

Validation rules are generated automatically using `useQuasarRules`:

```ts
const rules = computed(() => (!props.ignoreRules && !props.definition.inputSettings?.ignoreRules ? useQuasarRules(props.instanceId, props.definition, ['min', 'max']) : []));
```

### Validation Execution Order

The validation rules are executed in a specific order to ensure proper validation flow:

1. **Required validation** (if applicable)
   - Depends on the `definition.required` property
   - If `definition.required` is `true`, this validation is automatically added as the **first rule** in the validation chain
   - Ensures that the field is not empty before proceeding to other validations

2. **Specific validation rules** (in order)
   - The rules specified in the `useQuasarRules` parameters (currently `['min', 'max']` for number fields)
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
| `min`         | Minimum value allowed                                                                | `min: 0`            |
| `max`         | Maximum value allowed                                                                | `max: 100`          |
| `ignoreRules` | Bypass validation when set to `true`                                                 | `ignoreRules: true` |

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` est `true`, no validation is performed
- Validation messages are automatically translated using the instance's i18n scope

---

## **🔁 Data Flow**

1. Initial value is read from `entity[definition.name]`
2. User enters a numeric value
3. `v-model.number` casts the input to a number
4. `localValue` updates reactively
5. `updateValue()` emits `update:entity` with a new entity object

```text
QInput (number) → localValue → updateValue → update:entity
```

---

## **🧠 Internal State Management**

```ts
const localValue = ref(props.entity[props.definition.name] ?? null);
```

- Maintains a local reactive copy of the attribute value
- Supports `null` when the numeric attribute is initially undefined

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeNumberField from '@/components/field/EntityAttributeNumberField.vue';

const entity = reactive({
  age: 30,
});

const definition = {
  name: 'age',
  input: 'Number',
  type: 'Integer',
  required: true,
  hasValidations: true,
  inputSettings: {
    min: 18,
    max: 120,
    ignoreRules: false,
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeNumberField
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

- **Type-aware input:** Ensures values are treated as numbers
- **Immutable updates:** Emits new entity objects instead of mutating state
- **Localized UI:** Fully supports scoped translations
- **Customizable:** Integrates with the UI design system
- **Reusable:** Works with any numeric attribute definition
- **Framework-aligned:** Built with Vue 3 Composition API and Quasar best practices

---

## **🧪 Testing Considerations**

- Verify numeric casting via `v-model.number`
- Assert `update:entity` emission on value change
- Mock `useScopedI18n` to control translated output
- Shallow mount the component to isolate behavior from UI rendering

---

## **📌 Notes**

- The component assumes `definition.input === 'Number'`
- Uses `FieldNumberSettings` type for `inputSettings`, which supports `min`, `max`, and `ignoreRules`
- Validation is handled internally using `useQuasarRules` and can be configured via `inputSettings`
- Missing translations gracefully fall back to default values
- Intended for use via `EntityAttributeField` in most scenarios

---

## **🏗️ Architecture Summary**

**EntityAttributeNumberField** is a **leaf component** in the entity attribute rendering system.

Its sole responsibilities are:

- Rendering a numeric input
- Managing local numeric state
- Emitting normalized entity updates

All higher-level concerns such as validation, layout, and schema orchestration are delegated to parent components, ensuring a clean and scalable architecture.
