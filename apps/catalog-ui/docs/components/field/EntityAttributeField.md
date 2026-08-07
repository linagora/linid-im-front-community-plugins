# **EntityAttributeField 🧩**

The **EntityAttributeField** component is a dynamic field renderer responsible for displaying and managing a single
attribute of an entity based on its definition.

It acts as a **dispatcher component** that selects and loads the appropriate attribute field implementation
(Boolean, Number, Text, TextArea, Date, List, DynamicList, Email, etc.) and propagates entity updates upward.

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

| Prop           | Type                             | Required | Description                                                                                                                              |
| -------------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `instanceId`   | `string`                         | Yes      | Identifier used for contextual data                                                                                                      |
| `i18nScope`    | `string`                         | Yes      | I18n scope for localizing the component                                                                                                  |
| `uiNamespace`  | `string`                         | Yes      | Base UI design namespace for styling                                                                                                     |
| `definition`   | `LinidAttributeConfiguration<T>` | Yes      | Attribute definition describing type, input, and configuration                                                                           |
| `entity`       | `Record<string, unknown>`        | Yes      | Entity object containing the attribute value                                                                                             |
| `ignoreRules`  | `boolean`                        | No       | Indicates whether to bypass validation rules for this field (default: false)                                                             |
| `emitOnUpdate` | `string`                         | No       | When set, broadcasts an event on `uiEventSubject` with this value as the key on every entity update. When absent, no event is broadcast. |

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

  /**
   * When set, the component broadcasts an event on `uiEventSubject` with this key
   * whenever the entity is updated. When absent, no event is broadcast.
   */
  emitOnUpdate?: string;
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

| Input Type    | Loaded Component                  |
| ------------- | --------------------------------- |
| `Boolean`     | `EntityAttributeBooleanField`     |
| `Number`      | `EntityAttributeNumberField`      |
| `Text`        | `EntityAttributeTextField`        |
| `Date`        | `EntityAttributeDateField`        |
| `List`        | `EntityAttributeListField`        |
| `DynamicList` | `EntityAttributeDynamicListField` |
| `TextArea`    | `EntityAttributeTextAreaField`    |
| `Email`       | `EntityAttributeEmailField`       |

Components are **lazy-loaded** using `defineAsyncComponent` to reduce initial
bundle size.

```ts
const field = computed(() => fieldTypes[props.definition.input]);
```

If the input type is unknown or unsupported, nothing is rendered.

### Validation

Validation is **not handled directly by EntityAttributeField**. Instead:

- Each child field component (Boolean, Number, Text, Date, List) manages its own validation
- Validation can be bypassed via the `ignoreRules` prop or `definition.inputSettings.ignoreRules`
- Validation rules are generated by each field using `useQuasarRules` based on the attribute configuration
- Supported validation types depend on the field type (e.g., `min`/`max` for numbers, `minLength`/`maxLength`/`pattern` for text and textarea, `unique` for dynamic list fields)

### Disabled state

The `disable` property in `inputSettings` is **not handled by EntityAttributeField** — it is read directly by each child field component, which passes it to the underlying Quasar element as `:disable`. No extra wiring is required at the dispatcher level.

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

## **🧭 Nested Attributes**

The attribute `name` in the definition supports **dot notation** to manage values located inside sub-objects of the entity:

```json
{
  "name": "extraParameters.login",
  "input": "Text"
}
```

With the entity:

```json
{
  "extraParameters": {
    "login": "john.doe",
    "role": "admin"
  }
}
```

All field types (`Text`, `Number`, `Boolean`, `Date`, `List`, `DynamicList`, `TextArea`, `Email`) support nested attributes:

- The initial value is read from the nested path
- Updating the value rewrites only the targeted nested property, preserving the rest of the entity structure
- Missing intermediate objects are created when updating; intermediate values that are not objects are replaced by objects
- The `update:entity` event still emits the **complete** updated entity object

Multiple nesting levels are supported (e.g. `address.company.name`).

---

## **🔁 Data Flow**

1. The correct attribute field component is rendered dynamically
2. The field component manages its own local value
3. On change, the field emits `update:entity`
4. `EntityAttributeField` re-emits the event to the parent
5. If `emitOnUpdate` is set, it also publishes the updated entity to the `uiEventSubject` UI event bus from corelib, using `emitOnUpdate` as the event key
6. The parent component updates the source of truth

```text
Field Component → EntityAttributeField → Parent
                         ↓ (only when emitOnUpdate is set)
                  uiEventSubject (UI event bus, key: emitOnUpdate)
```

The `uiEventSubject` broadcast is opt-in via `emitOnUpdate`. This prevents unintended cross-component side effects (e.g. keystrokes in a dialog propagating to another component's list) when the prop is not set. When set, it allows federated plugins and cross-component listeners to react to entity attribute changes without requiring a direct parent–child relationship.

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeField from '@/components/field/EntityAttributeField.vue';

const entity = reactive({
  enabled: true,
  age: 30,
});

const booleanDefinition = {
  name: 'enabled',
  input: 'Boolean',
  type: 'Boolean',
  required: false,
  hasValidations: false,
  inputSettings: {
    ignoreRules: false,
  },
};

const numberDefinition = {
  name: 'age',
  input: 'Number',
  type: 'Number',
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
  <EntityAttributeField
    ui-namespace="entity-editor"
    instance-id="user-1"
    :definition="booleanDefinition"
    :entity="entity"
    @update:entity="onUpdateEntity"
  />

  <EntityAttributeField
    ui-namespace="entity-editor"
    instance-id="user-1"
    :definition="numberDefinition"
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
