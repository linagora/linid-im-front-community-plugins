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

The component uses the shared `AttributeFieldProps` interface.

| Prop          | Type                          | Required | Description                                               |
| ------------- | ----------------------------- | -------- | --------------------------------------------------------- |
| `instanceId`  | `string`                      | Yes      | Identifier used to scope translations and contextual data |
| `uiNamespace` | `string`                      | Yes      | Base UI design namespace for styling                      |
| `definition`  | `LinidAttributeConfiguration` | Yes      | Attribute definition (name, type, input configuration)    |
| `entity`      | `Record<string, unknown>`     | Yes      | Entity object containing the text attribute value         |

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
  hasValidations: false,
  inputSettings: {},
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
- Validation rules are expected to be handled externally
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
