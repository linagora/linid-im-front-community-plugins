# **EntityAttributeField 🧩**

The **EntityAttributeField** component is a dynamic field renderer responsible for displaying and managing a single
attribute of an entity based on its definition.

It acts as a **dispatcher component** that selects and loads the appropriate attribute field implementation
(Boolean, Number, Text, etc.) and propagates entity updates upward.

---

## **🎯 Purpose**

- Dynamically renders the correct attribute field component based on configuration
- Centralizes attribute field selection logic
- Ensures consistent data flow for entity updates
- Decouples entity attribute definitions from UI implementation
- Supports lazy-loading of field components for optimal performance

---

## **⚙️ Props**

The component accepts all props defined by `AttributeFieldProps`.

| Prop          | Type                          | Required | Description                                                    |
| ------------- | ----------------------------- | -------- | -------------------------------------------------------------- |
| `instanceId`  | `string`                      | Yes      | Identifier used to scope translations and contextual data      |
| `uiNamespace` | `string`                      | Yes      | Base UI design namespace for styling                           |
| `definition`  | `LinidAttributeConfiguration` | Yes      | Attribute definition describing type, input, and configuration |
| `entity`      | `Record<string, unknown>`     | Yes      | Entity object containing the attribute value                   |

### AttributeFieldProps Interface

```ts
export interface AttributeFieldProps extends CommonComponentProps {
  /** Identifier of the instance used to scope translations and contextual data. */
  instanceId: string;

  /** Attribute configuration describing how the field should be rendered. */
  definition: LinidAttributeConfiguration;

  /** Entity object holding the attribute value. */
  entity: Record<string, unknown>;
}
```

---

## **📤 Events**

| Event           | Payload                   | Description                                                        |
| --------------- | ------------------------- | ------------------------------------------------------------------ |
| `update:entity` | `Record<string, unknown>` | Emitted when the attribute value changes and the entity is updated |

### Event Contract

- The event emits the **entire updated entity object**
- The parent component is responsible for persisting or reacting to the change
- The component does **not mutate the entity directly**

```ts
interface EntityAttributeFieldOutputs {
  'update:entity': [Record<string, unknown>];
}
```

---

## **🧠 Internal Behavior**

### Dynamic Component Resolution

The component determines which field component to render based on
`definition.input`:

| Input Type | Loaded Component              |
| ---------- | ----------------------------- |
| `Boolean`  | `EntityAttributeBooleanField` |
| `Number`   | `EntityAttributeNumberField`  |
| `Text`     | `EntityAttributeTextField`    |

Components are **lazy-loaded** using `defineAsyncComponent` to reduce initial
bundle size.

```ts
const input = computed(() => inputTypes[props.definition.input]);
```

If the input type is unknown or unsupported, nothing is rendered.

---

## **🎨 UI Customization**

The component integrates with the LinID design system via `uiNamespace`.

### Namespace Resolution

The following namespace is passed down to the rendered field:

```ts
`${uiNamespace}.EntityAttributeField`;
```

Each concrete attribute field component can further scope its own UI rules.

Example:

```ts
uiNamespace = 'entity-editor';

// Final namespace used by child field
`entity-editor.EntityAttributeField`;
```

---

## **🔁 Data Flow**

1. The correct attribute field component is rendered dynamically
2. The field component manages its own local value
3. On change, the field emits `update:entity`
4. `EntityAttributeField` re-emits the event unchanged
5. The parent component updates the source of truth

```text
Field Component → EntityAttributeField → Parent
```

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeField from '@/components/field/EntityAttributeField.vue';

const entity = reactive({
  enabled: true,
});

const definition = {
  name: 'enabled',
  input: 'Boolean',
  type: 'Boolean',
  required: false,
  hasValidations: false,
  inputSettings: {},
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeField
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

- **Single responsibility:** Only handles field selection and event propagation
- **Extensible:** New field types can be added without modifying consumers
- **Lazy-loaded:** Optimized for performance
- **Type-safe:** Strongly typed props and emitted events
- **Composable-friendly:** Works seamlessly with scoped i18n and UI design system
- **Framework-aligned:** Built for Vue 3 + Quasar best practices

---

## **🧪 Testing**

- Dynamic rendering can be tested by changing `definition.input`
- Event emission is fully testable via `wrapper.emitted('update:entity')`
- UI logic is delegated to child components, simplifying unit tests

---

## **📌 Notes**

- The component does **not render any UI by itself**
- All validation, formatting, and user interaction logic lives in field-specific components
- If `definition.input` does not match a registered field type, nothing is rendered
- Ideal for entity editors, forms driven by metadata, and dynamic schemas

---

## **🏗️ Architecture Summary**

**EntityAttributeField** acts as a **field orchestrator**, not a form control.
It enforces a clean separation between:

- **Schema (definition)**
- **Data (entity)**
- **Rendering (field components)**

This design enables scalable, metadata-driven form architectures across the application.
