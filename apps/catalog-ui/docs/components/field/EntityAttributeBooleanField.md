# **EntityAttributeBooleanField 🔘**

The **EntityAttributeBooleanField** component is a specialized attribute field responsible for rendering and managing
boolean values within an entity.

It uses Quasar’s `QToggle` component and integrates seamlessly with the LinID design system and scoped i18n to provide a
consistent, configurable, and localized boolean input.

---

## **🎯 Purpose**

- Renders a boolean attribute as a toggle switch
- Synchronizes the toggle state with the entity model
- Emits updates in a controlled, immutable way
- Supports scoped translations for labels
- Integrates UI customization through the design system

---

## **⚙️ Props**

The component relies on the shared `AttributeFieldProps` interface with `FieldBooleanSettings`.

| Prop          | Type                                                | Required | Description                                                                  |
| ------------- | --------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                            | Yes      | Identifier used to scope translations and contextual data                    |
| `uiNamespace` | `string`                                            | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldBooleanSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                           | Yes      | Entity object containing the boolean attribute value                         |
| `ignoreRules` | `boolean`                                           | No       | Indicates whether to bypass validation rules for this field (default: false) |

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

### FieldBooleanSettings

```ts
export interface FieldBooleanSettings extends FieldSettings {
  /** Indicates whether to bypass validation rules for this field. */
  ignoreRules?: boolean;
}
```

---

## **📤 Events**

| Event           | Payload                   | Description                                                     |
| --------------- | ------------------------- | --------------------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | Emitted when the toggle value changes and the entity is updated |

### Event Semantics

- Emits the **entire updated entity object**
- Does **not mutate** the original entity reference
- The parent component remains the single source of truth

---

## **🌍 Internationalization (i18n)**

The component uses `useScopedI18n` to resolve translations for the attribute label.

### Translation Scope

```ts
`${instanceId}.fields.${definition.name}`;
```

### Label Resolution

```ts
:label="translateOrDefault('', 'label')"
```

- Attempts to translate the `label` key within the scoped namespace
- Falls back to an empty string if the translation key does not exist
- Prevents raw translation keys from leaking into the UI

---

## **🎨 UI Customization**

UI customization is handled via the LinID design system and `useUiDesign()`.

### Namespace Resolution

```ts
`${uiNamespace}.${definition.name}`;
```

### Applied Component

- Quasar component: `q-toggle`
- Props resolved as `LinidQToggleProps`

Example:

```ts
uiNamespace = 'entity-editor'

// Final UI namespace
entity-editor.isActive → q-toggle
```

This allows fine-grained styling and behavior customization per attribute.

---

## **🔁 Data Flow**

1. The toggle initializes its value from `entity[definition.name]`
2. The user toggles the switch
3. `localValue` is updated via `v-model`
4. `updateValue()` emits `update:entity` with a new entity object

```text
QToggle → localValue → updateValue → update:entity
```

---

## **🧠 Internal State Management**

```ts
const localValue = ref(props.entity[props.definition.name] ?? null);
```

- Uses a local reactive value to decouple UI interaction from the parent state
- Supports `null` as an initial value when the attribute is undefined

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeBooleanField from '@/components/field/EntityAttributeBooleanField.vue';

const entity = reactive({
  enabled: true,
});

const definition = {
  name: 'enabled',
  input: 'Boolean',
  type: 'Boolean',
  required: false,
  hasValidations: false,
  inputSettings: {
    ignoreRules: false,
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeBooleanField
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

- **Clear responsibility:** Dedicated to boolean attributes only
- **Immutable updates:** Avoids side effects by emitting new entity objects
- **Localized:** Fully supports scoped translations
- **Customizable:** Integrates with the UI design system
- **Reusable:** Works in any context with a compatible attribute definition
- **Framework-aligned:** Built with Vue 3 Composition API and Quasar best practices

---

## **🧪 Testing Considerations**

- Verify the initial toggle state reflects the entity value
- Assert `update:entity` emission when the toggle changes
- Mock `useScopedI18n` and `useUiDesign` for isolated unit tests
- UI rendering can be shallow-mounted since behavior is event-driven

---

## **📌 Notes**

- The component assumes `definition.input === 'Boolean'`
- Uses `FieldBooleanSettings` type for `inputSettings`, which supports the `ignoreRules` property
- Boolean fields typically don't require validation rules, but validation can be bypassed via the `ignoreRules` prop or `definition.inputSettings.ignoreRules` if needed
- Translation keys are optional and safely fallback
- Designed to be used exclusively through `EntityAttributeField`

---

## **🏗️ Architecture Summary**

**EntityAttributeBooleanField** is a **leaf component** in the attribute rendering hierarchy.

It focuses exclusively on:

- UI rendering (`QToggle`)
- Local state handling
- Emitting normalized entity updates

All orchestration, validation, and schema logic remains outside, ensuring a clean and scalable architecture.
