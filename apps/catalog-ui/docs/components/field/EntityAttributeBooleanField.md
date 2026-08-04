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
- Supports disabling the field via `inputSettings.disable`
- Supports an initial state via `inputSettings.defaultValue` when the entity has no value
- Supports storing values other than `true`/`false` via `inputSettings.trueValue` and `inputSettings.falseValue`,
  `defaultValue` accepting the same vocabulary

---

## **⚙️ Props**

The component relies on the shared `AttributeFieldProps` interface with `FieldBooleanSettings`.

| Prop          | Type                                                | Required | Description                                                                  |
| ------------- | --------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                            | Yes      | Identifier used for contextual data                                          |
| `i18nScope`   | `string`                                            | Yes      | I18n scope for localizing the component                                      |
| `uiNamespace` | `string`                                            | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldBooleanSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                           | Yes      | Entity object containing the boolean attribute value                         |
| `ignoreRules` | `boolean`                                           | No       | Indicates whether to bypass validation rules for this field (default: false) |

### AttributeFieldProps Interface

```ts
export interface AttributeFieldProps<T = Record<string, unknown>> extends CommonComponentProps {
  /** Identifier for contextual data. */
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
export interface FieldSettings extends Record<string, unknown> {
  /** Indicates whether to bypass validation rules for this field. */
  ignoreRules?: boolean;

  /** When true, the toggle is rendered as non-interactive (disabled state). */
  disable?: boolean;
}

export interface FieldBooleanSettings extends FieldSettings {
  /**
   * Default value for the boolean field. When provided, this value will be used as the
   * initial state of the field.
   */
  defaultValue?: unknown;

  /**
   * The model value that should be considered as checked/ticked/on.
   * @default true
   */
  trueValue?: unknown;

  /**
   * The model value that should be considered as unchecked/unticked/off.
   * @default false
   */
  falseValue?: unknown;
}
```

`ignoreRules` and `disable` come from the shared `FieldSettings`; `defaultValue`, `trueValue` and
`falseValue` are specific to boolean fields.

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
`${i18nScope}.fields.${definition.name}`;
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

1. The toggle initializes its value from `entity[definition.name]`, falling back to
   `definition.inputSettings.defaultValue`, then to `null`
2. The user toggles the switch
3. `localValue` is updated via `v-model`
4. `updateValue()` emits `update:entity` with a new entity object

```text
QToggle → localValue → updateValue → update:entity
```

---

## **🧠 Internal State Management**

```ts
const localValue = ref(props.entity[props.definition.name] ?? props.definition.inputSettings?.defaultValue ?? null);
```

- Uses a local reactive value to decouple UI interaction from the parent state
- Falls back to `inputSettings.defaultValue` when the entity has no value for the attribute, then to
  `null` when no default is configured
- A `watch` on `() => props.entity[props.definition.name]` keeps `localValue` in sync when the parent updates the entity — it only triggers when the **specific attribute value** changes, not when other fields of the entity change
- The watcher applies the **same fallback chain** as the initialization:

  ```ts
  localValue.value = newValue ?? props.definition.inputSettings?.defaultValue ?? null;
  ```

  Clearing the attribute from the parent therefore restores the configured default rather than
  emptying the toggle.

### **⚠️ Scope of `defaultValue`**

- **The default is displayed, not committed.** It only feeds `localValue`; `update:entity` is emitted
  on user interaction only. A form left untouched submits an entity that still has **no value** for
  the attribute, even though the toggle showed the default. Pre-fill the entity upstream if the value
  must be persisted.
- **The chain is nullish, not falsy.** An entity value of `false` wins over a `defaultValue` of
  `true`, at initialization as well as on every later update. Replacing `??` with `||` would make a
  toggle silently re-check itself each time the parent unchecks it.

---

## **🔀 Stored Values (`trueValue` / `falseValue`)**

Both settings are forwarded to `QToggle`, so the attribute can hold something other than a JavaScript
boolean:

```vue
:true-value="definition.inputSettings?.trueValue" :false-value="definition.inputSettings?.falseValue"
```

```json
{ "trueValue": "Y", "falseValue": "N" }
```

With this configuration, the entity attribute holds `"Y"` or `"N"`; the toggle is rendered checked
when the value equals `trueValue`.

Points to keep in mind:

- **They are data semantics, not styling.** Unlike the other toggle options, they are not part of
  `LinidQToggleProps` and therefore **cannot** be set from `design.json` — only from the attribute
  configuration
- **Omitting them is safe.** The bindings pass `undefined`, and Vue then applies Quasar's own
  defaults: `trueValue: true`, `falseValue: false`. Setting them explicitly to `null` in the JSON is
  a different matter — `null` is not `undefined`, so the default is **not** applied
- **`defaultValue` must use the same vocabulary.** It is typed `unknown`, like `trueValue` and
  `falseValue`, precisely so the three can agree. Configure `{ "trueValue": "Y", "falseValue": "N",
"defaultValue": "Y" }`, not `"defaultValue": true` — the literal `true` would match neither stored
  value and the toggle would render indeterminate
- **An unset attribute renders indeterminate.** With no entity value and no `defaultValue`,
  `localValue` is `null`, which is exactly Quasar's default `indeterminateValue`. The toggle shows
  neither on nor off until the user clicks it

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
    defaultValue: true,
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
- Verify that `localValue` is updated when `entity[definition.name]` changes
- Verify that `localValue` is **not** overwritten when only other entity attributes change (e.g. mutate `name` while keeping the boolean attribute value identical)
- Verify the watcher falls back to `inputSettings.defaultValue` when the attribute becomes `undefined` or `null`, and to `null` when no default is configured
- Verify an attribute value of `false` wins over a `defaultValue` of `true` — the only case that tells `??` from `||`
- Verify the toggle is rendered as disabled when `definition.inputSettings.disable` is `true`

---

## **📌 Notes**

- The component assumes `definition.input === 'Boolean'`
- Uses `FieldBooleanSettings` type for `inputSettings`, which supports the `ignoreRules`, `disable`, `defaultValue`, `trueValue` and `falseValue` properties
- Boolean fields typically don't require validation rules, but validation can be bypassed via the `ignoreRules` prop or `definition.inputSettings.ignoreRules` if needed
- The field is rendered as non-interactive when `definition.inputSettings.disable` is `true`
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
