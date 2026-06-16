# **EntityAttributeEmailField 📧**

The **EntityAttributeEmailField** component is a specialized attribute field designed to handle **email address attributes**
within an entity.

It relies on Quasar's `QInput` component (with `type="email"`) and integrates with the LinID design system and scoped
i18n to provide a fully customizable, localized, and reactive email input.

---

## **🎯 Purpose**

- Renders an email attribute using a native email input field
- Synchronizes the input value with the entity model
- Emits normalized entity updates on user input
- Supports scoped translations for labels, hints, prefixes, and suffixes
- Enables UI customization via the design system
- Supports disabling the field via `inputSettings.disable`
- Supports multiple comma-separated email addresses via `inputSettings.multiple`

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldEmailSettings`.

| Prop          | Type                                              | Required | Description                                                                  |
| ------------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                          | Yes      | Identifier used for contextual data                                          |
| `i18nScope`   | `string`                                          | Yes      | I18n scope for localizing the component                                      |
| `uiNamespace` | `string`                                          | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldEmailSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                         | Yes      | Entity object containing the email attribute value                           |
| `ignoreRules` | `boolean`                                         | No       | Indicates whether to bypass validation rules for this field (default: false) |

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

### FieldEmailSettings

`FieldEmailSettings` extends `FieldTextSettings`, which itself extends `FieldSettings`:

```ts
export interface FieldEmailSettings extends FieldTextSettings {
  /**
   * Allows entering multiple comma-separated email addresses.
   * Maps to the native HTML `multiple` attribute on the underlying <input type="email">.
   * @default false
   */
  multiple?: boolean;
}

export interface FieldTextSettings extends FieldSettings {
  /** Minimum length allowed for the input. */
  minLength?: number;

  /** Maximum length allowed for the input. */
  maxLength?: number;

  /** Pattern that the input value must match. */
  pattern?: string;

  /** Indicates whether to bypass validation rules for this field. */
  ignoreRules?: boolean;

  /** When true, the input is rendered as non-interactive (disabled state). */
  disable?: boolean;
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
`${i18nScope}.fields.${definition.name}`;
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
- Input type: `email`
- Props type: `LinidQInputProps`

Example:

```ts
uiNamespace = 'entity-editor'

// Final UI namespace
entity-editor.contactEmail → q-input (type="email")
```

This allows full control over appearance, validation rules, and behavior per attribute.

---

## **✅ Validation**

The component implements automatic validation based on the attribute's `inputSettings`, the `definition.required` property, and the `definition.hasValidations` property.

### Validation Rules

Validation rules are generated automatically using `useQuasarRules`:

```ts
const rules = computed(() => (!props.ignoreRules && !props.definition.inputSettings?.ignoreRules ? useQuasarRules(props.instanceId, props.definition, ['minLength', 'maxLength', 'pattern', 'email'], localI18nScope) : []));
```

### Validation Execution Order

1. **Required validation** (if applicable)
   - If `definition.required` is `true`, this validation is automatically added as the **first rule**

2. **Specific validation rules** (in order)
   - `minLength`, `maxLength`, `pattern`, `email` — in the order specified
   - The `email` rule validates the format of the address at the framework level, independently of the browser's native validation

3. **Backend API validations** (if applicable)
   - If `definition.hasValidations` is `true`, backend validation rules are appended last

### Supported Validation Types

| Setting       | Description                                                                          | Example                          |
| ------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| `required`    | Marks the field as mandatory. Setting comes from the `definition.required` property. | `required: true`                 |
| `minLength`   | Minimum number of characters required                                                | `minLength: 5`                   |
| `maxLength`   | Maximum number of characters allowed                                                 | `maxLength: 254`                 |
| `pattern`     | Regular expression the value must match (e.g. domain restriction)                    | `pattern: '^.+@linagora\\.com$'` |
| `email`       | Validates that the value is a well-formed email address (framework-level rule)       | always active                    |
| `ignoreRules` | Bypass all of the above when set to `true`                                           | `ignoreRules: true`              |

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` is `true`, no validation is performed
- The `email` rule provides a consistent framework-level error message; the browser's native `type="email"` validation is an additional independent layer
- Validation messages are automatically translated using the instance's i18n scope

### Masking

> **Note:** Quasar's `mask` feature is **incompatible with `type="email"`**. Do not use `mask` in `FieldEmailSettings`.

---

## **🔁 Data Flow**

1. Initial value is read from `entity[definition.name]`
2. User edits the input field
3. `localValue` is updated via `v-model`
4. `updateValue()` emits `update:entity` with a new entity object

```text
QInput (email) → localValue → updateValue → update:entity
```

---

## **🧠 Internal State Management**

```ts
const localValue = ref(props.entity[props.definition.name] ?? null);
```

- Uses a local reactive reference to isolate UI interaction
- Supports `null` as an initial value when the attribute is undefined
- A `watch` on `() => props.entity[props.definition.name]` keeps `localValue` in sync when the parent updates the entity — it only triggers when the **specific attribute value** changes, not when other fields of the entity change

---

## **💡 Usage Example**

### Single email address

```vue
<script setup lang="ts">
import EntityAttributeEmailField from '@/components/field/EntityAttributeEmailField.vue';

const entity = reactive({
  contactEmail: 'john.doe@linagora.com',
});

const definition = {
  name: 'contactEmail',
  input: 'Email',
  type: 'String',
  required: true,
  hasValidations: false,
  inputSettings: {
    maxLength: 254,
    pattern: '^.+@linagora\\.com$',
    ignoreRules: false,
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeEmailField
    ui-namespace="entity-editor"
    instance-id="user-1"
    :definition="definition"
    :entity="entity"
    @update:entity="onUpdateEntity"
  />
</template>
```

### Multiple email addresses

```vue
const definition = { name: 'notificationEmails', input: 'Email', type: 'String', required: false, hasValidations: false, inputSettings: { multiple: true, }, };
```

---

## **✅ Advantages**

- **Focused responsibility:** Dedicated to email address attributes
- **Native browser validation:** Leverages `type="email"` for built-in format checking
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
- Verify that `localValue` is updated when `entity[definition.name]` changes
- Verify that `localValue` is **not** overwritten when only other entity attributes change
- Verify the input is rendered as disabled when `definition.inputSettings.disable` is `true`
- Verify the `multiple` attribute is present on the native input when `definition.inputSettings.multiple` is `true`
- Verify `pattern` validation rejects addresses that do not match the configured regex

---

## **📌 Notes**

- The component assumes `definition.input === 'Email'`
- Uses `FieldEmailSettings` type for `inputSettings`, which extends `FieldTextSettings` with a `multiple` property
- The browser provides native email format validation via `type="email"` independently of `useQuasarRules`
- Masking (`mask`) is **not supported** by Quasar for `type="email"` inputs
- `multiple: true` maps to the HTML `multiple` attribute, enabling comma-separated email input; the stored value remains a single string in the entity
- The field is rendered as non-interactive when `definition.inputSettings.disable` is `true`
- Missing translations safely fall back to default values
- Intended for use via `EntityAttributeField`, not directly in most cases

---

## **🏗️ Architecture Summary**

**EntityAttributeEmailField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Rendering the email input
- Managing local UI state
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
