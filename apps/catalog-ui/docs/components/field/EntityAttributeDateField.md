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
- Applies a configurable date format mask resolved from global i18n translations
- Enables UI customization via the design system
- Supports disabling the field via `inputSettings.disable`

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldDateSettings`.

| Prop          | Type                                             | Required | Description                                                                  |
| ------------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                         | Yes      | Identifier used for contextual data                                          |
| `i18nScope`   | `string`                                         | Yes      | I18n scope for localizing the component                                      |
| `uiNamespace` | `string`                                         | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldDateSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                        | Yes      | Entity object containing the date attribute value                            |
| `ignoreRules` | `boolean`                                        | No       | Indicates whether to bypass validation rules for this field (default: false) |

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

### FieldDateSettings

```ts
export interface FieldDateSettings extends FieldSettings {
  /**
   * Date format mask to be used for displaying and parsing the date value.
   * Can be a Nunjucks template string (e.g. "{{ t('dateFormat') }}")
   * or a static mask (e.g. "YYYY-MM-DD").
   */
  mask?: string;

  /**
   * Constraint options for the date picker (see below).
   */
  options?: FieldDateOptions;

  /** When true, the input is rendered as non-interactive (disabled state). */
  disable?: boolean;
}

export interface FieldDateOptions {
  afterDate?: string | string[]; // Exclusive lower bound(s)
  beforeDate?: string | string[]; // Exclusive upper bound(s)
  fromDate?: string | string[]; // Inclusive lower bound(s)
  upToDate?: string | string[]; // Inclusive upper bound(s)
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
`${i18nScope}.fields.${definition.name}`;
```

### Supported Translation Keys

| Key      | Usage in UI                              |
| -------- | ---------------------------------------- |
| `label`  | Input label                              |
| `hint`   | Helper text                              |
| `prefix` | Input prefix                             |
| `suffix` | Input suffix                             |
| `close`  | Close button label, to close date-picker |

### Date Mask

The date format mask is a computed property resolved via Nunjucks rendering, allowing both static masks and i18n-based templates:

```ts
const mask = computed(() => {
  const rawMask = props.definition.inputSettings?.mask;
  if (!rawMask) return undefined;
  return render<string>(rawMask, { t: (key) => getI18nInstance().global.t(key) });
});
```

This allows the mask to be defined as a static string (e.g. "YYYY-MM-DD") or as a template (e.g. "{{ t('dateFormat') }}"). If `mask` is not defined, Quasar's default mask is used (YYYY/MM/DD).

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
- Props type: `LinidQInputProps`, `LinidQBtnProps`, `LinidQInputProps` and `LinidQDateProps`

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

The component implements automatic validation based on the attribute's `inputSettings`, the `definition.required` property, and the `definition.hasValidations` property, **plus all date constraints defined in `options`**.

### Validation Rules

Validation rules are dynamically generated:

- `required` (if applicable)
- `validDate(mask)` (always)
- `afterDate`, `beforeDate`, `fromDate`, `upToDate` (if corresponding options are set)
- `validateFromApi` (if `definition.hasValidations` is `true`)

Example:

```ts
const rules = computed(() => {
  if (props.ignoreRules || props.definition.inputSettings?.ignoreRules) return [];
  const rules = [validDate(mask.value)];
  if (props.definition.required) rules.unshift(required);

  // Date constraints are processed via a table-driven approach
  const rulesFromConstraints: ValidationRule[] = dateConstraints.value?.map(({ dateRef, validator }) => validator(dateRef as string, mask.value)) ?? [];

  if (props.definition.hasValidations) {
    rulesFromConstraints.push(validateFromApi(props.instanceId, props.definition.name));
  }
  return [...rules, ...rulesFromConstraints];
});
```

### Supported Validation Types

| Setting          | Description                                                                          | Example                |
| ---------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| `required`       | Marks the field as mandatory. Setting comes from the `definition.required` property. | `required: true`       |
| `validDate`      | Ensures the value is a valid date (with mask)                                        |                        |
| `afterDate`      | Value must be strictly after the given date(s)                                       | `afterDate: '...'`     |
| `beforeDate`     | Value must be strictly before the given date(s)                                      | `beforeDate: '...'`    |
| `fromDate`       | Value must be on or after the given date(s)                                          | `fromDate: '...'`      |
| `upToDate`       | Value must be on or before the given date(s)                                         | `upToDate: '...'`      |
| `hasValidations` | Appends an API-backed validation rule (`validateFromApi`) when `true`                | `hasValidations: true` |
| `ignoreRules`    | Bypass validation when set to `true`                                                 | `ignoreRules: true`    |

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` est `true`, no validation is performed
- Validation messages are automatically translated using the instance's i18n scope

---

## **🔁 Data Flow & Dynamic Rendering**

1. Initial value is read from `entity[definition.name]`
2. The mask and all options are rendered via Nunjucks with context `{ entity, today, t }`
3. User edits the input field or the date-picker
4. `localValue` is updated via `v-model`
5. `updateValue()` emits `update:entity` with a new entity object

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
- A `watch` on `() => props.entity[props.definition.name]` keeps `localValue` in sync when the parent updates the entity — it only triggers when the **specific attribute value** changes, not when other fields of the entity change

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
    mask: "{{ t('dateFormat') }}",
    options: {
      afterDate: '{{ entity.startDate }}',
      upToDate: '{{ today }}',
    },
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
- Mock `getI18nInstance` to control mask key resolution
- Shallow mount the component to isolate logic from UI rendering
- Verify that `localValue` is updated when `entity[definition.name]` changes
- Verify that `localValue` is **not** overwritten when only other entity attributes change (e.g. mutate `name` while keeping the date attribute value identical)
- Verify that `validateFromApi` is called with the correct `instanceId` and `definition.name` when `hasValidations` is `true`
- Verify the input is rendered as disabled when `definition.inputSettings.disable` is `true`

---

## **📌 Notes**

- The component assumes `definition.input === 'Date'`
- Uses `FieldDateSettings` for `inputSettings`, which supports `mask`, `options`, `ignoreRules`, and `disable`
- The date format mask is a Nunjucks-rendered string from `inputSettings.mask`; if absent or falsy, `mask` returns `undefined` and Quasar's default format (YYYY/MM/DD) is used
- Validation is handled internally using `useQuasarFieldValidation` with support for `required`, date constraints, and API-backed validation (`validateFromApi` when `hasValidations` is `true`)
- The field is rendered as non-interactive when `definition.inputSettings.disable` is `true`
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
